import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SessionRequest {
  studentId?: string;
  targetRole: string;
  jobId?: string;
  resumeId?: string;
  topics?: string[];
  difficulty?: string;
  durationMinutes?: number;
  experienceLevel?: string;
  companyType?: string;
  targetCompany?: string;
  customInstructions?: string;
  focusAreas?: string[];
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  targetRole: string;
}

interface ResumeInfo {
  parsedText: string;
  keySkills: string[];
  pdfUrl: string;
}

interface JobInfo {
  title: string;
  company: string;
  minimumThresholdScore: number;
}

interface RoomMetadata {
  interviewId: string;
  student: StudentInfo;
  resume: ResumeInfo;
  job: JobInfo | null;
  focusAreas: string[];
  config: SessionRequest;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // --- JWT verification ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Service-role client for DB writes and storage access
    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Verify the JWT and extract the user
    const { data: userData, error: userError } = await serviceClient.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const jwtUserId = userData.user.id;
    const jwtEmail = userData.user.email || "";

    // --- Parse request body ---
    const body: SessionRequest = await req.json();

    if (!body.targetRole || body.targetRole.trim() === "") {
      return new Response(
        JSON.stringify({ error: "targetRole is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optional consistency check: if studentId is provided, it must match the JWT sub
    if (body.studentId && body.studentId !== jwtUserId) {
      return new Response(
        JSON.stringify({ error: "studentId does not match authenticated user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Fetch student profile ---
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, email, display_name, role, github_username, linkedin_url, resume_pdf_path, linkedin_pdf_path")
      .eq("id", jwtUserId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Student profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const studentName = profile.display_name || jwtEmail;

    // --- Fetch resume from private storage ---
    let resumeInfo: ResumeInfo = {
      parsedText: "",
      keySkills: [],
      pdfUrl: "",
    };

    if (profile.resume_pdf_path) {
      // Create a short-lived signed URL (valid for 30 minutes) for the worker to download
      const { data: signedUrlData } = await serviceClient
        .storage
        .from("candidate-documents")
        .createSignedUrl(profile.resume_pdf_path, 1800);

      const signedUrl = signedUrlData?.signedUrl || "";

      resumeInfo = {
        parsedText: body.resumeId ? `Resume reference: ${body.resumeId}` : "",
        keySkills: [],
        pdfUrl: signedUrl,
      };
    }

    // --- Fetch job info if jobId is provided ---
    let jobInfo: JobInfo | null = null;
    if (body.jobId) {
      const { data: job } = await serviceClient
        .from("jobs")
        .select("title, company, minimum_threshold_score")
        .eq("id", body.jobId)
        .maybeSingle();

      if (job) {
        jobInfo = {
          title: job.title,
          company: job.company,
          minimumThresholdScore: job.minimum_threshold_score || 70,
        };
      }
    }

    // --- Generate interview ID and room name ---
    const timestamp = Date.now();
    const interviewId = `intv_${timestamp}`;
    const roomName = `interview_${jwtUserId.slice(0, 8)}_${timestamp}`;

    // --- Build focus areas ---
    const focusAreas = body.focusAreas || body.topics || [];

    // --- Build room metadata ---
    const roomMetadata: RoomMetadata = {
      interviewId,
      student: {
        id: jwtUserId,
        name: studentName,
        email: jwtEmail,
        targetRole: body.targetRole,
      },
      resume: resumeInfo,
      job: jobInfo,
      focusAreas,
      config: body,
    };

    const metadataJson = JSON.stringify(roomMetadata);

    // --- Create the interview session record in the database ---
    const { error: insertError } = await serviceClient
      .from("interview_sessions")
      .insert({
        id: interviewId,
        user_id: jwtUserId,
        livekit_room_name: roomName,
        target_role: body.targetRole,
        job_id: body.jobId || null,
        resume_id: body.resumeId || null,
        config: body,
        room_metadata: roomMetadata,
        status: "created",
      });

    if (insertError) {
      console.error("Failed to insert interview session:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to create interview session record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Create LiveKit room and generate participant token ---
    const livekitUrl = Deno.env.get("LIVEKIT_URL") || "";
    const liveKitApiKey = Deno.env.get("LIVEKIT_API_KEY") || "";
    const liveKitApiSecret = Deno.env.get("LIVEKIT_API_SECRET") || "";

    if (!livekitUrl || !liveKitApiKey || !liveKitApiSecret) {
      // LiveKit credentials not configured — return the interview record
      // so the frontend can show a graceful message
      console.error("LiveKit environment variables not configured");
      return new Response(
        JSON.stringify({
          error: "LiveKit is not configured. Set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET as edge function secrets.",
          interviewId,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate LiveKit access token using the server SDK
    const { AccessToken: LiveKitAccessToken, RoomServiceClient } = await import("npm:livekit-server-sdk@2.0.5");

    // Create the room with metadata
    const roomService = new RoomServiceClient(livekitUrl, liveKitApiKey, liveKitApiSecret);

    try {
      await roomService.createRoom({
        name: roomName,
        metadata: metadataJson,
        emptyTimeout: 600, // 10 minutes empty timeout
        maxParticipants: 2, // student + worker
      });
    } catch (roomErr) {
      // Room might already exist — try updating metadata
      console.error("Room creation attempt:", roomErr);
      try {
        await roomService.updateRoomMetadata(roomName, metadataJson);
      } catch (updateErr) {
        console.error("Room metadata update attempt:", updateErr);
      }
    }

    // Generate the student participant token
    const livekitToken = new LiveKitAccessToken(liveKitApiKey, liveKitApiSecret, {
      identity: `student_${jwtUserId}`,
      name: studentName,
      metadata: JSON.stringify({ interviewId, role: "student" }),
      ttl: 30 * 60, // 30 minutes
    });

    livekitToken.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await livekitToken.toJwt();

    // Update session status to 'active'
    await serviceClient
      .from("interview_sessions")
      .update({ status: "active", started_at: new Date().toISOString() })
      .eq("id", interviewId);

    // --- Return the session response ---
    return new Response(
      JSON.stringify({
        serverUrl: livekitUrl,
        roomName,
        token,
        interviewId,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("interview-session error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

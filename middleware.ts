import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Next.js Middleware — Server-Side Route Protection
 *
 * This is the FIRST line of defence. It runs on the edge BEFORE any page
 * renders, so protected pages never even load if the user is unauthenticated.
 * The client-side AuthGuard component is the second, redundant layer.
 *
 * Rules:
 *  - /admin/*    → must be authenticated AND have role = 'admin'
 *  - /(student)/* (i.e. /dashboard, /interview, /applications, /jobs, /resources)
 *                → must be authenticated (role check done by AuthGuard)
 *  - /signin, /signup → redirect to /dashboard if already logged in
 *  - /api/livekit/* → must be authenticated (JWT check done inside the route)
 *  - Everything else → pass through
 */

const PROTECTED_STUDENT_PATHS = [
  '/dashboard',
  '/interview',
  '/applications',
  '/jobs',
  '/resources',
];

const PROTECTED_ADMIN_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Determine if this path needs protection ──────────────────────────────
  const isStudentPath = PROTECTED_STUDENT_PATHS.some((p) => pathname.startsWith(p));
  const isAdminPath = PROTECTED_ADMIN_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = pathname === '/signin' || pathname === '/signup';

  // Public paths and API routes pass through without auth check
  if (!isStudentPath && !isAdminPath && !isAuthPage) {
    return NextResponse.next();
  }

  // ── Read the Supabase session from cookies ────────────────────────────────
  // We use the service role key here so we can validate the token server-side.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    // If env is misconfigured, fail open for public pages, fail closed for protected
    if (isStudentPath || isAdminPath) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  // Extract the Supabase access token from the cookie Supabase sets automatically
  // Cookie name pattern: sb-<project-ref>-auth-token
  const cookieHeader = request.cookies;
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  const cookieName = projectRef ? `sb-${projectRef}-auth-token` : null;
  const rawCookie = cookieName ? cookieHeader.get(cookieName)?.value : null;

  let session: { access_token: string; user: { id: string } } | null = null;

  if (rawCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(rawCookie));
      // Supabase stores the session as [sessionObject] in some versions
      session = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      session = null;
    }
  }

  const isAuthenticated = !!session?.access_token;

  // ── Redirect already-logged-in users away from auth pages ────────────────
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ── Redirect unauthenticated users to sign in ─────────────────────────────
  if ((isStudentPath || isAdminPath) && !isAuthenticated) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // ── Admin path: verify role via DB lookup ─────────────────────────────────
  if (isAdminPath && isAuthenticated && session) {
    try {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', session.user?.id)
        .maybeSingle();

      if (data?.role !== 'admin') {
        // Authenticated but not admin — redirect to student dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      // On DB error, deny access to admin paths
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (Next.js static files)
     * - _next/image (Next.js image optimization)
     * - favicon.ico
     * - Public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

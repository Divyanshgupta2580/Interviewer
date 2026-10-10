export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export type InterviewType =
  | 'technical'
  | 'coding'
  | 'hr'
  | 'behavioral'
  | 'system_design'
  | 'role_specific'
  | 'custom';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'adaptive';

export type ExperienceLevel = 'internship' | 'entry_level' | 'one_to_three' | 'three_plus';

export type CompanyType = 'product_based' | 'startup' | 'service_based' | 'other';

export type SessionStatus = 'configured' | 'in_progress' | 'completed' | 'abandoned';

export interface InterviewConfig {
  type: InterviewType;
  targetRole: string;
  topics: string[];
  customInstructions?: string;
  difficulty: Difficulty;
  experienceLevel: ExperienceLevel;
  durationMinutes: number;
  targetCompany?: string;
  companyType?: CompanyType;
  jobDescription?: string;
  resumeContext?: string;
}

export interface InterviewQuestion {
  id: string;
  topic: string;
  questionText: string;
  questionType: 'open_ended' | 'coding' | 'system_design' | 'behavioral';
  expectedConcepts?: string[];
}

export interface QuestionAnswer {
  questionId: string;
  answerText: string;
  submittedAt: string;
}

export interface QuestionFeedback {
  questionId: string;
  score: number;
  technicalCorrectness: number;
  answerClarity: number;
  communicationQuality: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  suggestedImprovements: string[];
}

export interface InterviewFeedback {
  sessionId: string;
  overallScore: number;
  summary: string;
  strongestTopics: string[];
  weakAreas: string[];
  recommendedPracticeTopics: string[];
  questionFeedback: QuestionFeedback[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  config: InterviewConfig;
  status: SessionStatus;
  questions: InterviewQuestion[];
  answers: QuestionAnswer[];
  feedback?: InterviewFeedback;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing';

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  status: ApplicationStatus;
  applicationDate: string;
  notes?: string;
  jobPostingUrl?: string;
  createdAt: string;
}

export type JobStatus = 'published' | 'unpublished';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'internship';
  description: string;
  requiredSkills: string[];
  applicationUrl?: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export type ChatMessageRole = 'user' | 'assistant';
export type AttachmentStatus = 'uploaded' | 'processing' | 'analyzed' | 'error';

export interface ChatAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: AttachmentStatus;
  statusMessage: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  attachments?: ChatAttachment[];
  timestamp: string;
}

export type DocumentType = 'resume' | 'job_description' | 'project_description';

export interface UserDocument {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  analysisStatus: 'not_analyzed' | 'analyzing' | 'analyzed' | 'error';
  extractedSkills?: string[];
  analysisNote: string;
}

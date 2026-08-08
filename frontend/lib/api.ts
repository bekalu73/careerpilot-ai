// Typed API client for communicating with the Express backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errorBody: { error?: string; details?: unknown } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      res.status,
      errorBody.error ?? `HTTP ${res.status}`,
      errorBody.details
    );
  }

  return res.json() as Promise<T>;
}

// ─── Types (minimal — real types come from the DB) ────────────────────────────

export interface ProfileAnswer {
  id: string;
  candidateId: string;
  category: string;
  question: string;
  answer: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationAnswer {
  id: string;
  applicationId: string;
  question: string;
  answer: string | null;
  isGenerated: boolean;
  isApproved: boolean;
  factChecked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  professionalSummary?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  experiences?: Experience[];
  projects?: Project[];
  skills?: Skill[];
  educations?: Education[];
  achievements?: Achievement[];
  profileAnswers?: ProfileAnswer[];
}

export interface Experience {
  id: string;
  company: string;
  jobTitle: string;
  location?: string | null;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
  domains: string[];
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  role?: string | null;
  technologies: string[];
  responsibilities: string[];
  achievements: string[];
  domains: string[];
  keywords: string[];
  githubUrl?: string | null;
  demoUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isCurrent: boolean;
  isHighlighted: boolean;
  displayOrder: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency?: string | null;
  confirmed: boolean;
  yearsOfExp?: number | null;
}

export interface Education {
  id: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
  description?: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  evidence?: string | null;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location?: string | null;
  employmentType?: string | null;
  seniority?: string | null;
  description?: string | null;
  applicationUrl?: string | null;
  sourceUrl?: string | null;
  recruiterName?: string | null;
  status: string;
  notes?: string | null;
  requiredSkills: string[];
  preferredSkills: string[];
  softSkills?: string[];
  responsibilities?: string[];
  educationReq?: string | null;
  experienceReq?: string | null;
  technologies: string[];
  domains: string[];
  keywords: string[];
  isAnalyzed: boolean;
  analyzedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  jobMatch?: JobMatch | null;
}

export interface JobMatch {
  id: string;
  technicalScore: number;
  experienceScore: number;
  projectScore: number;
  seniorityScore: number;
  domainScore: number;
  overallScore: number;
  strongMatches: string[];
  potentialGaps: string[];
  explanation: string;
  matchedProjects?: MatchedProject[];
  matchedExperiences?: MatchedExperience[];
}

export interface MatchedProject {
  id: string;
  relevanceScore: number;
  reason: string;
  rankOrder: number;
  project: Project;
}

export interface MatchedExperience {
  id: string;
  relevanceScore: number;
  emphasizedAspects: string[];
  reason: string;
  experience: Experience;
}

export interface GeneratedDocument {
  id: string;
  jobId: string;
  type: string;
  content: string;
  version: number;
  factChecked: boolean;
  factCheckPassed?: boolean | null;
  flaggedClaims?: unknown;
  approvedAt?: string | null;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: string;
  notes?: string | null;
  appliedAt?: string | null;
  createdAt: string;
  job?: Job;
  answers?: ApplicationAnswer[];
}

export interface ParsedResumeResult {
  parsed: {
    candidate: Partial<Candidate>;
    experiences: Partial<Experience>[];
    projects: Partial<Project>[];
    skills: Partial<Skill>[];
    educations: Partial<Education>[];
    achievements: Partial<Achievement>[];
  };
  message: string;
}

export interface DashboardStats {
  totalJobs: number;
  applied: number;
  interviews: number;
  offers: number;
  rejections: number;
  interviewRate: number;
  offerRate: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

// Health
export const api = {
  health: () => request<{ status: string }>("/api/health"),

  // Career
  career: {
    getProfile: () => request<Candidate>("/api/career/profile"),
    updateProfile: (data: Partial<Candidate>) =>
      request<Candidate>("/api/career/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    importResume: (html: string) =>
      request<ParsedResumeResult>("/api/career/import-resume", {
        method: "POST",
        body: JSON.stringify({ html }),
      }),
    confirmImport: (data: ParsedResumeResult["parsed"]) =>
      request<Candidate>("/api/career/confirm-import", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    // Experiences
    getExperiences: () => request<Experience[]>("/api/career/experiences"),
    createExperience: (data: Partial<Experience>) =>
      request<Experience>("/api/career/experiences", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateExperience: (id: string, data: Partial<Experience>) =>
      request<Experience>(`/api/career/experiences/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteExperience: (id: string) =>
      request<{ success: boolean }>(`/api/career/experiences/${id}`, {
        method: "DELETE",
      }),

    // Projects
    getProjects: () => request<Project[]>("/api/career/projects"),
    createProject: (data: Partial<Project>) =>
      request<Project>("/api/career/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateProject: (id: string, data: Partial<Project>) =>
      request<Project>(`/api/career/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteProject: (id: string) =>
      request<{ success: boolean }>(`/api/career/projects/${id}`, {
        method: "DELETE",
      }),

    // Skills
    getSkills: () => request<Skill[]>("/api/career/skills"),
    createSkill: (data: Partial<Skill>) =>
      request<Skill>("/api/career/skills", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateSkill: (id: string, data: Partial<Skill>) =>
      request<Skill>(`/api/career/skills/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteSkill: (id: string) =>
      request<{ success: boolean }>(`/api/career/skills/${id}`, {
        method: "DELETE",
      }),

    // Education
    getEducation: () => request<Education[]>("/api/career/education"),
    createEducation: (data: Partial<Education>) =>
      request<Education>("/api/career/education", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateEducation: (id: string, data: Partial<Education>) =>
      request<Education>(`/api/career/education/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteEducation: (id: string) =>
      request<{ success: boolean }>(`/api/career/education/${id}`, {
        method: "DELETE",
      }),

    // Achievements
    getAchievements: () => request<Achievement[]>("/api/career/achievements"),
    createAchievement: (data: Partial<Achievement>) =>
      request<Achievement>("/api/career/achievements", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateAchievement: (id: string, data: Partial<Achievement>) =>
      request<Achievement>(`/api/career/achievements/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteAchievement: (id: string) =>
      request<{ success: boolean }>(`/api/career/achievements/${id}`, {
        method: "DELETE",
      }),

    // Common Profile Q&A Bank
    getQuestions: () => request<ProfileAnswer[]>("/api/career/questions"),
    generateQuestionAnswer: (question: string, category?: string) =>
      request<{ answer: string }>("/api/career/questions/generate", {
        method: "POST",
        body: JSON.stringify({ question, category }),
      }),
    createQuestion: (data: Partial<ProfileAnswer>) =>
      request<ProfileAnswer>("/api/career/questions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateQuestion: (id: string, data: Partial<ProfileAnswer>) =>
      request<ProfileAnswer>(`/api/career/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    deleteQuestion: (id: string) =>
      request<{ success: boolean }>(`/api/career/questions/${id}`, {
        method: "DELETE",
      }),
  },

  // Jobs
  jobs: {
    list: () => request<Job[]>("/api/jobs"),
    get: (id: string) => request<Job>(`/api/jobs/${id}`),
    create: (data: Partial<Job>) =>
      request<Job>("/api/jobs", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Job>) =>
      request<Job>(`/api/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/jobs/${id}`, { method: "DELETE" }),
    analyze: (id: string) =>
      request<{ job: Job; analysis: unknown }>(`/api/jobs/${id}/analyze`, {
        method: "POST",
      }),
    match: (id: string) =>
      request<{ jobMatch: JobMatch }>(`/api/jobs/${id}/match`, {
        method: "POST",
      }),
    generate: (id: string) =>
      request<{ documents: GeneratedDocument[] }>(`/api/jobs/${id}/generate`, {
        method: "POST",
      }),
    factCheck: (id: string, documentId: string) =>
      request<{ document: GeneratedDocument; factCheckResult: unknown }>(
        `/api/jobs/${id}/fact-check`,
        { method: "POST", body: JSON.stringify({ documentId }) }
      ),
    generateRecruiterMessage: (
      id: string,
      platform: "linkedin" | "telegram" | "whatsapp" | "email"
    ) =>
      request<{ document: GeneratedDocument }>(
        `/api/jobs/${id}/recruiter-message`,
        { method: "POST", body: JSON.stringify({ platform }) }
      ),
    getAnswers: (id: string) =>
      request<ApplicationAnswer[]>(`/api/jobs/${id}/answers`),
    answerQuestion: (id: string, question: string, instructions?: string) =>
      request<{ answer: ApplicationAnswer; insufficient: boolean }>(
        `/api/jobs/${id}/answer`,
        { method: "POST", body: JSON.stringify({ question, instructions }) }
      ),
    deleteAnswer: (id: string, answerId: string) =>
      request<{ success: boolean }>(`/api/jobs/${id}/answers/${answerId}`, {
        method: "DELETE",
      }),
    chat: (
      id: string,
      message: string,
      history?: Array<{ role: "user" | "assistant"; content: string }>
    ) =>
      request<{ reply: string }>(`/api/jobs/${id}/chat`, {
        method: "POST",
        body: JSON.stringify({ message, history }),
      }),
  },

  // Applications
  applications: {
    list: () => request<Application[]>("/api/applications"),
    get: (id: string) => request<Application>(`/api/applications/${id}`),
    create: (jobId: string, notes?: string) =>
      request<Application>("/api/applications", {
        method: "POST",
        body: JSON.stringify({ jobId, notes }),
      }),
    updateStatus: (id: string, status: string, note?: string) =>
      request<unknown>(`/api/applications/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      }),
    updateNotes: (id: string, notes: string) =>
      request<Application>(`/api/applications/${id}/notes`, {
        method: "PATCH",
        body: JSON.stringify({ notes }),
      }),
    getStats: () => request<DashboardStats>("/api/applications/stats/summary"),
  },
};

export { ApiError };

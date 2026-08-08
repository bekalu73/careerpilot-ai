-- CreateEnum
CREATE TYPE "SkillProficiency" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('SAVED', 'ANALYZING', 'READY_TO_APPLY', 'APPLIED', 'RECRUITER_CONTACT', 'SCREENING', 'INTERVIEW', 'TECHNICAL_INTERVIEW', 'FINAL_INTERVIEW', 'OFFER', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('RESUME', 'COVER_LETTER', 'RECRUITER_MESSAGE_LINKEDIN', 'RECRUITER_MESSAGE_TELEGRAM', 'RECRUITER_MESSAGE_WHATSAPP', 'RECRUITER_MESSAGE_EMAIL');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'TRACKING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AIOperationType" AS ENUM ('RESUME_PARSE', 'JOB_ANALYZE', 'CANDIDATE_MATCH', 'PROJECT_SELECT', 'RESUME_GENERATE', 'COVER_LETTER_GENERATE', 'RECRUITER_MESSAGE_GENERATE', 'APPLICATION_ANSWER_GENERATE', 'FACT_CHECK', 'JOB_URL_EXTRACT');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'REMOTE');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL', 'STAFF', 'DIRECTOR', 'VP', 'EXECUTIVE');

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "location" TEXT,
    "professionalSummary" TEXT,
    "portfolioUrl" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "responsibilities" TEXT[],
    "achievements" TEXT[],
    "technologies" TEXT[],
    "domains" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT,
    "technologies" TEXT[],
    "responsibilities" TEXT[],
    "achievements" TEXT[],
    "domains" TEXT[],
    "keywords" TEXT[],
    "githubUrl" TEXT,
    "demoUrl" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "proficiency" "SkillProficiency",
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "yearsOfExp" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT,
    "field" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "gpa" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "evidence" TEXT,
    "experienceId" TEXT,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "employmentType" "EmploymentType",
    "seniority" "SeniorityLevel",
    "description" TEXT,
    "applicationUrl" TEXT,
    "sourceUrl" TEXT,
    "recruiterName" TEXT,
    "recruiterTitle" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'SAVED',
    "notes" TEXT,
    "requiredSkills" TEXT[],
    "preferredSkills" TEXT[],
    "responsibilities" TEXT[],
    "technologies" TEXT[],
    "domains" TEXT[],
    "keywords" TEXT[],
    "softSkills" TEXT[],
    "educationReq" TEXT,
    "experienceReq" TEXT,
    "isAnalyzed" BOOLEAN NOT NULL DEFAULT false,
    "analyzedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMatch" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "technicalScore" DOUBLE PRECISION NOT NULL,
    "experienceScore" DOUBLE PRECISION NOT NULL,
    "projectScore" DOUBLE PRECISION NOT NULL,
    "seniorityScore" DOUBLE PRECISION NOT NULL,
    "domainScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "strongMatches" TEXT[],
    "potentialGaps" TEXT[],
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchedProject" (
    "id" TEXT NOT NULL,
    "jobMatchId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "rankOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchedProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchedExperience" (
    "id" TEXT NOT NULL,
    "jobMatchId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "emphasizedAspects" TEXT[],
    "reason" TEXT NOT NULL,
    "rankOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchedExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "factChecked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "note" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeneratedDocument" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "factChecked" BOOLEAN NOT NULL DEFAULT false,
    "factCheckPassed" BOOLEAN,
    "flaggedClaims" JSONB,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeneratedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIExecution" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "operationType" "AIOperationType" NOT NULL,
    "model" TEXT NOT NULL,
    "inputMetadata" JSONB,
    "outputStatus" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "durationMs" INTEGER,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIExecution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobMatch_jobId_key" ON "JobMatch"("jobId");

-- AddForeignKey
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchedProject" ADD CONSTRAINT "MatchedProject_jobMatchId_fkey" FOREIGN KEY ("jobMatchId") REFERENCES "JobMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchedProject" ADD CONSTRAINT "MatchedProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchedExperience" ADD CONSTRAINT "MatchedExperience_jobMatchId_fkey" FOREIGN KEY ("jobMatchId") REFERENCES "JobMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchedExperience" ADD CONSTRAINT "MatchedExperience_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationAnswer" ADD CONSTRAINT "ApplicationAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneratedDocument" ADD CONSTRAINT "GeneratedDocument_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIExecution" ADD CONSTRAINT "AIExecution_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

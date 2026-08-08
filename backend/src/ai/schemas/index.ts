// Zod schemas for validating all AI responses
// Every AI response must be validated before touching the database.

import { z } from "zod";

// ─── Resume Parser Schema ─────────────────────────────────────────────────────

export const ParsedCandidateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  professionalSummary: z.string().nullable().optional(),
  portfolioUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
});

export const ParsedExperienceSchema = z.object({
  company: z.string().min(1),
  jobTitle: z.string().min(1),
  location: z.string().nullable().optional(),
  startDate: z.string().min(4),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
});

export const ParsedProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  technologies: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  githubUrl: z.string().url().nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export const ParsedSkillSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
});

export const ParsedEducationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  gpa: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const ParsedAchievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  date: z.string().nullable().optional(),
  evidence: z.string().nullable().optional(),
});

export const ResumeParserResultSchema = z.object({
  candidate: ParsedCandidateSchema,
  experiences: z.array(ParsedExperienceSchema).default([]),
  projects: z.array(ParsedProjectSchema).default([]),
  skills: z.array(ParsedSkillSchema).default([]),
  educations: z.array(ParsedEducationSchema).default([]),
  achievements: z.array(ParsedAchievementSchema).default([]),
});

export type ResumeParserResult = z.infer<typeof ResumeParserResultSchema>;

// ─── Job Analyzer Schema ──────────────────────────────────────────────────────

const EmploymentTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "FREELANCE",
  "INTERNSHIP",
  "REMOTE",
]);

const SeniorityEnum = z.enum([
  "ENTRY",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
  "PRINCIPAL",
  "STAFF",
  "DIRECTOR",
  "VP",
  "EXECUTIVE",
]);

export const JobAnalyzerResultSchema = z.object({
  title: z.string().min(1),
  company: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  employmentType: EmploymentTypeEnum.nullable().optional(),
  seniority: SeniorityEnum.nullable().optional(),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  domains: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  educationReq: z.string().nullable().optional(),
  experienceReq: z.string().nullable().optional(),
  summary: z.string().optional(),
});

export type JobAnalyzerResult = z.infer<typeof JobAnalyzerResultSchema>;

// ─── Candidate Matcher Schema ─────────────────────────────────────────────────

export const CandidateMatcherResultSchema = z.object({
  technicalScore: z.number().min(0).max(100),
  experienceScore: z.number().min(0).max(100),
  projectScore: z.number().min(0).max(100),
  seniorityScore: z.number().min(0).max(100),
  domainScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  strongMatches: z.array(z.string()).default([]),
  potentialGaps: z.array(z.string()).default([]),
  explanation: z.string(),
  topRecommendation: z.string().optional(),
});

export type CandidateMatcherResult = z.infer<typeof CandidateMatcherResultSchema>;

// ─── Project Selector Schema ──────────────────────────────────────────────────

export const MatchedProjectItemSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  relevanceScore: z.number().min(0).max(100),
  reason: z.string(),
  emphasize: z.array(z.string()).default([]),
});

export const ProjectSelectorResultSchema = z.array(MatchedProjectItemSchema);

export type ProjectSelectorResult = z.infer<typeof ProjectSelectorResultSchema>;

// ─── Fact Checker Schema ──────────────────────────────────────────────────────

export const FlaggedClaimSchema = z.object({
  claim: z.string(),
  reason: z.string(),
  severity: z.enum(["HIGH", "MEDIUM", "LOW"]),
  suggestion: z.string(),
});

export const FactCheckerResultSchema = z.object({
  passed: z.boolean(),
  flaggedClaims: z.array(FlaggedClaimSchema).default([]),
  summary: z.string(),
});

export type FactCheckerResult = z.infer<typeof FactCheckerResultSchema>;

// ─── Resume Generator Schema ──────────────────────────────────────────────────

export const ResumeGeneratorResultSchema = z.object({
  name: z.string().optional(),
  subtitle: z.string().optional(),
  contactInfo: z
    .object({
      email: z.string().nullable().optional(),
      phone: z.string().nullable().optional(),
      location: z.string().nullable().optional(),
      linkedinUrl: z.string().nullable().optional(),
      githubUrl: z.string().nullable().optional(),
      portfolioUrl: z.string().nullable().optional(),
    })
    .optional(),
  professionalSummary: z.string(),
  orderedSkills: z
    .array(
      z.object({
        category: z.string(),
        skills: z.array(z.string()),
      })
    )
    .default([]),
  tailoredExperiences: z
    .array(
      z.object({
        experienceId: z.string().optional(),
        company: z.string(),
        jobTitle: z.string(),
        location: z.string().nullable().optional(),
        dateRange: z.string().nullable().optional(),
        orderedBullets: z.array(z.string()).default([]),
        emphasizedTechnologies: z.array(z.string()).default([]),
      })
    )
    .default([]),
  tailoredProjects: z
    .array(
      z.object({
        projectId: z.string().optional(),
        name: z.string(),
        description: z.string().nullable().optional(),
        orderedBullets: z.array(z.string()).default([]),
      })
    )
    .default([]),
  educations: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string(),
        field: z.string().nullable().optional(),
        location: z.string().nullable().optional(),
        dateRange: z.string().nullable().optional(),
        bullets: z.array(z.string()).default([]),
      })
    )
    .optional(),
  certifications: z.array(z.string()).optional(),
});

export type ResumeGeneratorResult = z.infer<typeof ResumeGeneratorResultSchema>;

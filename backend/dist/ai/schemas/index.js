"use strict";
// Zod schemas for validating all AI responses
// Every AI response must be validated before touching the database.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeGeneratorResultSchema = exports.FactCheckerResultSchema = exports.FlaggedClaimSchema = exports.ProjectSelectorResultSchema = exports.MatchedProjectItemSchema = exports.CandidateMatcherResultSchema = exports.JobAnalyzerResultSchema = exports.ResumeParserResultSchema = exports.ParsedAchievementSchema = exports.ParsedEducationSchema = exports.ParsedSkillSchema = exports.ParsedProjectSchema = exports.ParsedExperienceSchema = exports.ParsedCandidateSchema = void 0;
const zod_1 = require("zod");
// ─── Resume Parser Schema ─────────────────────────────────────────────────────
exports.ParsedCandidateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email().nullable().optional(),
    phone: zod_1.z.string().nullable().optional(),
    location: zod_1.z.string().nullable().optional(),
    professionalSummary: zod_1.z.string().nullable().optional(),
    portfolioUrl: zod_1.z.string().url().nullable().optional(),
    githubUrl: zod_1.z.string().url().nullable().optional(),
    linkedinUrl: zod_1.z.string().url().nullable().optional(),
});
exports.ParsedExperienceSchema = zod_1.z.object({
    company: zod_1.z.string().min(1),
    jobTitle: zod_1.z.string().min(1),
    location: zod_1.z.string().nullable().optional(),
    startDate: zod_1.z.string().min(4),
    endDate: zod_1.z.string().nullable().optional(),
    isCurrent: zod_1.z.boolean().default(false),
    description: zod_1.z.string().nullable().optional(),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    achievements: zod_1.z.array(zod_1.z.string()).default([]),
    technologies: zod_1.z.array(zod_1.z.string()).default([]),
    domains: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.ParsedProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().nullable().optional(),
    role: zod_1.z.string().nullable().optional(),
    technologies: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    achievements: zod_1.z.array(zod_1.z.string()).default([]),
    domains: zod_1.z.array(zod_1.z.string()).default([]),
    keywords: zod_1.z.array(zod_1.z.string()).default([]),
    githubUrl: zod_1.z.string().url().nullable().optional(),
    demoUrl: zod_1.z.string().url().nullable().optional(),
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
});
exports.ParsedSkillSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
});
exports.ParsedEducationSchema = zod_1.z.object({
    institution: zod_1.z.string().min(1),
    degree: zod_1.z.string().nullable().optional(),
    field: zod_1.z.string().nullable().optional(),
    startDate: zod_1.z.string().nullable().optional(),
    endDate: zod_1.z.string().nullable().optional(),
    gpa: zod_1.z.string().nullable().optional(),
    description: zod_1.z.string().nullable().optional(),
});
exports.ParsedAchievementSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().nullable().optional(),
    date: zod_1.z.string().nullable().optional(),
    evidence: zod_1.z.string().nullable().optional(),
});
exports.ResumeParserResultSchema = zod_1.z.object({
    candidate: exports.ParsedCandidateSchema,
    experiences: zod_1.z.array(exports.ParsedExperienceSchema).default([]),
    projects: zod_1.z.array(exports.ParsedProjectSchema).default([]),
    skills: zod_1.z.array(exports.ParsedSkillSchema).default([]),
    educations: zod_1.z.array(exports.ParsedEducationSchema).default([]),
    achievements: zod_1.z.array(exports.ParsedAchievementSchema).default([]),
});
// ─── Job Analyzer Schema ──────────────────────────────────────────────────────
const EmploymentTypeEnum = zod_1.z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACT",
    "FREELANCE",
    "INTERNSHIP",
    "REMOTE",
]);
const SeniorityEnum = zod_1.z.enum([
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
exports.JobAnalyzerResultSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    company: zod_1.z.string().nullable().optional(),
    location: zod_1.z.string().nullable().optional(),
    employmentType: EmploymentTypeEnum.nullable().optional(),
    seniority: SeniorityEnum.nullable().optional(),
    requiredSkills: zod_1.z.array(zod_1.z.string()).default([]),
    preferredSkills: zod_1.z.array(zod_1.z.string()).default([]),
    responsibilities: zod_1.z.array(zod_1.z.string()).default([]),
    technologies: zod_1.z.array(zod_1.z.string()).default([]),
    domains: zod_1.z.array(zod_1.z.string()).default([]),
    keywords: zod_1.z.array(zod_1.z.string()).default([]),
    softSkills: zod_1.z.array(zod_1.z.string()).default([]),
    educationReq: zod_1.z.string().nullable().optional(),
    experienceReq: zod_1.z.string().nullable().optional(),
    summary: zod_1.z.string().optional(),
});
// ─── Candidate Matcher Schema ─────────────────────────────────────────────────
exports.CandidateMatcherResultSchema = zod_1.z.object({
    technicalScore: zod_1.z.number().min(0).max(100),
    experienceScore: zod_1.z.number().min(0).max(100),
    projectScore: zod_1.z.number().min(0).max(100),
    seniorityScore: zod_1.z.number().min(0).max(100),
    domainScore: zod_1.z.number().min(0).max(100),
    overallScore: zod_1.z.number().min(0).max(100),
    strongMatches: zod_1.z.array(zod_1.z.string()).default([]),
    potentialGaps: zod_1.z.array(zod_1.z.string()).default([]),
    explanation: zod_1.z.string(),
    topRecommendation: zod_1.z.string().optional(),
});
// ─── Project Selector Schema ──────────────────────────────────────────────────
exports.MatchedProjectItemSchema = zod_1.z.object({
    projectId: zod_1.z.string(),
    projectName: zod_1.z.string(),
    relevanceScore: zod_1.z.number().min(0).max(100),
    reason: zod_1.z.string(),
    emphasize: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.ProjectSelectorResultSchema = zod_1.z.array(exports.MatchedProjectItemSchema);
// ─── Fact Checker Schema ──────────────────────────────────────────────────────
exports.FlaggedClaimSchema = zod_1.z.object({
    claim: zod_1.z.string(),
    reason: zod_1.z.string(),
    severity: zod_1.z.enum(["HIGH", "MEDIUM", "LOW"]),
    suggestion: zod_1.z.string(),
});
exports.FactCheckerResultSchema = zod_1.z.object({
    passed: zod_1.z.boolean(),
    flaggedClaims: zod_1.z.array(exports.FlaggedClaimSchema).default([]),
    summary: zod_1.z.string(),
});
// ─── Resume Generator Schema ──────────────────────────────────────────────────
exports.ResumeGeneratorResultSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    subtitle: zod_1.z.string().optional(),
    contactInfo: zod_1.z
        .object({
        email: zod_1.z.string().nullable().optional(),
        phone: zod_1.z.string().nullable().optional(),
        location: zod_1.z.string().nullable().optional(),
        linkedinUrl: zod_1.z.string().nullable().optional(),
        githubUrl: zod_1.z.string().nullable().optional(),
        portfolioUrl: zod_1.z.string().nullable().optional(),
    })
        .optional(),
    professionalSummary: zod_1.z.string(),
    orderedSkills: zod_1.z
        .array(zod_1.z.object({
        category: zod_1.z.string(),
        skills: zod_1.z.array(zod_1.z.string()),
    }))
        .default([]),
    tailoredExperiences: zod_1.z
        .array(zod_1.z.object({
        experienceId: zod_1.z.string().optional(),
        company: zod_1.z.string(),
        jobTitle: zod_1.z.string(),
        location: zod_1.z.string().nullable().optional(),
        dateRange: zod_1.z.string().nullable().optional(),
        orderedBullets: zod_1.z.array(zod_1.z.string()).default([]),
        emphasizedTechnologies: zod_1.z.array(zod_1.z.string()).default([]),
    }))
        .default([]),
    tailoredProjects: zod_1.z
        .array(zod_1.z.object({
        projectId: zod_1.z.string().optional(),
        name: zod_1.z.string(),
        description: zod_1.z.string().nullable().optional(),
        orderedBullets: zod_1.z.array(zod_1.z.string()).default([]),
    }))
        .default([]),
    educations: zod_1.z
        .array(zod_1.z.object({
        institution: zod_1.z.string(),
        degree: zod_1.z.string(),
        field: zod_1.z.string().nullable().optional(),
        location: zod_1.z.string().nullable().optional(),
        dateRange: zod_1.z.string().nullable().optional(),
        bullets: zod_1.z.array(zod_1.z.string()).default([]),
    }))
        .optional(),
    certifications: zod_1.z.array(zod_1.z.string()).optional(),
});
//# sourceMappingURL=index.js.map
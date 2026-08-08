"use strict";
// Jobs Routes
// /api/jobs/*
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const job_analyzer_js_1 = require("../ai/services/job-analyzer.js");
const matcher_js_1 = require("../ai/services/matcher.js");
const generator_js_1 = require("../ai/services/generator.js");
const fact_checker_js_1 = require("../ai/services/fact-checker.js");
const client_1 = require("@prisma/client");
const utils_js_1 = require("../lib/utils.js");
const router = (0, express_1.Router)();
// Helper: serialize candidate profile for AI consumption
async function getCandidateProfileJson() {
    const candidate = await prisma_js_1.default.candidate.findFirst({
        include: {
            experiences: true,
            projects: true,
            skills: true,
            educations: true,
            achievements: true,
        },
    });
    if (!candidate)
        return null;
    return JSON.stringify(candidate);
}
// ─── GET /api/jobs ────────────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
    try {
        const jobs = await prisma_js_1.default.job.findMany({
            include: { jobMatch: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json(jobs);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch jobs" });
    }
});
// ─── POST /api/jobs ───────────────────────────────────────────────────────────
const CreateJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    company: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    applicationUrl: zod_1.z.string().url().optional(),
    sourceUrl: zod_1.z.string().url().optional(),
    location: zod_1.z.string().optional(),
    recruiterName: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
router.post("/", async (req, res) => {
    const body = CreateJobSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ error: body.error.flatten() });
    }
    try {
        const job = await prisma_js_1.default.job.create({ data: body.data });
        return res.status(201).json(job);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create job" });
    }
});
// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const job = await prisma_js_1.default.job.findUnique({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            include: {
                jobMatch: {
                    include: {
                        matchedProjects: { include: { project: true } },
                        matchedExperiences: { include: { experience: true } },
                    },
                },
                documents: true,
                applications: { include: { answers: true } },
            },
        });
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        return res.json(job);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch job" });
    }
});
// ─── PATCH /api/jobs/:id ──────────────────────────────────────────────────────
router.patch("/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.job.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update job" });
    }
});
// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
    try {
        await prisma_js_1.default.job.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete job" });
    }
});
// ─── POST /api/jobs/:id/analyze ───────────────────────────────────────────────
router.post("/:id/analyze", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    try {
        const job = await prisma_js_1.default.job.findUnique({ where: { id: jobId } });
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!job.description) {
            return res.status(400).json({ error: "Job has no description to analyze" });
        }
        // Update status
        await prisma_js_1.default.job.update({
            where: { id: jobId },
            data: { status: client_1.JobStatus.ANALYZING },
        });
        const analysis = await (0, job_analyzer_js_1.analyzeJobDescription)(job.description, jobId);
        // Save analysis results to job
        const updated = await prisma_js_1.default.job.update({
            where: { id: jobId },
            data: {
                title: analysis.title || job.title,
                company: analysis.company || job.company,
                location: analysis.location ?? job.location,
                employmentType: analysis.employmentType ?? undefined,
                seniority: analysis.seniority ?? undefined,
                requiredSkills: analysis.requiredSkills,
                preferredSkills: analysis.preferredSkills,
                responsibilities: analysis.responsibilities,
                technologies: analysis.technologies,
                domains: analysis.domains,
                keywords: analysis.keywords,
                softSkills: analysis.softSkills,
                educationReq: analysis.educationReq ?? null,
                experienceReq: analysis.experienceReq ?? null,
                isAnalyzed: true,
                analyzedAt: new Date(),
                status: client_1.JobStatus.READY_TO_APPLY,
            },
        });
        return res.json({ job: updated, analysis });
    }
    catch (err) {
        console.error("[POST /jobs/:id/analyze]", err);
        await prisma_js_1.default.job.update({
            where: { id: jobId },
            data: { status: client_1.JobStatus.SAVED },
        }).catch(() => { });
        return res.status(500).json({
            error: "Failed to analyze job",
            details: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
// ─── POST /api/jobs/:id/match ─────────────────────────────────────────────────
router.post("/:id/match", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    try {
        const [job, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.job.findUnique({ where: { id: jobId } }),
            getCandidateProfileJson(),
        ]);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!job.isAnalyzed) {
            return res
                .status(400)
                .json({ error: "Job must be analyzed before matching" });
        }
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        const candidate = await prisma_js_1.default.candidate.findFirst({ include: { projects: true } });
        if (!candidate)
            return res.status(400).json({ error: "No candidate profile found" });
        const jobRequirementsJson = JSON.stringify({
            title: job.title,
            requiredSkills: job.requiredSkills,
            preferredSkills: job.preferredSkills,
            technologies: job.technologies,
            domains: job.domains,
            responsibilities: job.responsibilities,
            seniority: job.seniority,
            experienceReq: job.experienceReq,
        });
        const projectsForSelection = JSON.stringify(candidate.projects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            technologies: p.technologies,
            domains: p.domains,
            keywords: p.keywords,
            responsibilities: p.responsibilities,
            achievements: p.achievements,
        })));
        // Run matching and project selection in parallel
        const [matchResult, selectedProjects] = await Promise.all([
            (0, matcher_js_1.matchCandidateToJob)(candidateProfileJson, jobRequirementsJson, jobId),
            (0, matcher_js_1.selectRelevantProjects)(projectsForSelection, jobRequirementsJson, jobId),
        ]);
        // Delete existing match if any
        await prisma_js_1.default.jobMatch.deleteMany({ where: { jobId } });
        // Save match
        const jobMatch = await prisma_js_1.default.jobMatch.create({
            data: {
                jobId,
                technicalScore: matchResult.technicalScore,
                experienceScore: matchResult.experienceScore,
                projectScore: matchResult.projectScore,
                seniorityScore: matchResult.seniorityScore,
                domainScore: matchResult.domainScore,
                overallScore: matchResult.overallScore,
                strongMatches: matchResult.strongMatches,
                potentialGaps: matchResult.potentialGaps,
                explanation: matchResult.explanation,
                matchedProjects: {
                    create: selectedProjects.slice(0, 5).map((sp, index) => ({
                        projectId: sp.projectId,
                        relevanceScore: sp.relevanceScore,
                        reason: sp.reason,
                        rankOrder: index,
                    })),
                },
            },
            include: {
                matchedProjects: { include: { project: true } },
            },
        });
        return res.json({ jobMatch, matchResult, selectedProjects });
    }
    catch (err) {
        console.error("[POST /jobs/:id/match]", err);
        return res.status(500).json({
            error: "Failed to match candidate to job",
            details: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
// ─── POST /api/jobs/:id/generate ─────────────────────────────────────────────
// Generates the full application package
router.post("/:id/generate", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    try {
        const [job, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.job.findUnique({
                where: { id: jobId },
                include: { jobMatch: { include: { matchedProjects: { include: { project: true } } } } },
            }),
            getCandidateProfileJson(),
        ]);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        if (!job.jobMatch) {
            return res.status(400).json({ error: "Run match analysis before generating documents" });
        }
        const jobDetails = JSON.stringify({
            title: job.title,
            company: job.company,
            description: job.description,
            technologies: job.technologies,
            domains: job.domains,
            requiredSkills: job.requiredSkills,
        });
        const selectedProjectsJson = JSON.stringify(job.jobMatch.matchedProjects.map((mp) => ({
            name: mp.project.name,
            description: mp.project.description,
            technologies: mp.project.technologies,
            reason: mp.reason,
        })));
        const matchedExperienceJson = JSON.stringify({
            strongMatches: job.jobMatch.strongMatches,
            explanation: job.jobMatch.explanation,
        });
        // Generate all documents in parallel
        const [coverLetter, linkedinMsg, telegramMsg, tailoredResume] = await Promise.all([
            (0, generator_js_1.generateCoverLetter)(candidateProfileJson, jobDetails, selectedProjectsJson, matchedExperienceJson, jobId),
            (0, generator_js_1.generateRecruiterMessage)(candidateProfileJson, jobDetails, "linkedin", selectedProjectsJson, jobId),
            (0, generator_js_1.generateRecruiterMessage)(candidateProfileJson, jobDetails, "telegram", selectedProjectsJson, jobId),
            (0, generator_js_1.generateTailoredResume)(candidateProfileJson, jobDetails, selectedProjectsJson, matchedExperienceJson, jobId),
        ]);
        // Save documents
        const docsToCreate = [
            { type: client_1.DocumentType.COVER_LETTER, content: coverLetter },
            {
                type: client_1.DocumentType.RECRUITER_MESSAGE_LINKEDIN,
                content: linkedinMsg,
            },
            {
                type: client_1.DocumentType.RECRUITER_MESSAGE_TELEGRAM,
                content: telegramMsg,
            },
            {
                type: client_1.DocumentType.RESUME,
                content: JSON.stringify(tailoredResume),
            },
        ];
        // Delete old versions
        await prisma_js_1.default.generatedDocument.deleteMany({ where: { jobId } });
        const savedDocs = await Promise.all(docsToCreate.map((doc) => prisma_js_1.default.generatedDocument.create({ data: { jobId, ...doc } })));
        return res.json({ documents: savedDocs });
    }
    catch (err) {
        console.error("[POST /jobs/:id/generate]", err);
        return res.status(500).json({
            error: "Failed to generate application package",
            details: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
// ─── POST /api/jobs/:id/fact-check ────────────────────────────────────────────
router.post("/:id/fact-check", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    const { documentId } = req.body;
    try {
        const [doc, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.generatedDocument.findUnique({ where: { id: documentId } }),
            getCandidateProfileJson(),
        ]);
        if (!doc)
            return res.status(404).json({ error: "Document not found" });
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        const result = await (0, fact_checker_js_1.factCheckDocument)(doc.content, candidateProfileJson, jobId);
        const updated = await prisma_js_1.default.generatedDocument.update({
            where: { id: documentId },
            data: {
                factChecked: true,
                factCheckPassed: result.passed,
                flaggedClaims: result.flaggedClaims,
                approvedAt: result.passed ? new Date() : null,
            },
        });
        return res.json({ document: updated, factCheckResult: result });
    }
    catch (err) {
        console.error("[POST /jobs/:id/fact-check]", err);
        return res.status(500).json({ error: "Failed to fact-check document" });
    }
});
// ─── POST /api/jobs/:id/recruiter-message ────────────────────────────────────
router.post("/:id/recruiter-message", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    const { platform } = req.body;
    try {
        const [job, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.job.findUnique({
                where: { id: jobId },
                include: { jobMatch: { include: { matchedProjects: { include: { project: true } } } } },
            }),
            getCandidateProfileJson(),
        ]);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        const jobDetails = JSON.stringify({ title: job.title, company: job.company });
        const selectedProjectsJson = JSON.stringify(job.jobMatch?.matchedProjects.map((mp) => mp.project.name) ?? []);
        const message = await (0, generator_js_1.generateRecruiterMessage)(candidateProfileJson, jobDetails, platform, selectedProjectsJson, jobId);
        const docTypeMap = {
            linkedin: client_1.DocumentType.RECRUITER_MESSAGE_LINKEDIN,
            telegram: client_1.DocumentType.RECRUITER_MESSAGE_TELEGRAM,
            whatsapp: client_1.DocumentType.RECRUITER_MESSAGE_WHATSAPP,
            email: client_1.DocumentType.RECRUITER_MESSAGE_EMAIL,
        };
        const doc = await prisma_js_1.default.generatedDocument.create({
            data: { jobId, type: docTypeMap[platform], content: message },
        });
        return res.json({ document: doc });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to generate recruiter message" });
    }
});
// ─── GET /api/jobs/:id/answers ───────────────────────────────────────────────
router.get("/:id/answers", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    try {
        const application = await prisma_js_1.default.application.findFirst({
            where: { jobId },
            include: {
                answers: { orderBy: { createdAt: "desc" } },
            },
        });
        return res.json(application?.answers ?? []);
    }
    catch (err) {
        console.error("[GET /api/jobs/:id/answers]", err);
        return res.status(500).json({ error: "Failed to fetch application answers" });
    }
});
// ─── POST /api/jobs/:id/answer ────────────────────────────────────────────────
router.post("/:id/answer", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    const { question, instructions } = req.body;
    if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
    }
    try {
        const [job, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.job.findUnique({ where: { id: jobId } }),
            getCandidateProfileJson(),
        ]);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        const jobDetails = JSON.stringify({
            title: job.title,
            company: job.company,
            description: job.description,
            requiredSkills: job.requiredSkills,
            responsibilities: job.responsibilities,
        });
        const answer = await (0, generator_js_1.generateApplicationAnswer)(candidateProfileJson, jobDetails, question, jobId, instructions);
        const isInsufficient = answer.trim() === "INSUFFICIENT_INFORMATION";
        // Find or create application
        let application = await prisma_js_1.default.application.findFirst({
            where: { jobId },
        });
        if (!application) {
            application = await prisma_js_1.default.application.create({
                data: {
                    jobId,
                    status: "DRAFT",
                },
            });
        }
        const savedAnswer = await prisma_js_1.default.applicationAnswer.create({
            data: {
                applicationId: application.id,
                question,
                answer: isInsufficient ? null : answer,
                isGenerated: true,
                isApproved: !isInsufficient,
            },
        });
        return res.json({
            answer: savedAnswer,
            insufficient: isInsufficient,
        });
    }
    catch (err) {
        console.error("[POST /api/jobs/:id/answer]", err);
        return res.status(500).json({ error: "Failed to generate answer" });
    }
});
// ─── DELETE /api/jobs/:id/answers/:answerId ───────────────────────────────────
router.delete("/:id/answers/:answerId", async (req, res) => {
    const answerId = (0, utils_js_1.getParam)(req.params["answerId"]);
    try {
        await prisma_js_1.default.applicationAnswer.delete({ where: { id: answerId } });
        return res.json({ success: true });
    }
    catch (err) {
        console.error("[DELETE /api/jobs/:id/answers/:answerId]", err);
        return res.status(500).json({ error: "Failed to delete answer" });
    }
});
// ─── POST /api/jobs/:id/chat ──────────────────────────────────────────────────
router.post("/:id/chat", async (req, res) => {
    const jobId = (0, utils_js_1.getParam)(req.params["id"]);
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Message is required" });
    }
    try {
        const [job, candidateProfileJson] = await Promise.all([
            prisma_js_1.default.job.findUnique({ where: { id: jobId } }),
            getCandidateProfileJson(),
        ]);
        if (!job)
            return res.status(404).json({ error: "Job not found" });
        if (!candidateProfileJson) {
            return res.status(400).json({ error: "No candidate profile found" });
        }
        const jobDetails = JSON.stringify({
            title: job.title,
            company: job.company,
            description: job.description,
            requiredSkills: job.requiredSkills,
            responsibilities: job.responsibilities,
            domains: job.domains,
            keywords: job.keywords,
        });
        const reply = await (0, generator_js_1.chatWithApplicationCopilot)(candidateProfileJson, jobDetails, history, message, jobId);
        return res.json({ reply });
    }
    catch (err) {
        console.error("[POST /api/jobs/:id/chat]", err);
        return res.status(500).json({ error: "Failed to communicate with AI Copilot" });
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map
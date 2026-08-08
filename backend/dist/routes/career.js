"use strict";
// Career Routes
// /api/career/*
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const utils_js_1 = require("../lib/utils.js");
const resume_parser_js_1 = require("../ai/services/resume-parser.js");
const generator_js_1 = require("../ai/services/generator.js");
const router = (0, express_1.Router)();
// ─── GET /api/career/profile ──────────────────────────────────────────────────
router.get("/profile", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst({
            include: {
                experiences: { orderBy: { startDate: "desc" } },
                projects: { orderBy: { displayOrder: "asc" } },
                skills: { orderBy: { category: "asc" } },
                educations: { orderBy: { startDate: "desc" } },
                achievements: { orderBy: { date: "desc" } },
                profileAnswers: { orderBy: { createdAt: "asc" } },
            },
        });
        if (!candidate) {
            return res.status(404).json({ error: "No career profile found" });
        }
        return res.json(candidate);
    }
    catch (err) {
        console.error("[GET /career/profile]", err);
        return res.status(500).json({ error: "Failed to fetch career profile" });
    }
});
// ─── POST /api/career/import-resume ──────────────────────────────────────────
const ImportResumeSchema = zod_1.z.object({
    html: zod_1.z.string().min(100, "Resume HTML is too short"),
});
router.post("/import-resume", async (req, res) => {
    const body = ImportResumeSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ error: body.error.flatten() });
    }
    try {
        const parsed = await (0, resume_parser_js_1.parseResumeHtml)(body.data.html);
        // Return parsed data for user review — NOT saved yet
        return res.json({ parsed, message: "Review and confirm to save" });
    }
    catch (err) {
        console.error("[POST /career/import-resume]", err);
        return res.status(500).json({
            error: "Failed to parse resume. Check your Gemini API key.",
            details: err instanceof Error ? err.message : "Unknown error",
        });
    }
});
// ─── POST /api/career/confirm-import ─────────────────────────────────────────
// User reviews and confirms the parsed data — this saves it to the DB
const ConfirmImportSchema = zod_1.z.object({
    candidate: zod_1.z.object({
        name: zod_1.z.string().min(1),
        email: zod_1.z.string().email().nullable().optional(),
        phone: zod_1.z.string().nullable().optional(),
        location: zod_1.z.string().nullable().optional(),
        professionalSummary: zod_1.z.string().nullable().optional(),
        portfolioUrl: zod_1.z.string().nullable().optional(),
        githubUrl: zod_1.z.string().nullable().optional(),
        linkedinUrl: zod_1.z.string().nullable().optional(),
    }),
    experiences: zod_1.z.array(zod_1.z.any()).default([]),
    projects: zod_1.z.array(zod_1.z.any()).default([]),
    skills: zod_1.z.array(zod_1.z.any()).default([]),
    educations: zod_1.z.array(zod_1.z.any()).default([]),
    achievements: zod_1.z.array(zod_1.z.any()).default([]),
});
router.post("/confirm-import", async (req, res) => {
    const body = ConfirmImportSchema.safeParse(req.body);
    if (!body.success) {
        return res.status(400).json({ error: body.error.flatten() });
    }
    try {
        // Delete existing candidate (single-user MVP)
        await prisma_js_1.default.candidate.deleteMany();
        const { candidate, experiences, projects, skills, educations, achievements } = body.data;
        const created = await prisma_js_1.default.candidate.create({
            data: {
                ...candidate,
                experiences: {
                    create: experiences.map((exp) => ({
                        company: String(exp["company"] ?? ""),
                        jobTitle: String(exp["jobTitle"] ?? ""),
                        location: exp["location"] ? String(exp["location"]) : null,
                        startDate: new Date(String(exp["startDate"] ?? new Date())),
                        endDate: exp["endDate"] ? new Date(String(exp["endDate"])) : null,
                        isCurrent: Boolean(exp["isCurrent"] ?? false),
                        description: exp["description"] ? String(exp["description"]) : null,
                        responsibilities: Array.isArray(exp["responsibilities"])
                            ? exp["responsibilities"].map(String)
                            : [],
                        achievements: Array.isArray(exp["achievements"])
                            ? exp["achievements"].map(String)
                            : [],
                        technologies: Array.isArray(exp["technologies"])
                            ? exp["technologies"].map(String)
                            : [],
                        domains: Array.isArray(exp["domains"])
                            ? exp["domains"].map(String)
                            : [],
                    })),
                },
                projects: {
                    create: projects.map((proj, index) => ({
                        name: String(proj["name"] ?? ""),
                        description: proj["description"] ? String(proj["description"]) : null,
                        role: proj["role"] ? String(proj["role"]) : null,
                        technologies: Array.isArray(proj["technologies"])
                            ? proj["technologies"].map(String)
                            : [],
                        responsibilities: Array.isArray(proj["responsibilities"])
                            ? proj["responsibilities"].map(String)
                            : [],
                        achievements: Array.isArray(proj["achievements"])
                            ? proj["achievements"].map(String)
                            : [],
                        domains: Array.isArray(proj["domains"])
                            ? proj["domains"].map(String)
                            : [],
                        keywords: Array.isArray(proj["keywords"])
                            ? proj["keywords"].map(String)
                            : [],
                        githubUrl: proj["githubUrl"] ? String(proj["githubUrl"]) : null,
                        demoUrl: proj["demoUrl"] ? String(proj["demoUrl"]) : null,
                        startDate: proj["startDate"] ? new Date(String(proj["startDate"])) : null,
                        endDate: proj["endDate"] ? new Date(String(proj["endDate"])) : null,
                        displayOrder: index,
                    })),
                },
                skills: {
                    create: skills.map((skill) => ({
                        name: String(skill["name"] ?? ""),
                        category: String(skill["category"] ?? "General"),
                        confirmed: false,
                    })),
                },
                educations: {
                    create: educations.map((edu) => ({
                        institution: String(edu["institution"] ?? ""),
                        degree: edu["degree"] ? String(edu["degree"]) : null,
                        field: edu["field"] ? String(edu["field"]) : null,
                        startDate: edu["startDate"] ? new Date(String(edu["startDate"])) : null,
                        endDate: edu["endDate"] ? new Date(String(edu["endDate"])) : null,
                        gpa: edu["gpa"] ? String(edu["gpa"]) : null,
                        description: edu["description"] ? String(edu["description"]) : null,
                    })),
                },
                achievements: {
                    create: achievements.map((ach) => ({
                        title: String(ach["title"] ?? ""),
                        description: ach["description"] ? String(ach["description"]) : null,
                        date: ach["date"] ? new Date(String(ach["date"])) : null,
                        evidence: ach["evidence"] ? String(ach["evidence"]) : null,
                    })),
                },
            },
            include: {
                experiences: true,
                projects: true,
                skills: true,
                educations: true,
                achievements: true,
            },
        });
        return res.status(201).json(created);
    }
    catch (err) {
        console.error("[POST /career/confirm-import]", err);
        return res.status(500).json({ error: "Failed to save career profile" });
    }
});
// ─── PATCH /api/career/profile ────────────────────────────────────────────────
router.patch("/profile", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate) {
            return res.status(404).json({ error: "No career profile found" });
        }
        const updated = await prisma_js_1.default.candidate.update({
            where: { id: candidate.id },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        console.error("[PATCH /career/profile]", err);
        return res.status(500).json({ error: "Failed to update profile" });
    }
});
// ─── Experience CRUD ──────────────────────────────────────────────────────────
router.get("/experiences", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const experiences = await prisma_js_1.default.experience.findMany({
            where: { candidateId: candidate.id },
            orderBy: { startDate: "desc" },
        });
        return res.json(experiences);
    }
    catch (err) {
        console.error("[GET /career/experiences]", err);
        return res.status(500).json({ error: "Failed to fetch experiences" });
    }
});
router.post("/experiences", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const experience = await prisma_js_1.default.experience.create({
            data: {
                candidateId: candidate.id,
                ...req.body,
                startDate: new Date(req.body.startDate),
                endDate: req.body.endDate ? new Date(req.body.endDate) : null,
            },
        });
        return res.status(201).json(experience);
    }
    catch (err) {
        console.error("[POST /career/experiences]", err);
        return res.status(500).json({ error: "Failed to create experience" });
    }
});
router.patch("/experiences/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.experience.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: {
                ...req.body,
                startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
                endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            },
        });
        return res.json(updated);
    }
    catch (err) {
        console.error("[PATCH /career/experiences/:id]", err);
        return res.status(500).json({ error: "Failed to update experience" });
    }
});
router.delete("/experiences/:id", async (req, res) => {
    try {
        await prisma_js_1.default.experience.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        console.error("[DELETE /career/experiences/:id]", err);
        return res.status(500).json({ error: "Failed to delete experience" });
    }
});
// ─── Projects CRUD ────────────────────────────────────────────────────────────
router.get("/projects", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const projects = await prisma_js_1.default.project.findMany({
            where: { candidateId: candidate.id },
            orderBy: { displayOrder: "asc" },
        });
        return res.json(projects);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch projects" });
    }
});
router.post("/projects", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const project = await prisma_js_1.default.project.create({
            data: {
                candidateId: candidate.id,
                ...req.body,
                startDate: req.body.startDate ? new Date(req.body.startDate) : null,
                endDate: req.body.endDate ? new Date(req.body.endDate) : null,
            },
        });
        return res.status(201).json(project);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create project" });
    }
});
router.patch("/projects/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.project.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: {
                ...req.body,
                startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
                endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
            },
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update project" });
    }
});
router.delete("/projects/:id", async (req, res) => {
    try {
        await prisma_js_1.default.project.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete project" });
    }
});
// ─── Skills CRUD ──────────────────────────────────────────────────────────────
router.get("/skills", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const skills = await prisma_js_1.default.skill.findMany({
            where: { candidateId: candidate.id },
            orderBy: [{ category: "asc" }, { name: "asc" }],
        });
        return res.json(skills);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch skills" });
    }
});
router.post("/skills", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const skill = await prisma_js_1.default.skill.create({
            data: { candidateId: candidate.id, ...req.body },
        });
        return res.status(201).json(skill);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create skill" });
    }
});
router.patch("/skills/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.skill.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update skill" });
    }
});
router.delete("/skills/:id", async (req, res) => {
    try {
        await prisma_js_1.default.skill.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete skill" });
    }
});
// ─── Education CRUD ───────────────────────────────────────────────────────────
router.get("/education", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const edus = await prisma_js_1.default.education.findMany({
            where: { candidateId: candidate.id },
        });
        return res.json(edus);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch education" });
    }
});
router.post("/education", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const edu = await prisma_js_1.default.education.create({
            data: {
                candidateId: candidate.id,
                ...req.body,
                startDate: req.body.startDate ? new Date(req.body.startDate) : null,
                endDate: req.body.endDate ? new Date(req.body.endDate) : null,
            },
        });
        return res.status(201).json(edu);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create education" });
    }
});
router.patch("/education/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.education.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update education" });
    }
});
router.delete("/education/:id", async (req, res) => {
    try {
        await prisma_js_1.default.education.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete education" });
    }
});
// ─── Achievements CRUD ────────────────────────────────────────────────────────
router.get("/achievements", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const items = await prisma_js_1.default.achievement.findMany({
            where: { candidateId: candidate.id },
            orderBy: { date: "desc" },
        });
        return res.json(items);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch achievements" });
    }
});
router.post("/achievements", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const item = await prisma_js_1.default.achievement.create({
            data: {
                candidateId: candidate.id,
                ...req.body,
                date: req.body.date ? new Date(req.body.date) : null,
            },
        });
        return res.status(201).json(item);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create achievement" });
    }
});
router.patch("/achievements/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.achievement.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update achievement" });
    }
});
router.delete("/achievements/:id", async (req, res) => {
    try {
        await prisma_js_1.default.achievement.delete({ where: { id: (0, utils_js_1.getParam)(req.params["id"]) } });
        return res.json({ success: true });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to delete achievement" });
    }
});
// ─── Profile Common Q&A Bank CRUD ─────────────────────────────────────────────
router.get("/questions", async (_req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const questions = await prisma_js_1.default.profileAnswer.findMany({
            where: { candidateId: candidate.id },
            orderBy: { createdAt: "asc" },
        });
        return res.json(questions);
    }
    catch (err) {
        console.error("[GET /career/questions]", err);
        return res.status(500).json({ error: "Failed to fetch profile questions" });
    }
});
router.post("/questions/generate", async (req, res) => {
    const { question, category } = req.body;
    if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "Question is required" });
    }
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst({
            include: {
                experiences: { orderBy: { startDate: "desc" } },
                projects: { orderBy: { displayOrder: "asc" } },
                skills: { orderBy: { category: "asc" } },
                educations: { orderBy: { startDate: "desc" } },
                achievements: { orderBy: { date: "desc" } },
            },
        });
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const candidateProfileJson = JSON.stringify({
            name: candidate.name,
            location: candidate.location,
            portfolioUrl: candidate.portfolioUrl || "https://bekalu-sisay.vercel.app/",
            githubUrl: candidate.githubUrl,
            linkedinUrl: candidate.linkedinUrl,
            professionalSummary: candidate.professionalSummary,
            experiences: candidate.experiences,
            projects: candidate.projects,
            skills: candidate.skills,
            educations: candidate.educations,
        });
        const jobContext = "Standard job application question for software engineering, AI/ML, and tech roles (LinkedIn, Greenhouse, Lever, Workday, Ashby). Highlight RAG, Generative AI, chatbots, and hands-on production systems.";
        const generatedAnswer = await (0, generator_js_1.generateApplicationAnswer)(candidateProfileJson, jobContext, question);
        return res.json({ answer: generatedAnswer });
    }
    catch (err) {
        console.error("[POST /career/questions/generate]", err);
        return res.status(500).json({ error: "Failed to generate profile answer" });
    }
});
router.post("/questions", async (req, res) => {
    try {
        const candidate = await prisma_js_1.default.candidate.findFirst();
        if (!candidate)
            return res.status(404).json({ error: "No profile found" });
        const { question, answer, category = "General", isCustom = false } = req.body;
        const item = await prisma_js_1.default.profileAnswer.create({
            data: {
                candidateId: candidate.id,
                question,
                answer,
                category,
                isCustom,
            },
        });
        return res.status(201).json(item);
    }
    catch (err) {
        console.error("[POST /career/questions]", err);
        return res.status(500).json({ error: "Failed to save profile question" });
    }
});
router.patch("/questions/:id", async (req, res) => {
    try {
        const updated = await prisma_js_1.default.profileAnswer.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: req.body,
        });
        return res.json(updated);
    }
    catch (err) {
        console.error("[PATCH /career/questions/:id]", err);
        return res.status(500).json({ error: "Failed to update profile question" });
    }
});
router.delete("/questions/:id", async (req, res) => {
    try {
        await prisma_js_1.default.profileAnswer.delete({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
        });
        return res.json({ success: true });
    }
    catch (err) {
        console.error("[DELETE /career/questions/:id]", err);
        return res.status(500).json({ error: "Failed to delete profile question" });
    }
});
exports.default = router;
//# sourceMappingURL=career.js.map
"use strict";
// Applications Routes
// /api/applications/*
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
const utils_js_1 = require("../lib/utils.js");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// ─── GET /api/applications ────────────────────────────────────────────────────
router.get("/", async (_req, res) => {
    try {
        const applications = await prisma_js_1.default.application.findMany({
            include: {
                job: { include: { jobMatch: true } },
                answers: true,
                events: { orderBy: { occurredAt: "desc" } },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.json(applications);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch applications" });
    }
});
// ─── POST /api/applications ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
    const { jobId, notes } = req.body;
    if (!jobId) {
        return res.status(400).json({ error: "jobId is required" });
    }
    try {
        const application = await prisma_js_1.default.application.create({
            data: { jobId, notes },
            include: { job: true },
        });
        return res.status(201).json(application);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to create application" });
    }
});
// ─── GET /api/applications/:id ────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
    try {
        const application = await prisma_js_1.default.application.findUnique({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            include: {
                job: {
                    include: {
                        jobMatch: {
                            include: {
                                matchedProjects: { include: { project: true } },
                                matchedExperiences: { include: { experience: true } },
                            },
                        },
                        documents: true,
                    },
                },
                answers: true,
                events: { orderBy: { occurredAt: "desc" } },
            },
        });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }
        return res.json(application);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch application" });
    }
});
// ─── PATCH /api/applications/:id/status ──────────────────────────────────────
router.patch("/:id/status", async (req, res) => {
    const { status, note } = req.body;
    try {
        const application = await prisma_js_1.default.application.findUnique({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
        });
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }
        // Update job status + log event
        const [updatedJob, event] = await Promise.all([
            prisma_js_1.default.job.update({
                where: { id: application.jobId },
                data: { status },
            }),
            prisma_js_1.default.applicationEvent.create({
                data: {
                    applicationId: application.id,
                    status,
                    note,
                },
            }),
        ]);
        // If applied, set appliedAt
        if (status === client_1.JobStatus.APPLIED) {
            await prisma_js_1.default.application.update({
                where: { id: application.id },
                data: {
                    appliedAt: new Date(),
                    status: client_1.ApplicationStatus.SUBMITTED,
                },
            });
        }
        return res.json({ job: updatedJob, event });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update application status" });
    }
});
// ─── POST /api/applications/:id/notes ────────────────────────────────────────
router.patch("/:id/notes", async (req, res) => {
    const { notes } = req.body;
    try {
        const updated = await prisma_js_1.default.application.update({
            where: { id: (0, utils_js_1.getParam)(req.params["id"]) },
            data: { notes },
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to update notes" });
    }
});
// ─── GET /api/applications/stats/summary ─────────────────────────────────────
router.get("/stats/summary", async (_req, res) => {
    try {
        const [totalJobs, applied, interviews, offers, rejections,] = await Promise.all([
            prisma_js_1.default.job.count(),
            prisma_js_1.default.job.count({ where: { status: "APPLIED" } }),
            prisma_js_1.default.job.count({
                where: {
                    status: {
                        in: [
                            "INTERVIEW",
                            "TECHNICAL_INTERVIEW",
                            "FINAL_INTERVIEW",
                        ],
                    },
                },
            }),
            prisma_js_1.default.job.count({ where: { status: "OFFER" } }),
            prisma_js_1.default.job.count({ where: { status: "REJECTED" } }),
        ]);
        const interviewRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
        const offerRate = applied > 0 ? Math.round((offers / applied) * 100) : 0;
        return res.json({
            totalJobs,
            applied,
            interviews,
            offers,
            rejections,
            interviewRate,
            offerRate,
        });
    }
    catch (err) {
        return res.status(500).json({ error: "Failed to fetch stats" });
    }
});
exports.default = router;
//# sourceMappingURL=applications.js.map
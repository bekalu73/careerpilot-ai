// Applications Routes
// /api/applications/*

import { Router, type Request, type Response } from "express";
import prisma from "../lib/prisma.js";
import { getParam } from "../lib/utils.js";
import {
  ApplicationStatus,
  JobStatus,
} from "@prisma/client";

const router = Router();

// ─── GET /api/applications ────────────────────────────────────────────────────

router.get("/", async (_req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        job: { include: { jobMatch: true } },
        answers: true,
        events: { orderBy: { occurredAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(applications);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// ─── POST /api/applications ───────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  const { jobId, notes } = req.body as { jobId: string; notes?: string };

  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }

  try {
    const application = await prisma.application.create({
      data: { jobId, notes },
      include: { job: true },
    });
    return res.status(201).json(application);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create application" });
  }
});

// ─── GET /api/applications/:id ────────────────────────────────────────────────

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: getParam(req.params["id"]) },
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
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch application" });
  }
});

// ─── PATCH /api/applications/:id/status ──────────────────────────────────────

router.patch("/:id/status", async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: JobStatus; note?: string };

  try {
    const application = await prisma.application.findUnique({
      where: { id: getParam(req.params["id"]) },
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Update job status + log event
    const [updatedJob, event] = await Promise.all([
      prisma.job.update({
        where: { id: application.jobId },
        data: { status },
      }),
      prisma.applicationEvent.create({
        data: {
          applicationId: application.id,
          status,
          note,
        },
      }),
    ]);

    // If applied, set appliedAt
    if (status === JobStatus.APPLIED) {
      await prisma.application.update({
        where: { id: application.id },
        data: {
          appliedAt: new Date(),
          status: ApplicationStatus.SUBMITTED,
        },
      });
    }

    return res.json({ job: updatedJob, event });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update application status" });
  }
});

// ─── POST /api/applications/:id/notes ────────────────────────────────────────

router.patch("/:id/notes", async (req: Request, res: Response) => {
  const { notes } = req.body as { notes: string };
  try {
    const updated = await prisma.application.update({
      where: { id: getParam(req.params["id"]) },
      data: { notes },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update notes" });
  }
});

// ─── GET /api/applications/stats/summary ─────────────────────────────────────

router.get("/stats/summary", async (_req: Request, res: Response) => {
  try {
    const [
      totalJobs,
      applied,
      interviews,
      offers,
      rejections,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: "APPLIED" } }),
      prisma.job.count({
        where: {
          status: {
            in: [
              "INTERVIEW",
              "TECHNICAL_INTERVIEW",
              "FINAL_INTERVIEW",
            ] as JobStatus[],
          },
        },
      }),
      prisma.job.count({ where: { status: "OFFER" } }),
      prisma.job.count({ where: { status: "REJECTED" } }),
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
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;

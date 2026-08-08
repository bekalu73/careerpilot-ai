// Career Routes
// /api/career/*

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { getParam } from "../lib/utils.js";
import { parseResumeHtml } from "../ai/services/resume-parser.js";

const router = Router();

// ─── GET /api/career/profile ──────────────────────────────────────────────────

router.get("/profile", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      include: {
        experiences: { orderBy: { startDate: "desc" } },
        projects: { orderBy: { displayOrder: "asc" } },
        skills: { orderBy: { category: "asc" } },
        educations: { orderBy: { startDate: "desc" } },
        achievements: { orderBy: { date: "desc" } },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: "No career profile found" });
    }

    return res.json(candidate);
  } catch (err) {
    console.error("[GET /career/profile]", err);
    return res.status(500).json({ error: "Failed to fetch career profile" });
  }
});

// ─── POST /api/career/import-resume ──────────────────────────────────────────

const ImportResumeSchema = z.object({
  html: z.string().min(100, "Resume HTML is too short"),
});

router.post("/import-resume", async (req: Request, res: Response) => {
  const body = ImportResumeSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: body.error.flatten() });
  }

  try {
    const parsed = await parseResumeHtml(body.data.html);
    // Return parsed data for user review — NOT saved yet
    return res.json({ parsed, message: "Review and confirm to save" });
  } catch (err) {
    console.error("[POST /career/import-resume]", err);
    return res.status(500).json({
      error: "Failed to parse resume. Check your Gemini API key.",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

// ─── POST /api/career/confirm-import ─────────────────────────────────────────
// User reviews and confirms the parsed data — this saves it to the DB

const ConfirmImportSchema = z.object({
  candidate: z.object({
    name: z.string().min(1),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    professionalSummary: z.string().nullable().optional(),
    portfolioUrl: z.string().nullable().optional(),
    githubUrl: z.string().nullable().optional(),
    linkedinUrl: z.string().nullable().optional(),
  }),
  experiences: z.array(z.any()).default([]),
  projects: z.array(z.any()).default([]),
  skills: z.array(z.any()).default([]),
  educations: z.array(z.any()).default([]),
  achievements: z.array(z.any()).default([]),
});

router.post("/confirm-import", async (req: Request, res: Response) => {
  const body = ConfirmImportSchema.safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ error: body.error.flatten() });
  }

  try {
    // Delete existing candidate (single-user MVP)
    await prisma.candidate.deleteMany();

    const { candidate, experiences, projects, skills, educations, achievements } =
      body.data;

    const created = await prisma.candidate.create({
      data: {
        ...candidate,
        experiences: {
          create: experiences.map((exp: Record<string, unknown>) => ({
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
          create: projects.map((proj: Record<string, unknown>, index: number) => ({
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
          create: skills.map((skill: Record<string, unknown>) => ({
            name: String(skill["name"] ?? ""),
            category: String(skill["category"] ?? "General"),
            confirmed: false,
          })),
        },
        educations: {
          create: educations.map((edu: Record<string, unknown>) => ({
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
          create: achievements.map((ach: Record<string, unknown>) => ({
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
  } catch (err) {
    console.error("[POST /career/confirm-import]", err);
    return res.status(500).json({ error: "Failed to save career profile" });
  }
});

// ─── PATCH /api/career/profile ────────────────────────────────────────────────

router.patch("/profile", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) {
      return res.status(404).json({ error: "No career profile found" });
    }

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: req.body,
    });

    return res.json(updated);
  } catch (err) {
    console.error("[PATCH /career/profile]", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── Experience CRUD ──────────────────────────────────────────────────────────

router.get("/experiences", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const experiences = await prisma.experience.findMany({
      where: { candidateId: candidate.id },
      orderBy: { startDate: "desc" },
    });

    return res.json(experiences);
  } catch (err) {
    console.error("[GET /career/experiences]", err);
    return res.status(500).json({ error: "Failed to fetch experiences" });
  }
});

router.post("/experiences", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const experience = await prisma.experience.create({
      data: {
        candidateId: candidate.id,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });

    return res.status(201).json(experience);
  } catch (err) {
    console.error("[POST /career/experiences]", err);
    return res.status(500).json({ error: "Failed to create experience" });
  }
});

router.patch("/experiences/:id", async (req: Request, res: Response) => {
  try {
    const updated = await prisma.experience.update({
      where: { id: getParam(req.params["id"]) },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
    });
    return res.json(updated);
  } catch (err) {
    console.error("[PATCH /career/experiences/:id]", err);
    return res.status(500).json({ error: "Failed to update experience" });
  }
});

router.delete("/experiences/:id", async (req: Request, res: Response) => {
  try {
    await prisma.experience.delete({ where: { id: getParam(req.params["id"]) } });
    return res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /career/experiences/:id]", err);
    return res.status(500).json({ error: "Failed to delete experience" });
  }
});

// ─── Projects CRUD ────────────────────────────────────────────────────────────

router.get("/projects", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const projects = await prisma.project.findMany({
      where: { candidateId: candidate.id },
      orderBy: { displayOrder: "asc" },
    });

    return res.json(projects);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/projects", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const project = await prisma.project.create({
      data: {
        candidateId: candidate.id,
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });

    return res.status(201).json(project);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create project" });
  }
});

router.patch("/projects/:id", async (req: Request, res: Response) => {
  try {
    const updated = await prisma.project.update({
      where: { id: getParam(req.params["id"]) },
      data: {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/projects/:id", async (req: Request, res: Response) => {
  try {
    await prisma.project.delete({ where: { id: getParam(req.params["id"]) } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete project" });
  }
});

// ─── Skills CRUD ──────────────────────────────────────────────────────────────

router.get("/skills", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const skills = await prisma.skill.findMany({
      where: { candidateId: candidate.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return res.json(skills);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch skills" });
  }
});

router.post("/skills", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });

    const skill = await prisma.skill.create({
      data: { candidateId: candidate.id, ...req.body },
    });
    return res.status(201).json(skill);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create skill" });
  }
});

router.patch("/skills/:id", async (req: Request, res: Response) => {
  try {
    const updated = await prisma.skill.update({
      where: { id: getParam(req.params["id"]) },
      data: req.body,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update skill" });
  }
});

router.delete("/skills/:id", async (req: Request, res: Response) => {
  try {
    await prisma.skill.delete({ where: { id: getParam(req.params["id"]) } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete skill" });
  }
});

// ─── Education CRUD ───────────────────────────────────────────────────────────

router.get("/education", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });
    const edus = await prisma.education.findMany({
      where: { candidateId: candidate.id },
    });
    return res.json(edus);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch education" });
  }
});

router.post("/education", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });
    const edu = await prisma.education.create({
      data: {
        candidateId: candidate.id,
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      },
    });
    return res.status(201).json(edu);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create education" });
  }
});

router.patch("/education/:id", async (req: Request, res: Response) => {
  try {
    const updated = await prisma.education.update({
      where: { id: getParam(req.params["id"]) },
      data: req.body,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update education" });
  }
});

router.delete("/education/:id", async (req: Request, res: Response) => {
  try {
    await prisma.education.delete({ where: { id: getParam(req.params["id"]) } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete education" });
  }
});

// ─── Achievements CRUD ────────────────────────────────────────────────────────

router.get("/achievements", async (_req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });
    const items = await prisma.achievement.findMany({
      where: { candidateId: candidate.id },
      orderBy: { date: "desc" },
    });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

router.post("/achievements", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.findFirst();
    if (!candidate) return res.status(404).json({ error: "No profile found" });
    const item = await prisma.achievement.create({
      data: {
        candidateId: candidate.id,
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : null,
      },
    });
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create achievement" });
  }
});

router.patch("/achievements/:id", async (req: Request, res: Response) => {
  try {
    const updated = await prisma.achievement.update({
      where: { id: getParam(req.params["id"]) },
      data: req.body,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update achievement" });
  }
});

router.delete("/achievements/:id", async (req: Request, res: Response) => {
  try {
    await prisma.achievement.delete({ where: { id: getParam(req.params["id"]) } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete achievement" });
  }
});

export default router;

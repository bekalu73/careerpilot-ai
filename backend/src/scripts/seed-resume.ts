import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { parseResumeHtml } from "../ai/services/resume-parser.js";
import prisma from "../lib/prisma.js";

async function main() {
  console.log("Reading resume.html...");
  const resumePath = path.resolve(process.cwd(), "../resume.html");
  const html = await fs.readFile(resumePath, "utf-8");

  console.log("Parsing resume with AI parser...");
  const parsed = await parseResumeHtml(html);

  console.log("Parsed Candidate:", parsed.candidate.name);
  console.log("Experiences:", parsed.experiences.length);
  console.log("Projects:", parsed.projects.length);
  console.log("Skills:", parsed.skills.length);
  console.log("Education:", parsed.education.length);

  // Clear existing and save
  await prisma.candidate.deleteMany();

  const candidate = await prisma.candidate.create({
    data: {
      name: parsed.candidate.name,
      email: parsed.candidate.email ?? null,
      phone: parsed.candidate.phone ?? null,
      location: parsed.candidate.location ?? null,
      professionalSummary: parsed.candidate.professionalSummary ?? null,
      portfolioUrl: parsed.candidate.portfolioUrl ?? null,
      githubUrl: parsed.candidate.githubUrl ?? null,
      linkedinUrl: parsed.candidate.linkedinUrl ?? null,
      experiences: {
        create: parsed.experiences.map((exp) => ({
          company: exp.company,
          role: exp.role,
          location: exp.location ?? null,
          startDate: exp.startDate ? new Date(exp.startDate) : new Date("2020-01-01"),
          endDate: exp.endDate ? new Date(exp.endDate) : null,
          isCurrent: exp.isCurrent ?? false,
          description: exp.description ?? null,
          responsibilities: exp.responsibilities ?? [],
          technologies: exp.technologies ?? [],
          achievements: exp.achievements ?? [],
        })),
      },
      projects: {
        create: parsed.projects.map((proj, idx) => ({
          name: proj.name,
          role: proj.role ?? null,
          description: proj.description ?? null,
          url: proj.url ?? null,
          githubUrl: proj.githubUrl ?? null,
          demoUrl: proj.demoUrl ?? null,
          technologies: proj.technologies ?? [],
          domains: proj.domains ?? [],
          keywords: proj.keywords ?? [],
          responsibilities: proj.responsibilities ?? [],
          achievements: proj.achievements ?? [],
          displayOrder: idx,
        })),
      },
      skills: {
        create: parsed.skills.map((skill) => ({
          name: skill.name,
          category: skill.category ?? "TECHNICAL",
          proficiency: (skill.proficiency as any) ?? "INTERMEDIATE",
          yearsOfExperience: skill.yearsOfExperience ?? null,
          lastUsed: skill.lastUsed ? new Date(skill.lastUsed) : null,
          isVerified: true,
        })),
      },
      educations: {
        create: parsed.education.map((edu) => ({
          institution: edu.institution,
          degree: edu.degree,
          fieldOfStudy: edu.fieldOfStudy ?? null,
          location: edu.location ?? null,
          startDate: edu.startDate ? new Date(edu.startDate) : new Date("2018-01-01"),
          endDate: edu.endDate ? new Date(edu.endDate) : null,
          isCurrent: edu.isCurrent ?? false,
          gpa: edu.gpa ?? null,
          highlights: edu.highlights ?? [],
        })),
      },
      achievements: {
        create: parsed.achievements.map((ach) => ({
          title: ach.title,
          description: ach.description ?? null,
          date: ach.date ? new Date(ach.date) : null,
        })),
      },
    },
  });

  console.log("Candidate profile successfully seeded into database! Candidate ID:", candidate.id);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Failed to seed resume:", err);
  process.exit(1);
});

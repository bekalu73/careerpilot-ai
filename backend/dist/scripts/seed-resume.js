"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const promises_1 = __importDefault(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const resume_parser_js_1 = require("../ai/services/resume-parser.js");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
async function main() {
    console.log("Reading resume.html...");
    const resumePath = node_path_1.default.resolve(process.cwd(), "../resume.html");
    const html = await promises_1.default.readFile(resumePath, "utf-8");
    console.log("Parsing resume with AI parser...");
    const parsed = await (0, resume_parser_js_1.parseResumeHtml)(html);
    console.log("Parsed Candidate:", parsed.candidate.name);
    console.log("Experiences:", parsed.experiences.length);
    console.log("Projects:", parsed.projects.length);
    console.log("Skills:", parsed.skills.length);
    console.log("Education:", parsed.educations.length);
    // Clear existing and save
    await prisma_js_1.default.candidate.deleteMany();
    const candidate = await prisma_js_1.default.candidate.create({
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
                    jobTitle: exp.jobTitle,
                    location: exp.location ?? null,
                    startDate: exp.startDate ? new Date(exp.startDate) : new Date("2020-01-01"),
                    endDate: exp.endDate ? new Date(exp.endDate) : null,
                    isCurrent: exp.isCurrent ?? false,
                    description: exp.description ?? null,
                    responsibilities: exp.responsibilities ?? [],
                    technologies: exp.technologies ?? [],
                    achievements: exp.achievements ?? [],
                    domains: exp.domains ?? [],
                })),
            },
            projects: {
                create: parsed.projects.map((proj, idx) => ({
                    name: proj.name,
                    role: proj.role ?? null,
                    description: proj.description ?? null,
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
                    confirmed: true,
                })),
            },
            educations: {
                create: parsed.educations.map((edu) => ({
                    institution: edu.institution,
                    degree: edu.degree ?? null,
                    field: edu.field ?? null,
                    startDate: edu.startDate ? new Date(edu.startDate) : new Date("2018-01-01"),
                    endDate: edu.endDate ? new Date(edu.endDate) : null,
                    gpa: edu.gpa ?? null,
                    description: edu.description ?? null,
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
    await prisma_js_1.default.$disconnect();
}
main().catch((err) => {
    console.error("Failed to seed resume:", err);
    process.exit(1);
});
//# sourceMappingURL=seed-resume.js.map
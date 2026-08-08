import "dotenv/config";
import { factCheckDocument } from "../ai/services/fact-checker.js";
import prisma from "../lib/prisma.js";

async function main() {
  const doc = await prisma.generatedDocument.findFirst({ where: { type: "COVER_LETTER" } });
  const candidate = await prisma.candidate.findFirst({
    include: { experiences: true, projects: true, skills: true, educations: true, achievements: true },
  });

  console.log("Found doc:", doc?.id, "Candidate:", candidate?.name);
  if (!doc || !candidate) return;

  try {
    const res = await factCheckDocument(doc.content, JSON.stringify(candidate), doc.jobId);
    console.log("Fact check result:", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Fact check error:", err);
  }
  await prisma.$disconnect();
}

main();

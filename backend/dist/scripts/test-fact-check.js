"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fact_checker_js_1 = require("../ai/services/fact-checker.js");
const prisma_js_1 = __importDefault(require("../lib/prisma.js"));
async function main() {
    const doc = await prisma_js_1.default.generatedDocument.findFirst({ where: { type: "COVER_LETTER" } });
    const candidate = await prisma_js_1.default.candidate.findFirst({
        include: { experiences: true, projects: true, skills: true, educations: true, achievements: true },
    });
    console.log("Found doc:", doc?.id, "Candidate:", candidate?.name);
    if (!doc || !candidate)
        return;
    try {
        const res = await (0, fact_checker_js_1.factCheckDocument)(doc.content, JSON.stringify(candidate), doc.jobId);
        console.log("Fact check result:", JSON.stringify(res, null, 2));
    }
    catch (err) {
        console.error("Fact check error:", err);
    }
    await prisma_js_1.default.$disconnect();
}
main();
//# sourceMappingURL=test-fact-check.js.map
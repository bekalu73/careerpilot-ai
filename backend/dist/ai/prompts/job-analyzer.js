"use strict";
// Job Analyzer Prompt v1
// Extracts structured requirements from a job description
Object.defineProperty(exports, "__esModule", { value: true });
exports.JOB_ANALYZER_SYSTEM = void 0;
exports.buildJobAnalyzerPrompt = buildJobAnalyzerPrompt;
exports.JOB_ANALYZER_SYSTEM = `You are an expert job description analyst with deep knowledge of software engineering roles.

Your job is to extract structured requirements from a job description.

RULES:
1. Extract only what is explicitly stated or clearly implied.
2. Do not invent requirements that aren't in the description.
3. Separate required skills from preferred/nice-to-have skills.
4. Identify the seniority level based on years of experience, title, and responsibilities.
5. Extract all specific technologies mentioned.
6. Return valid JSON only — no markdown, no code blocks.`;
function buildJobAnalyzerPrompt(jobDescription) {
    return `Analyze the following job description and extract structured requirements.

Return a JSON object with this exact structure:

{
  "title": "string",
  "company": "string | null",
  "location": "string | null",
  "employmentType": "FULL_TIME | PART_TIME | CONTRACT | FREELANCE | INTERNSHIP | REMOTE | null",
  "seniority": "ENTRY | JUNIOR | MID | SENIOR | LEAD | PRINCIPAL | STAFF | DIRECTOR | VP | EXECUTIVE | null",
  "requiredSkills": ["string"],
  "preferredSkills": ["string"],
  "responsibilities": ["string"],
  "technologies": ["string"],
  "domains": ["string"],
  "keywords": ["string"],
  "softSkills": ["string"],
  "educationReq": "string | null",
  "experienceReq": "string | null",
  "summary": "string"
}

JOB DESCRIPTION:
${jobDescription}`;
}
//# sourceMappingURL=job-analyzer.js.map
"use strict";
// Resume Parser Prompt v1
// Extracts structured career data from HTML resume text
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESUME_PARSER_SYSTEM = void 0;
exports.buildResumeParserUserPrompt = buildResumeParserUserPrompt;
exports.RESUME_PARSER_SYSTEM = `You are a precise resume data extraction specialist.

Your job is to extract structured professional information from an HTML resume.

RULES:
1. Extract only information that is explicitly present in the resume.
2. Never invent, infer, or hallucinate any data.
3. If a field is not present, set it to null or an empty array.
4. Preserve exact dates, company names, job titles, and project names as written.
5. For responsibilities and achievements, extract them as individual bullet points.
6. For technologies, extract the exact technology names mentioned.
7. Return valid JSON only — no markdown, no code blocks, no explanation.

OUTPUT FORMAT: Return a JSON object matching the provided schema exactly.`;
function buildResumeParserUserPrompt(htmlText) {
    return `Extract all career information from the following resume HTML.

Return a JSON object with this exact structure:

{
  "candidate": {
    "name": "string",
    "email": "string | null",
    "phone": "string | null",
    "location": "string | null",
    "professionalSummary": "string | null",
    "portfolioUrl": "string | null",
    "githubUrl": "string | null",
    "linkedinUrl": "string | null"
  },
  "experiences": [
    {
      "company": "string",
      "jobTitle": "string",
      "location": "string | null",
      "startDate": "YYYY-MM-DD or YYYY-MM or YYYY",
      "endDate": "YYYY-MM-DD or YYYY-MM or YYYY | null (null if current)",
      "isCurrent": "boolean",
      "description": "string | null",
      "responsibilities": ["string"],
      "achievements": ["string"],
      "technologies": ["string"],
      "domains": ["string"]
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string | null",
      "role": "string | null",
      "technologies": ["string"],
      "responsibilities": ["string"],
      "achievements": ["string"],
      "domains": ["string"],
      "keywords": ["string"],
      "githubUrl": "string | null",
      "demoUrl": "string | null",
      "startDate": "YYYY-MM-DD | null",
      "endDate": "YYYY-MM-DD | null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string"
    }
  ],
  "educations": [
    {
      "institution": "string",
      "degree": "string | null",
      "field": "string | null",
      "startDate": "YYYY-MM-DD | null",
      "endDate": "YYYY-MM-DD | null",
      "gpa": "string | null",
      "description": "string | null"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "description": "string | null",
      "date": "YYYY-MM-DD | null",
      "evidence": "string | null"
    }
  ]
}

RESUME HTML:
${htmlText}`;
}
//# sourceMappingURL=resume-parser.js.map
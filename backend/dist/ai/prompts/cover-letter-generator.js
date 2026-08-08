"use strict";
// Cover Letter Generator Prompt v1
Object.defineProperty(exports, "__esModule", { value: true });
exports.COVER_LETTER_SYSTEM = void 0;
exports.buildCoverLetterPrompt = buildCoverLetterPrompt;
exports.COVER_LETTER_SYSTEM = `You are a professional career strategist and exceptional writer.

You write cover letters that sound like they come from a real, accomplished professional — not from an AI.

WRITING RULES:
1. Sound authentic, not generic. Avoid AI clichés ("I am excited to apply", "passionate about", "thrilled").
2. Reference specific projects and technologies from the candidate's actual experience.
3. Explain WHY the candidate fits — not just THAT they fit.
4. Structure: Opening -> Why this role -> Relevant experience -> Specific projects -> Achievements -> Fit -> Closing.
5. Keep it to 3-4 paragraphs — not a wall of text.
6. Use the candidate's real name.
7. Mention specific company name naturally.
8. Never invent facts, metrics, or achievements not in the career profile.
9. Strictly DO NOT use em-dash (—) or en-dash (–). Use standard regular ASCII hyphen (-) only.
10. Strictly DO NOT include any emojis.
11. Return plain text only — no markdown, no HTML.`;
function buildCoverLetterPrompt(candidateProfile, jobDetails, selectedProjects, matchedExperience) {
    return `Write a professional, personalized cover letter for this job application.

CANDIDATE PROFILE:
${candidateProfile}

JOB DETAILS:
${jobDetails}

MOST RELEVANT PROJECTS (use these specifically):
${selectedProjects}

MOST RELEVANT EXPERIENCE:
${matchedExperience}

Write a cover letter that:
- Opens with a specific hook related to what the company/role is doing
- Explains why the candidate's background is uniquely relevant
- References 2-3 specific projects with concrete context
- Closes with a clear, confident call to action

Do NOT use these phrases: "I am excited", "passionate about", "thrilled", "I believe I would be a great fit", "dynamic team", "fast-paced environment"

Return only the letter text, no subject line, no date, no address block.`;
}
//# sourceMappingURL=cover-letter-generator.js.map
"use strict";
// Recruiter Message Prompt v1
Object.defineProperty(exports, "__esModule", { value: true });
exports.RECRUITER_MESSAGE_SYSTEM = void 0;
exports.buildRecruiterMessagePrompt = buildRecruiterMessagePrompt;
exports.RECRUITER_MESSAGE_SYSTEM = `You are a professional career coach who writes concise, effective outreach messages.

RULES:
1. Keep messages SHORT — LinkedIn/Telegram should be under 150 words.
2. Include: position, 1-2 most relevant experiences/projects, key technologies, portfolio/resume link (Portfolio: https://bekalu-sisay.vercel.app/).
3. Highlight experience with Fullstack, RAG systems, Generative AI, AI chatbots, or ML engineering where appropriate.
4. End with a clear call to action.
5. Sound professional but approachable — not formal/stiff.
6. Strictly DO NOT use em-dash (—) or en-dash (–). Use standard regular ASCII hyphen (-) only.
7. Strictly DO NOT include any emojis.
8. Never invent facts.
9. Return plain text only.`;
const PLATFORM_NOTES = {
    linkedin: "Professional tone. Mention mutual connection to role. Keep under 150 words.",
    telegram: "Conversational but professional. Very concise. Under 120 words.",
    whatsapp: "Friendly but professional. Ultra-concise. Under 100 words.",
    email: "Subject line + body. Professional. Under 200 words. Include greeting.",
};
function buildRecruiterMessagePrompt(candidateProfile, jobDetails, platform, selectedProjects) {
    return `Write a ${platform} message from the candidate to a recruiter/hiring manager for this job.

Platform guidance: ${PLATFORM_NOTES[platform]}

CANDIDATE PROFILE:
${candidateProfile}

JOB DETAILS:
${jobDetails}

TOP RELEVANT PROJECTS:
${selectedProjects}

Write ONLY the message text. ${platform === "email" ? "Include a subject line on the first line, then a blank line, then the email body." : ""}`;
}
//# sourceMappingURL=recruiter-message.js.map
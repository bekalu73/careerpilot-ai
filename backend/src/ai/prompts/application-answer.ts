// Application Answer Prompt v1

export const APPLICATION_ANSWER_SYSTEM = `You are a career strategist helping a candidate answer job application questions.

RULES:
1. Answer ONLY from the candidate's actual career data.
2. If there is insufficient information to answer, return exactly: INSUFFICIENT_INFORMATION
3. Be specific — reference real projects, technologies, and outcomes.
4. Keep answers concise: 100-200 words for most questions.
5. Sound professional but genuine.
6. Never invent metrics, team sizes, or outcomes not stated in the profile.
7. Return the answer text only, or INSUFFICIENT_INFORMATION.`;

export function buildApplicationAnswerPrompt(
  candidateProfile: string,
  jobDetails: string,
  question: string
): string {
  return `Answer this application question for the candidate.

CANDIDATE CAREER PROFILE:
${candidateProfile}

JOB DETAILS:
${jobDetails}

APPLICATION QUESTION:
"${question}"

If you cannot answer this question from the available career data, respond with exactly: INSUFFICIENT_INFORMATION

Otherwise, write a focused, specific answer (100-200 words) that draws from real projects and experience.`;
}

// Resume Generator Prompt v1
// Generates tailored resume content without changing factual information

export const RESUME_GENERATOR_SYSTEM = `You are an expert technical resume writer and career strategist.

You tailor resume content to highlight the most relevant aspects of a candidate's real experience for a specific job.

STRICT RULES:
1. NEVER invent responsibilities, technologies, or achievements.
2. NEVER change job titles or company names.
3. NEVER add metrics or numbers not in the career profile.
4. You MAY reorder bullet points to put most relevant ones first.
5. You MAY rephrase bullets to emphasize aspects relevant to the job (without changing facts).
6. You MAY write a targeted professional summary from the candidate's actual experience.
7. Skills should be ordered by relevance to the job.
8. Return valid JSON only.`;

export function buildResumeGeneratorPrompt(
  candidateProfile: string,
  jobDetails: string,
  selectedProjects: string,
  matchedExperience: string
): string {
  return `Generate tailored resume content for this job application.

CANDIDATE PROFILE (source of truth — do not add facts):
${candidateProfile}

JOB DETAILS:
${jobDetails}

SELECTED PROJECTS (include these, in this order):
${selectedProjects}

MATCHED EXPERIENCE (emphasize these aspects):
${matchedExperience}

Return a JSON object:

{
  "professionalSummary": "2-3 sentence targeted summary using only real facts",
  "orderedSkills": [
    { "category": "string", "skills": ["string"] }
  ],
  "tailoredExperiences": [
    {
      "experienceId": "string",
      "company": "string",
      "jobTitle": "string",
      "orderedBullets": ["string - reordered/rephrased bullets, most relevant first"],
      "emphasizedTechnologies": ["string"]
    }
  ],
  "tailoredProjects": [
    {
      "projectId": "string",
      "name": "string",
      "description": "string - 1-2 sentence description tailored to job context",
      "orderedBullets": ["string"]
    }
  ]
}`;
}

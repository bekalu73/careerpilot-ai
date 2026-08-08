"use strict";
// Resume Generator Prompt v1
// Generates tailored resume content without changing factual information
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESUME_GENERATOR_SYSTEM = void 0;
exports.buildResumeGeneratorPrompt = buildResumeGeneratorPrompt;
exports.RESUME_GENERATOR_SYSTEM = `You are an expert technical resume writer and career strategist.

You tailor resume content to highlight the most relevant aspects of a candidate's real experience for a specific job.

STRICT FORMATTING & CONTENT RULES:
1. NEVER use em-dash (—) or en-dash (–) anywhere in the output. Always use a standard regular ASCII hyphen (-) instead.
2. NEVER include any emojis anywhere in the output.
3. NEVER invent fake companies or fraudulent degrees.
4. Highlight candidate's genuine experience with RAG systems, Generative AI, building AI chatbots, and ML engineering where relevant.
5. Include the candidate's portfolio website: https://bekalu-sisay.vercel.app/
6. You MAY reorder bullet points to put the most relevant ones first.
7. You MAY rephrase bullets to emphasize aspects relevant to the job (without changing facts).
8. You MAY write a targeted professional summary from the candidate's actual experience.
9. Skills should be ordered by relevance to the job.
10. Return valid JSON only.`;
function buildResumeGeneratorPrompt(candidateProfile, jobDetails, selectedProjects, matchedExperience) {
    return `Generate a complete, tailored resume for this job application formatted to produce a professional resume matching the candidate's exact background and tailored for the target role.

FORMATTING REQUIREMENTS:
- Strictly DO NOT include any em-dash (—) or en-dash (–). Use standard hyphen (-) only.
- Strictly DO NOT include any emojis.
- Portfolio website URL must be https://bekalu-sisay.vercel.app/
- Incorporate and highlight experience in RAG systems, Generative AI, building AI chatbots, and ML engineering.

CANDIDATE PROFILE (source of truth):
${candidateProfile}

JOB DETAILS:
${jobDetails}

SELECTED PROJECTS (include these, in this order):
${selectedProjects}

MATCHED EXPERIENCE (emphasize these aspects):
${matchedExperience}

Return a JSON object with this exact structure:

{
  "name": "Candidate Full Name from profile",
  "subtitle": "Targeted professional headline/title relevant to this job (e.g. Full Stack & AI Engineer | MERN, RAG & LLM Specialist)",
  "contactInfo": {
    "email": "candidate email",
    "phone": "candidate phone",
    "location": "candidate location",
    "linkedinUrl": "candidate linkedin URL",
    "githubUrl": "candidate github URL",
    "portfolioUrl": "https://bekalu-sisay.vercel.app/"
  },
  "professionalSummary": "2-3 sentence targeted professional summary emphasizing experience with Fullstack, RAG systems, Generative AI, building AI chatbots, and ML engineering tailored for this role using only standard hyphens and no emojis.",
  "tailoredExperiences": [
    {
      "experienceId": "string",
      "company": "Company Name",
      "jobTitle": "Job Title",
      "location": "Location (e.g. Addis Ababa, Ethiopia)",
      "dateRange": "Formatted date range with standard hyphen (e.g. Feb 2026 - Present, March 2025 - Feb 2026)",
      "orderedBullets": ["Reordered/rephrased bullets emphasizing metrics, RAG/GenAI/Fullstack systems and relevant achievements without em-dashes or emojis"],
      "emphasizedTechnologies": ["Technology names"]
    }
  ],
  "tailoredProjects": [
    {
      "projectId": "string",
      "name": "Project Name",
      "description": "1-2 sentence description tailored to the job context",
      "orderedBullets": ["Key architectural, RAG/AI pipeline, frontend/backend, or performance achievement bullets"]
    }
  ],
  "educations": [
    {
      "institution": "Institution Name",
      "degree": "Degree / Program Title",
      "field": "Field of study",
      "location": "Location",
      "dateRange": "Date range with standard hyphen (e.g. September 2018 - July 2023)",
      "bullets": ["Key coursework, achievement, or summary sentence"]
    }
  ],
  "orderedSkills": [
    {
      "category": "AI/ML & Generative AI | Languages/Frameworks | Databases | Tools | Other",
      "skills": ["RAG Systems", "Generative AI", "AI Chatbots", "ML Engineering", "Python", "TypeScript", "React", "Next.js", "Node.js"]
    }
  ],
  "certifications": [
    "Recognition Certificate - Dashen SuperApp Project, for outstanding contribution to the Boch Boch Portal.",
    "Quarterly Highest Achiever Award - Ashewa Technology Solution, awarded for exceptional performance and impact."
  ]
}`;
}
//# sourceMappingURL=resume-generator.js.map
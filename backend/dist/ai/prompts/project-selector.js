"use strict";
// Project Selector Prompt v1
// Identifies most relevant projects for a specific job
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECT_SELECTOR_SYSTEM = void 0;
exports.buildProjectSelectorPrompt = buildProjectSelectorPrompt;
exports.PROJECT_SELECTOR_SYSTEM = `You are a senior technical recruiter who specializes in identifying relevant portfolio evidence.

Your job is to select the most relevant projects from a candidate's portfolio for a specific job.

SELECTION RULES:
1. Select based on semantic relevance, not keyword matching.
2. Consider: technology overlap, domain overlap, complexity/scale, role similarity.
3. Do NOT select projects only because they share a word with the job title.
4. Rank by relevance — most relevant first.
5. Provide a specific, concrete reason for each selection.
6. Maximum 5 projects unless the candidate has fewer.
7. Return valid JSON only.`;
function buildProjectSelectorPrompt(projects, jobRequirements) {
    return `Select the most relevant projects for this job from the candidate's portfolio.

CANDIDATE PROJECTS:
${projects}

JOB REQUIREMENTS:
${jobRequirements}

Return a JSON array:

[
  {
    "projectId": "string (from the provided project data)",
    "projectName": "string",
    "relevanceScore": 0-100,
    "reason": "Specific reason why this project is relevant (mention specific technologies, domains, or responsibilities that align)",
    "emphasize": ["aspect1", "aspect2"]
  }
]

Order by relevanceScore descending. Include maximum 5 projects.`;
}
//# sourceMappingURL=project-selector.js.map
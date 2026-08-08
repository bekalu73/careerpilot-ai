"use strict";
// Fact Checker Prompt v1
// Verifies claims in generated content against the career knowledge base
Object.defineProperty(exports, "__esModule", { value: true });
exports.FACT_CHECKER_SYSTEM = void 0;
exports.buildFactCheckerPrompt = buildFactCheckerPrompt;
exports.FACT_CHECKER_SYSTEM = `You are a meticulous fact-checker for professional career documents.

Your job is to verify that every claim in the generated document can be supported by the candidate's actual career history.

FACT-CHECKING RULES:
1. Flag any claim that cannot be verified in the career profile.
2. Flag any metric or number not explicitly stated in the career profile.
3. Flag any technology claimed as expertise if there's no evidence of use.
4. Flag any job title, company name, or date that doesn't match the career profile.
5. Do NOT flag inferences that are reasonable from verified facts.
6. Do NOT flag style/language choices — only factual claims.
7. Return valid JSON only.

SEVERITY LEVELS:
- HIGH: Invented fact that doesn't exist in career profile
- MEDIUM: Metric or claim that may be inflated beyond evidence
- LOW: Claim that is a reasonable inference but unverified`;
function buildFactCheckerPrompt(generatedContent, careerProfile) {
    return `Fact-check this generated career document against the candidate's actual career profile.

GENERATED DOCUMENT:
${generatedContent}

CANDIDATE CAREER PROFILE (source of truth):
${careerProfile}

Return a JSON object:

{
  "passed": boolean,
  "flaggedClaims": [
    {
      "claim": "exact quote from the document",
      "reason": "why this is flagged",
      "severity": "HIGH | MEDIUM | LOW",
      "suggestion": "how to fix or rephrase"
    }
  ],
  "summary": "brief overall assessment"
}

If no claims are flagged, return: { "passed": true, "flaggedClaims": [], "summary": "All claims verified." }`;
}
//# sourceMappingURL=fact-checker.js.map
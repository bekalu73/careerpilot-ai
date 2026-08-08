// Candidate Matcher Service
// Scores candidate against job requirements and selects relevant projects

import { reasoningProvider } from "../provider.js";
import {
  CANDIDATE_MATCHER_SYSTEM,
  buildCandidateMatcherPrompt,
} from "../prompts/candidate-matcher.js";
import {
  PROJECT_SELECTOR_SYSTEM,
  buildProjectSelectorPrompt,
} from "../prompts/project-selector.js";
import {
  CandidateMatcherResultSchema,
  ProjectSelectorResultSchema,
  type CandidateMatcherResult,
  type ProjectSelectorResult,
} from "../schemas/index.js";
import { parseAIJson } from "../utils.js";
import prisma from "../../lib/prisma.js";
import { AIOperationType } from "@prisma/client";

/**
 * Scores a candidate against a job, returning match breakdown + explainability.
 */
export async function matchCandidateToJob(
  candidateProfileJson: string,
  jobRequirementsJson: string,
  jobId: string
): Promise<CandidateMatcherResult> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await reasoningProvider.complete({
      messages: [
        { role: "system", content: CANDIDATE_MATCHER_SYSTEM },
        {
          role: "user",
          content: buildCandidateMatcherPrompt(
            candidateProfileJson,
            jobRequirementsJson
          ),
        },
      ],
      temperature: 0.2,
      maxTokens: 8192,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch {
      outputStatus = "validation_failed";
      throw new Error("AI returned invalid JSON for candidate matching");
    }

    const validated = CandidateMatcherResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(`Match validation failed: ${validated.error.message}`);
    }

    return validated.data;
  } catch (err) {
    outputStatus = outputStatus === "success" ? "error" : outputStatus;
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId,
          operationType: AIOperationType.CANDIDATE_MATCH,
          model: reasoningProvider.model,
          inputMetadata: {},
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

/**
 * Selects the most relevant projects for a specific job.
 */
export async function selectRelevantProjects(
  projectsJson: string,
  jobRequirementsJson: string,
  jobId: string
): Promise<ProjectSelectorResult> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await reasoningProvider.complete({
      messages: [
        { role: "system", content: PROJECT_SELECTOR_SYSTEM },
        {
          role: "user",
          content: buildProjectSelectorPrompt(
            projectsJson,
            jobRequirementsJson
          ),
        },
      ],
      temperature: 0.2,
      maxTokens: 8192,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch {
      outputStatus = "validation_failed";
      throw new Error("AI returned invalid JSON for project selection");
    }

    const validated = ProjectSelectorResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(
        `Project selection validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
  } catch (err) {
    outputStatus = outputStatus === "success" ? "error" : outputStatus;
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId,
          operationType: AIOperationType.PROJECT_SELECT,
          model: reasoningProvider.model,
          inputMetadata: {},
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

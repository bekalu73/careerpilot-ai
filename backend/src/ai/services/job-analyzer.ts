// Job Analyzer Service

import { primaryProvider } from "../provider.js";
import {
  JOB_ANALYZER_SYSTEM,
  buildJobAnalyzerPrompt,
} from "../prompts/job-analyzer.js";
import {
  JobAnalyzerResultSchema,
  type JobAnalyzerResult,
} from "../schemas/index.js";
import { parseAIJson } from "../utils.js";
import prisma from "../../lib/prisma.js";
import { AIOperationType } from "@prisma/client";

export async function analyzeJobDescription(
  description: string,
  jobId?: string
): Promise<JobAnalyzerResult> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: JOB_ANALYZER_SYSTEM },
        { role: "user", content: buildJobAnalyzerPrompt(description) },
      ],
      temperature: 0.2,
      maxTokens: 4096,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch {
      outputStatus = "validation_failed";
      throw new Error("AI returned invalid JSON for job analysis");
    }

    const validated = JobAnalyzerResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(`Job analysis validation failed: ${validated.error.message}`);
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
          jobId: jobId ?? null,
          operationType: AIOperationType.JOB_ANALYZE,
          model: primaryProvider.model,
          inputMetadata: { descriptionLength: description.length },
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

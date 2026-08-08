// Fact Checker Service

import { reasoningProvider } from "../provider.js";
import {
  FACT_CHECKER_SYSTEM,
  buildFactCheckerPrompt,
} from "../prompts/fact-checker.js";
import {
  FactCheckerResultSchema,
  type FactCheckerResult,
} from "../schemas/index.js";
import { parseAIJson } from "../utils.js";
import prisma from "../../lib/prisma.js";
import { AIOperationType } from "@prisma/client";

export async function factCheckDocument(
  generatedContent: string,
  careerProfileJson: string,
  jobId: string
): Promise<FactCheckerResult> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await reasoningProvider.complete({
      messages: [
        { role: "system", content: FACT_CHECKER_SYSTEM },
        {
          role: "user",
          content: buildFactCheckerPrompt(generatedContent, careerProfileJson),
        },
      ],
      temperature: 0.1,
      maxTokens: 8192,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch (parseErr) {
      outputStatus = "validation_failed";
      console.error("[factCheckDocument] Raw content:", result.content);
      throw new Error(`AI returned invalid JSON for fact checking: ${(parseErr as Error).message}`);
    }

    const validated = FactCheckerResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(`Fact check validation failed: ${validated.error.message}`);
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
          operationType: AIOperationType.FACT_CHECK,
          model: reasoningProvider.model,
          inputMetadata: { contentLength: generatedContent.length },
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

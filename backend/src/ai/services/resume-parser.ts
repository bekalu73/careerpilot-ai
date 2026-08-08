// Resume Parser Service
// Orchestrates: HTML extraction → Gemini → Zod validation → structured result

import * as cheerio from "cheerio";
import { primaryProvider } from "../provider.js";
import {
  RESUME_PARSER_SYSTEM,
  buildResumeParserUserPrompt,
} from "../prompts/resume-parser.js";
import {
  ResumeParserResultSchema,
  type ResumeParserResult,
} from "../schemas/index.js";
import { parseAIJson } from "../utils.js";
import prisma from "../../lib/prisma.js";
import { AIOperationType } from "@prisma/client";

/**
 * Extracts clean text from resume HTML using cheerio.
 * We don't send the full HTML to Gemini — we send clean text.
 */
export function extractTextFromHtml(html: string): string {
  const $ = cheerio.load(html);

  // Remove script/style tags
  $("script, style").remove();

  // Get text with some structure preserved
  return $("body").text().replace(/\s+/g, " ").trim();
}

/**
 * Parses a resume HTML string using Gemini and returns structured career data.
 * All AI output is validated with Zod before being returned.
 */
export async function parseResumeHtml(
  html: string,
  jobId?: string
): Promise<ResumeParserResult> {
  const startTime = Date.now();

  // Extract clean text from HTML (don't send raw HTML to AI)
  const resumeText = extractTextFromHtml(html);

  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: RESUME_PARSER_SYSTEM },
        {
          role: "user",
          content: buildResumeParserUserPrompt(resumeText),
        },
      ],
      temperature: 0.1, // Low temperature for factual extraction
      maxTokens: 8192,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    // Parse and validate with Zod
    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch {
      outputStatus = "validation_failed";
      throw new Error("AI returned invalid JSON for resume parsing");
    }

    const validated = ResumeParserResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(
        `Resume parse validation failed: ${validated.error.message}`
      );
    }

    return validated.data;
  } catch (err) {
    outputStatus = outputStatus === "success" ? "error" : outputStatus;
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    // Log the AI execution (non-blocking)
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId: jobId ?? null,
          operationType: AIOperationType.RESUME_PARSE,
          model: primaryProvider.model,
          inputMetadata: {
            htmlLength: html.length,
            textLength: resumeText.length,
          },
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error); // Don't fail the main operation if logging fails
  }
}

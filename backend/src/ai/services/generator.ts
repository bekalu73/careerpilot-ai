// Generator Service
// Orchestrates cover letter, resume tailoring, recruiter messages, and application answers

import { primaryProvider } from "../provider.js";
import {
  COVER_LETTER_SYSTEM,
  buildCoverLetterPrompt,
} from "../prompts/cover-letter-generator.js";
import {
  RECRUITER_MESSAGE_SYSTEM,
  buildRecruiterMessagePrompt,
  type MessagePlatform,
} from "../prompts/recruiter-message.js";
import {
  APPLICATION_ANSWER_SYSTEM,
  buildApplicationAnswerPrompt,
  buildChatCopilotPrompt,
} from "../prompts/application-answer.js";
import {
  RESUME_GENERATOR_SYSTEM,
  buildResumeGeneratorPrompt,
} from "../prompts/resume-generator.js";
import {
  ResumeGeneratorResultSchema,
  type ResumeGeneratorResult,
} from "../schemas/index.js";
import { parseAIJson } from "../utils.js";
import prisma from "../../lib/prisma.js";
import { AIOperationType } from "@prisma/client";

export async function generateCoverLetter(
  candidateProfile: string,
  jobDetails: string,
  selectedProjects: string,
  matchedExperience: string,
  jobId: string
): Promise<string> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: COVER_LETTER_SYSTEM },
        {
          role: "user",
          content: buildCoverLetterPrompt(
            candidateProfile,
            jobDetails,
            selectedProjects,
            matchedExperience
          ),
        },
      ],
      temperature: 0.5,
      maxTokens: 4096,
    });

    tokensUsed = result.tokensUsed;
    return result.content;
  } catch (err) {
    outputStatus = "error";
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId,
          operationType: AIOperationType.COVER_LETTER_GENERATE,
          model: primaryProvider.model,
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

export async function generateRecruiterMessage(
  candidateProfile: string,
  jobDetails: string,
  platform: MessagePlatform,
  selectedProjects: string,
  jobId: string
): Promise<string> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: RECRUITER_MESSAGE_SYSTEM },
        {
          role: "user",
          content: buildRecruiterMessagePrompt(
            candidateProfile,
            jobDetails,
            platform,
            selectedProjects
          ),
        },
      ],
      temperature: 0.5,
      maxTokens: 1024,
    });

    tokensUsed = result.tokensUsed;
    return result.content;
  } catch (err) {
    outputStatus = "error";
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId,
          operationType: AIOperationType.RECRUITER_MESSAGE_GENERATE,
          model: primaryProvider.model,
          inputMetadata: { platform },
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

export async function generateApplicationAnswer(
  candidateProfile: string,
  jobDetails: string,
  question: string,
  jobId?: string,
  instructions?: string
): Promise<string> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: APPLICATION_ANSWER_SYSTEM },
        {
          role: "user",
          content: buildApplicationAnswerPrompt(
            candidateProfile,
            jobDetails,
            question,
            instructions
          ),
        },
      ],
      temperature: 0.4,
      maxTokens: 2048,
    });

    tokensUsed = result.tokensUsed;
    return result.content;
  } catch (err) {
    outputStatus = "error";
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    if (jobId) {
      const durationMs = Date.now() - startTime;
      prisma.aIExecution
        .create({
          data: {
            jobId,
            operationType: AIOperationType.APPLICATION_ANSWER_GENERATE,
            model: primaryProvider.model,
            inputMetadata: { question },
            outputStatus,
            tokensUsed: tokensUsed ?? null,
            durationMs,
            errorMessage: errorMessage ?? null,
          },
        })
        .catch(console.error);
    }
  }
}

export async function chatWithApplicationCopilot(
  candidateProfile: string,
  jobDetails: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  message: string,
  jobId: string
): Promise<string> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const { messages } = buildChatCopilotPrompt(
      candidateProfile,
      jobDetails,
      history,
      message
    );

    const result = await primaryProvider.complete({
      messages,
      temperature: 0.5,
      maxTokens: 2048,
    });

    tokensUsed = result.tokensUsed;
    return result.content;
  } catch (err) {
    outputStatus = "error";
    errorMessage = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const durationMs = Date.now() - startTime;
    prisma.aIExecution
      .create({
        data: {
          jobId,
          operationType: AIOperationType.APPLICATION_ANSWER_GENERATE,
          model: primaryProvider.model,
          inputMetadata: { message, historyLength: history.length },
          outputStatus,
          tokensUsed: tokensUsed ?? null,
          durationMs,
          errorMessage: errorMessage ?? null,
        },
      })
      .catch(console.error);
  }
}

export async function generateTailoredResume(
  candidateProfile: string,
  jobDetails: string,
  selectedProjects: string,
  matchedExperience: string,
  jobId: string
): Promise<ResumeGeneratorResult> {
  const startTime = Date.now();
  let outputStatus = "success";
  let tokensUsed: number | undefined;
  let errorMessage: string | undefined;

  try {
    const result = await primaryProvider.complete({
      messages: [
        { role: "system", content: RESUME_GENERATOR_SYSTEM },
        {
          role: "user",
          content: buildResumeGeneratorPrompt(
            candidateProfile,
            jobDetails,
            selectedProjects,
            matchedExperience
          ),
        },
      ],
      temperature: 0.3,
      maxTokens: 8192,
      responseFormat: "json",
    });

    tokensUsed = result.tokensUsed;

    let parsed: unknown;
    try {
      parsed = parseAIJson(result.content);
    } catch {
      outputStatus = "validation_failed";
      throw new Error("AI returned invalid JSON for resume generation");
    }

    const validated = ResumeGeneratorResultSchema.safeParse(parsed);
    if (!validated.success) {
      outputStatus = "validation_failed";
      throw new Error(
        `Resume generation validation failed: ${validated.error.message}`
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
          operationType: AIOperationType.RESUME_GENERATE,
          model: primaryProvider.model,
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

"use strict";
// Generator Service
// Orchestrates cover letter, resume tailoring, recruiter messages, and application answers
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCoverLetter = generateCoverLetter;
exports.generateRecruiterMessage = generateRecruiterMessage;
exports.generateApplicationAnswer = generateApplicationAnswer;
exports.chatWithApplicationCopilot = chatWithApplicationCopilot;
exports.generateTailoredResume = generateTailoredResume;
const provider_js_1 = require("../provider.js");
const cover_letter_generator_js_1 = require("../prompts/cover-letter-generator.js");
const recruiter_message_js_1 = require("../prompts/recruiter-message.js");
const application_answer_js_1 = require("../prompts/application-answer.js");
const resume_generator_js_1 = require("../prompts/resume-generator.js");
const index_js_1 = require("../schemas/index.js");
const utils_js_1 = require("../utils.js");
const prisma_js_1 = __importDefault(require("../../lib/prisma.js"));
const client_1 = require("@prisma/client");
async function generateCoverLetter(candidateProfile, jobDetails, selectedProjects, matchedExperience, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: cover_letter_generator_js_1.COVER_LETTER_SYSTEM },
                {
                    role: "user",
                    content: (0, cover_letter_generator_js_1.buildCoverLetterPrompt)(candidateProfile, jobDetails, selectedProjects, matchedExperience),
                },
            ],
            temperature: 0.5,
            maxTokens: 4096,
        });
        tokensUsed = result.tokensUsed;
        return result.content;
    }
    catch (err) {
        outputStatus = "error";
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        const durationMs = Date.now() - startTime;
        prisma_js_1.default.aIExecution
            .create({
            data: {
                jobId,
                operationType: client_1.AIOperationType.COVER_LETTER_GENERATE,
                model: provider_js_1.primaryProvider.model,
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
async function generateRecruiterMessage(candidateProfile, jobDetails, platform, selectedProjects, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: recruiter_message_js_1.RECRUITER_MESSAGE_SYSTEM },
                {
                    role: "user",
                    content: (0, recruiter_message_js_1.buildRecruiterMessagePrompt)(candidateProfile, jobDetails, platform, selectedProjects),
                },
            ],
            temperature: 0.5,
            maxTokens: 1024,
        });
        tokensUsed = result.tokensUsed;
        return result.content;
    }
    catch (err) {
        outputStatus = "error";
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        const durationMs = Date.now() - startTime;
        prisma_js_1.default.aIExecution
            .create({
            data: {
                jobId,
                operationType: client_1.AIOperationType.RECRUITER_MESSAGE_GENERATE,
                model: provider_js_1.primaryProvider.model,
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
async function generateApplicationAnswer(candidateProfile, jobDetails, question, jobId, instructions) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: application_answer_js_1.APPLICATION_ANSWER_SYSTEM },
                {
                    role: "user",
                    content: (0, application_answer_js_1.buildApplicationAnswerPrompt)(candidateProfile, jobDetails, question, instructions),
                },
            ],
            temperature: 0.4,
            maxTokens: 2048,
        });
        tokensUsed = result.tokensUsed;
        return result.content;
    }
    catch (err) {
        outputStatus = "error";
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        if (jobId) {
            const durationMs = Date.now() - startTime;
            prisma_js_1.default.aIExecution
                .create({
                data: {
                    jobId,
                    operationType: client_1.AIOperationType.APPLICATION_ANSWER_GENERATE,
                    model: provider_js_1.primaryProvider.model,
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
async function chatWithApplicationCopilot(candidateProfile, jobDetails, history, message, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const { messages } = (0, application_answer_js_1.buildChatCopilotPrompt)(candidateProfile, jobDetails, history, message);
        const result = await provider_js_1.primaryProvider.complete({
            messages,
            temperature: 0.5,
            maxTokens: 2048,
        });
        tokensUsed = result.tokensUsed;
        return result.content;
    }
    catch (err) {
        outputStatus = "error";
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        const durationMs = Date.now() - startTime;
        prisma_js_1.default.aIExecution
            .create({
            data: {
                jobId,
                operationType: client_1.AIOperationType.APPLICATION_ANSWER_GENERATE,
                model: provider_js_1.primaryProvider.model,
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
async function generateTailoredResume(candidateProfile, jobDetails, selectedProjects, matchedExperience, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: resume_generator_js_1.RESUME_GENERATOR_SYSTEM },
                {
                    role: "user",
                    content: (0, resume_generator_js_1.buildResumeGeneratorPrompt)(candidateProfile, jobDetails, selectedProjects, matchedExperience),
                },
            ],
            temperature: 0.3,
            maxTokens: 8192,
            responseFormat: "json",
        });
        tokensUsed = result.tokensUsed;
        let parsed;
        try {
            parsed = (0, utils_js_1.parseAIJson)(result.content);
        }
        catch {
            outputStatus = "validation_failed";
            throw new Error("AI returned invalid JSON for resume generation");
        }
        const validated = index_js_1.ResumeGeneratorResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Resume generation validation failed: ${validated.error.message}`);
        }
        return validated.data;
    }
    catch (err) {
        outputStatus = outputStatus === "success" ? "error" : outputStatus;
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        const durationMs = Date.now() - startTime;
        prisma_js_1.default.aIExecution
            .create({
            data: {
                jobId,
                operationType: client_1.AIOperationType.RESUME_GENERATE,
                model: provider_js_1.primaryProvider.model,
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
//# sourceMappingURL=generator.js.map
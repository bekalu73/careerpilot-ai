"use strict";
// Candidate Matcher Service
// Scores candidate against job requirements and selects relevant projects
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchCandidateToJob = matchCandidateToJob;
exports.selectRelevantProjects = selectRelevantProjects;
const provider_js_1 = require("../provider.js");
const candidate_matcher_js_1 = require("../prompts/candidate-matcher.js");
const project_selector_js_1 = require("../prompts/project-selector.js");
const index_js_1 = require("../schemas/index.js");
const utils_js_1 = require("../utils.js");
const prisma_js_1 = __importDefault(require("../../lib/prisma.js"));
const client_1 = require("@prisma/client");
/**
 * Scores a candidate against a job, returning match breakdown + explainability.
 */
async function matchCandidateToJob(candidateProfileJson, jobRequirementsJson, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.reasoningProvider.complete({
            messages: [
                { role: "system", content: candidate_matcher_js_1.CANDIDATE_MATCHER_SYSTEM },
                {
                    role: "user",
                    content: (0, candidate_matcher_js_1.buildCandidateMatcherPrompt)(candidateProfileJson, jobRequirementsJson),
                },
            ],
            temperature: 0.2,
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
            throw new Error("AI returned invalid JSON for candidate matching");
        }
        const validated = index_js_1.CandidateMatcherResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Match validation failed: ${validated.error.message}`);
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
                operationType: client_1.AIOperationType.CANDIDATE_MATCH,
                model: provider_js_1.reasoningProvider.model,
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
async function selectRelevantProjects(projectsJson, jobRequirementsJson, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.reasoningProvider.complete({
            messages: [
                { role: "system", content: project_selector_js_1.PROJECT_SELECTOR_SYSTEM },
                {
                    role: "user",
                    content: (0, project_selector_js_1.buildProjectSelectorPrompt)(projectsJson, jobRequirementsJson),
                },
            ],
            temperature: 0.2,
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
            throw new Error("AI returned invalid JSON for project selection");
        }
        const validated = index_js_1.ProjectSelectorResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Project selection validation failed: ${validated.error.message}`);
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
                operationType: client_1.AIOperationType.PROJECT_SELECT,
                model: provider_js_1.reasoningProvider.model,
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
//# sourceMappingURL=matcher.js.map
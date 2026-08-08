"use strict";
// Job Analyzer Service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeJobDescription = analyzeJobDescription;
const provider_js_1 = require("../provider.js");
const job_analyzer_js_1 = require("../prompts/job-analyzer.js");
const index_js_1 = require("../schemas/index.js");
const utils_js_1 = require("../utils.js");
const prisma_js_1 = __importDefault(require("../../lib/prisma.js"));
const client_1 = require("@prisma/client");
async function analyzeJobDescription(description, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: job_analyzer_js_1.JOB_ANALYZER_SYSTEM },
                { role: "user", content: (0, job_analyzer_js_1.buildJobAnalyzerPrompt)(description) },
            ],
            temperature: 0.2,
            maxTokens: 4096,
            responseFormat: "json",
        });
        tokensUsed = result.tokensUsed;
        let parsed;
        try {
            parsed = (0, utils_js_1.parseAIJson)(result.content);
        }
        catch {
            outputStatus = "validation_failed";
            throw new Error("AI returned invalid JSON for job analysis");
        }
        const validated = index_js_1.JobAnalyzerResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Job analysis validation failed: ${validated.error.message}`);
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
                jobId: jobId ?? null,
                operationType: client_1.AIOperationType.JOB_ANALYZE,
                model: provider_js_1.primaryProvider.model,
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
//# sourceMappingURL=job-analyzer.js.map
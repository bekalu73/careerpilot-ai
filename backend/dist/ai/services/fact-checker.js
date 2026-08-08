"use strict";
// Fact Checker Service
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.factCheckDocument = factCheckDocument;
const provider_js_1 = require("../provider.js");
const fact_checker_js_1 = require("../prompts/fact-checker.js");
const index_js_1 = require("../schemas/index.js");
const utils_js_1 = require("../utils.js");
const prisma_js_1 = __importDefault(require("../../lib/prisma.js"));
const client_1 = require("@prisma/client");
async function factCheckDocument(generatedContent, careerProfileJson, jobId) {
    const startTime = Date.now();
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.reasoningProvider.complete({
            messages: [
                { role: "system", content: fact_checker_js_1.FACT_CHECKER_SYSTEM },
                {
                    role: "user",
                    content: (0, fact_checker_js_1.buildFactCheckerPrompt)(generatedContent, careerProfileJson),
                },
            ],
            temperature: 0.1,
            maxTokens: 8192,
            responseFormat: "json",
        });
        tokensUsed = result.tokensUsed;
        let parsed;
        try {
            parsed = (0, utils_js_1.parseAIJson)(result.content);
        }
        catch (parseErr) {
            outputStatus = "validation_failed";
            console.error("[factCheckDocument] Raw content:", result.content);
            throw new Error(`AI returned invalid JSON for fact checking: ${parseErr.message}`);
        }
        const validated = index_js_1.FactCheckerResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Fact check validation failed: ${validated.error.message}`);
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
                operationType: client_1.AIOperationType.FACT_CHECK,
                model: provider_js_1.reasoningProvider.model,
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
//# sourceMappingURL=fact-checker.js.map
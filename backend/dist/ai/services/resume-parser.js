"use strict";
// Resume Parser Service
// Orchestrates: HTML extraction → Gemini → Zod validation → structured result
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromHtml = extractTextFromHtml;
exports.parseResumeHtml = parseResumeHtml;
const cheerio = __importStar(require("cheerio"));
const provider_js_1 = require("../provider.js");
const resume_parser_js_1 = require("../prompts/resume-parser.js");
const index_js_1 = require("../schemas/index.js");
const utils_js_1 = require("../utils.js");
const prisma_js_1 = __importDefault(require("../../lib/prisma.js"));
const client_1 = require("@prisma/client");
/**
 * Extracts clean text from resume HTML using cheerio.
 * We don't send the full HTML to Gemini — we send clean text.
 */
function extractTextFromHtml(html) {
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
async function parseResumeHtml(html, jobId) {
    const startTime = Date.now();
    // Extract clean text from HTML (don't send raw HTML to AI)
    const resumeText = extractTextFromHtml(html);
    let outputStatus = "success";
    let tokensUsed;
    let errorMessage;
    try {
        const result = await provider_js_1.primaryProvider.complete({
            messages: [
                { role: "system", content: resume_parser_js_1.RESUME_PARSER_SYSTEM },
                {
                    role: "user",
                    content: (0, resume_parser_js_1.buildResumeParserUserPrompt)(resumeText),
                },
            ],
            temperature: 0.1, // Low temperature for factual extraction
            maxTokens: 8192,
            responseFormat: "json",
        });
        tokensUsed = result.tokensUsed;
        // Parse and validate with Zod
        let parsed;
        try {
            parsed = (0, utils_js_1.parseAIJson)(result.content);
        }
        catch {
            outputStatus = "validation_failed";
            throw new Error("AI returned invalid JSON for resume parsing");
        }
        const validated = index_js_1.ResumeParserResultSchema.safeParse(parsed);
        if (!validated.success) {
            outputStatus = "validation_failed";
            throw new Error(`Resume parse validation failed: ${validated.error.message}`);
        }
        return validated.data;
    }
    catch (err) {
        outputStatus = outputStatus === "success" ? "error" : outputStatus;
        errorMessage = err instanceof Error ? err.message : "Unknown error";
        throw err;
    }
    finally {
        // Log the AI execution (non-blocking)
        const durationMs = Date.now() - startTime;
        prisma_js_1.default.aIExecution
            .create({
            data: {
                jobId: jobId ?? null,
                operationType: client_1.AIOperationType.RESUME_PARSE,
                model: provider_js_1.primaryProvider.model,
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
//# sourceMappingURL=resume-parser.js.map
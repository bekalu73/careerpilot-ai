"use strict";
// AI Client — OpenAI-compatible client pointing at Gemini
// Uses Gemini's OpenAI-compatible endpoint for broad compatibility
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiClient = void 0;
const openai_1 = __importDefault(require("openai"));
if (!process.env["GEMINI_API_KEY"]) {
    throw new Error("GEMINI_API_KEY environment variable is required. Add it to your .env file.");
}
/**
 * OpenAI-compatible client configured to use Gemini's API.
 * This keeps the application decoupled from any specific AI provider.
 * To switch providers, only this file needs to change.
 */
exports.aiClient = new openai_1.default({
    apiKey: process.env["GEMINI_API_KEY"],
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});
exports.default = exports.aiClient;
//# sourceMappingURL=client.js.map
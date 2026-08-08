// AI Client — OpenAI-compatible client pointing at Gemini
// Uses Gemini's OpenAI-compatible endpoint for broad compatibility

import OpenAI from "openai";

if (!process.env["GEMINI_API_KEY"]) {
  throw new Error(
    "GEMINI_API_KEY environment variable is required. Add it to your .env file."
  );
}

/**
 * OpenAI-compatible client configured to use Gemini's API.
 * This keeps the application decoupled from any specific AI provider.
 * To switch providers, only this file needs to change.
 */
export const aiClient = new OpenAI({
  apiKey: process.env["GEMINI_API_KEY"],
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export default aiClient;

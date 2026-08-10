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

/**
 * Fallback OpenRouter client to use when Gemini is rate limited.
 */
export const fallbackClient = process.env["OPEN_ROUTER_API_KEY"] 
  ? new OpenAI({ 
      apiKey: process.env["OPEN_ROUTER_API_KEY"],
      baseURL: "https://openrouter.ai/api/v1",
    })
  : null;

/**
 * Second fallback Groq client to use.
 */
export const groqClient = process.env["GROQ_API_KEY"]
  ? new OpenAI({
      apiKey: process.env["GROQ_API_KEY"],
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

export default aiClient;

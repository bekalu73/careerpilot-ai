// AI Provider — abstraction layer over the OpenAI-compatible client

import type {
  AICompletionOptions,
  AICompletionResult,
  AIProvider,
} from "./types.js";
import { aiClient } from "./client.js";

// Primary and reasoning models backed by active Gemini 3 and flash preview models
const PRIMARY_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash",
];

const REASONING_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Creates an AI provider instance backed by the configured model.
 * Wraps the OpenAI-compatible client with retry logic, exponential backoff, and model fallbacks.
 */
function createProvider(preferredModel: string, fallbackModels: string[] = []): AIProvider {
  const models = [preferredModel, ...fallbackModels.filter((m) => m !== preferredModel)];

  return {
    model: preferredModel,
    async complete(options: AICompletionOptions): Promise<AICompletionResult> {
      let lastError: unknown;

      for (const modelToTry of models) {
        for (let attempt = 0; attempt < 3; attempt++) {
          const startTime = Date.now();
          try {
            const response = await aiClient.chat.completions.create({
              model: modelToTry,
              messages: options.messages,
              temperature: options.temperature ?? 0.3,
              max_tokens: options.maxTokens ?? 4096,
              ...(options.responseFormat === "json"
                ? { response_format: { type: "json_object" } }
                : {}),
            });

            const durationMs = Date.now() - startTime;
            const content = response.choices[0]?.message?.content ?? "";
            const tokensUsed = response.usage?.total_tokens;

            return {
              content,
              tokensUsed,
              model: modelToTry,
              durationMs,
            };
          } catch (err: any) {
            lastError = err;
            const isRateLimit = err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED");
            if (isRateLimit && attempt < 2) {
              const waitTime = (attempt + 1) * 2000 + Math.random() * 1000;
              console.warn(`[AIProvider] Rate limited on ${modelToTry}, retrying in ${Math.round(waitTime)}ms (attempt ${attempt + 1}/3)...`);
              await sleep(waitTime);
              continue;
            }
            // If other error or exhausted retries on this model, break to next model
            break;
          }
        }
      }

      throw lastError;
    },
  };
}

export const primaryProvider = createProvider(PRIMARY_MODELS[0]!, PRIMARY_MODELS.slice(1));
export const reasoningProvider = createProvider(REASONING_MODELS[0]!, REASONING_MODELS.slice(1));

// Default export for convenience
export const provider = primaryProvider;

// AI Types — shared across all AI modules

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "json" | "text";
}

export interface AICompletionResult {
  content: string;
  tokensUsed?: number;
  model: string;
  durationMs: number;
}

export interface AIProvider {
  complete(options: AICompletionOptions): Promise<AICompletionResult>;
  model: string;
}

export type AIOperationStatus = "success" | "error" | "validation_failed";

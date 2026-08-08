/**
 * Robust JSON parser for AI-generated responses.
 * Handles markdown code fences (```json ... ```), raw strings, and trailing text.
 */
export function parseAIJson<T = any>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new Error("Empty or invalid AI output");
  }

  let cleaned = raw.trim();

  // 1. Check for markdown code blocks (```json ... ``` or ``` ...)
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    cleaned = codeBlockMatch[1].trim();
  }

  // 2. Direct parse attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // 3. Fallback: find the first { or [ and last } or ]
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");
    let startIndex = -1;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace > startIndex) {
        cleaned = cleaned.slice(startIndex, lastBrace + 1);
      }
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
      const lastBracket = cleaned.lastIndexOf("]");
      if (lastBracket > startIndex) {
        cleaned = cleaned.slice(startIndex, lastBracket + 1);
      }
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch {
      throw new Error(`Failed to parse AI JSON response: ${(initialErr as Error).message}\nRaw content:\n${raw.slice(0, 300)}`);
    }
  }
}

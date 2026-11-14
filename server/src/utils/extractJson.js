// Helper to extract JSON objects or arrays from markdown fences or raw text.

export function extractJson(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text is empty or not a string.');
  }

  const trimmed = text.trim();

  // 1. Check for markdown code fences
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    // 2. Fallback: extract outer curly braces or square brackets
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(candidate.slice(firstBrace, lastBrace + 1));
    }

    const firstBracket = candidate.indexOf('[');
    const lastBracket = candidate.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket > firstBracket) {
      return JSON.parse(candidate.slice(firstBracket, lastBracket + 1));
    }

    throw new Error('Could not parse valid JSON from content.');
  }
}

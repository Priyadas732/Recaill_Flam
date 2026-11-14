// Parser service: extracts, parses, validates JSON and handles single-retry recovery.
import { AppError } from '../utils/AppError.js';
import { generateJson } from './ai.service.js';

const STRICT_REMINDER = `STRICT FORMATTING REMINDER:
Your previous output failed JSON parsing or schema validation.
You MUST output ONLY a valid, single, unescaped JSON object matching the exact schema.
Do NOT use markdown code fences, commentary, notes, or extra characters before or after the JSON.`;

/**
 * Extracts the first outer { ... } block from a string.
 * @param {string} text
 * @returns {string}
 */
function extractFirstBlock(text) {
  // 1. Strip markdown code fences if present
  let clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  // 2. Locate first '{' and corresponding or last '}'
  const start = clean.indexOf('{');
  if (start === -1) {
    throw new AppError('BAD_JSON', 'No JSON object found in AI response.', 502);
  }

  // Find matching closing brace using nesting depth
  let depth = 0;
  let inString = false;
  let escape = false;
  let end = -1;

  for (let i = start; i < clean.length; i++) {
    const char = clean[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
  }

  // Fallback to lastIndex if matching stopped early
  if (end === -1) {
    end = clean.lastIndexOf('}');
  }

  if (end === -1 || end <= start) {
    throw new AppError('BAD_JSON', 'Malformed JSON bracket boundaries in response.', 502);
  }

  return clean.slice(start, end + 1);
}

/**
 * Strips code fences, extracts the first { ... } block, parses JSON, and runs validator.
 * Maps JSON errors to BAD_JSON and contract failures to BAD_SHAPE.
 * 
 * @template T
 * @param {string} rawText
 * @param {(data: any) => T | import('zod').ZodType<T>} [validatorFn]
 * @returns {T}
 */
export function parseAndValidate(rawText, validatorFn) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new AppError('EMPTY', 'Received empty response text for parsing.', 502);
  }

  // Steps 1 & 2: Strip code fences and extract the first { ... } block
  const jsonBlock = extractFirstBlock(rawText);

  // Step 3: JSON.parse
  let parsed;
  try {
    parsed = JSON.parse(jsonBlock);
  } catch (err) {
    throw new AppError('BAD_JSON', `Failed to parse AI output as valid JSON: ${err.message}`, 502);
  }

  // Step 4: Run validator
  if (!validatorFn) return parsed;

  try {
    if (typeof validatorFn.safeParse === 'function') {
      const result = validatorFn.safeParse(parsed);
      if (!result.success) {
        throw new AppError('BAD_SHAPE', `Contract validation failed: ${result.error.message}`, 502);
      }
      return result.data;
    }

    if (typeof validatorFn.parse === 'function') {
      return validatorFn.parse(parsed);
    }

    if (typeof validatorFn === 'function') {
      return validatorFn(parsed);
    }

    return parsed;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('BAD_SHAPE', err.message || 'Output failed schema contract validation.', 502);
  }
}

/**
 * Retries an AI operation ONCE on BAD_JSON or BAD_SHAPE with a stricter reminder.
 * Never retries on TIMEOUT or upstream errors.
 * 
 * Supports both function execution: `callWithRetry(async (reminder) => ...)`
 * and config execution: `callWithRetry({ systemPrompt, userPrompt, validatorFn, signal })`.
 * 
 * @param {Function | object} operationOrConfig
 * @returns {Promise<any>}
 */
export async function callWithRetry(operationOrConfig) {
  // Style A: Higher-order function call
  if (typeof operationOrConfig === 'function') {
    try {
      return await operationOrConfig('');
    } catch (err) {
      if (err?.code === 'BAD_JSON' || err?.code === 'BAD_SHAPE') {
        return await operationOrConfig(`\n\n${STRICT_REMINDER}`);
      }
      throw err; // Never retry on TIMEOUT or other errors
    }
  }

  // Style B: Direct config object { systemPrompt, userPrompt, validatorFn, signal }
  const { systemPrompt, userPrompt, validatorFn, signal } = operationOrConfig;

  try {
    const rawOutput = await generateJson({ systemPrompt, userPrompt, signal });
    return parseAndValidate(rawOutput, validatorFn);
  } catch (err) {
    if (err?.code === 'BAD_JSON' || err?.code === 'BAD_SHAPE') {
      const retryUserPrompt = `${userPrompt}\n\n${STRICT_REMINDER}`;
      const retryRawOutput = await generateJson({ systemPrompt, userPrompt: retryUserPrompt, signal });
      return parseAndValidate(retryRawOutput, validatorFn);
    }
    throw err; // Never retry on TIMEOUT or other errors
  }
}

// The ONLY file in the backend that communicates with Google GenAI (@google/genai).
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let clientInstance = null;
let mockGenerator = null;

/**
 * Test hook: overrides generateJson implementation for testing failure cases without live API calls.
 * @param {((params: { systemPrompt: string, userPrompt: string, signal?: any }) => Promise<string>) | null} fn
 */
export function __setMockGenerator(fn) {
  mockGenerator = fn;
}

/**
 * Returns a cached GoogleGenAI instance initialized with the validated API key.
 * @returns {GoogleGenAI}
 */
function getClient() {
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }
  return clientInstance;
}

/**
 * Executes a structured JSON request against Gemini with abort/timeout guards.
 * Uses JSON output mode, temperature ~0.4, and aborts if the client disconnects or times out.
 * Implements automated failover across active verified models for transient 503/429 spikes.
 * 
 * @param {object} params
 * @param {string} params.systemPrompt
 * @param {string} params.userPrompt
 * @param {AbortSignal | import('http').IncomingMessage} [params.signal]
 * @returns {Promise<string>} Raw JSON response string
 */
export async function generateJson({ systemPrompt, userPrompt, signal }) {
  if (mockGenerator) {
    return await mockGenerator({ systemPrompt, userPrompt, signal });
  }

  const ai = getClient();
  const timeoutMs = env.aiTimeoutMs || 30000;
  const localController = new AbortController();

  let isTimedOut = false;
  const timeoutTimer = setTimeout(() => {
    isTimedOut = true;
    localController.abort(new Error('TIMEOUT'));
  }, timeoutMs);

  // Link external abort signal or Express req 'close' event
  const cleanupListeners = [];
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutTimer);
      throw new AppError('TIMEOUT', 'Request was aborted before execution.', 504);
    }

    if (typeof signal.addEventListener === 'function') {
      const onAbort = () => localController.abort(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
      cleanupListeners.push(() => signal.removeEventListener('abort', onAbort));
    }

    // Express request 'close' event fires when the client disconnects prematurely
    if (typeof signal.on === 'function') {
      const onClose = () => localController.abort(new Error('CLIENT_CLOSED'));
      signal.on('close', onClose);
      cleanupListeners.push(() => {
        if (typeof signal.off === 'function') signal.off('close', onClose);
        else if (typeof signal.removeListener === 'function') signal.removeListener('close', onClose);
      });
    }
  }

  // Active verified model cascade for this API tier
  const candidateModels = [
    env.geminiModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError = null;

  try {
    for (let i = 0; i < candidateModels.length; i++) {
      const modelName = candidateModels[i];
      if (localController.signal.aborted) break;

      try {
        const apiPromise = ai.models.generateContent({
          model: modelName,
          contents: userPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.4,
            httpOptions: {
              timeout: timeoutMs,
            },
          },
        });

        const abortPromise = new Promise((_, reject) => {
          if (localController.signal.aborted) {
            return reject(localController.signal.reason);
          }
          localController.signal.addEventListener(
            'abort',
            () => reject(localController.signal.reason),
            { once: true }
          );
        });

        const response = await Promise.race([apiPromise, abortPromise]);

        const text = typeof response?.text === 'function' ? response.text() : response?.text;
        if (!text || !text.trim()) {
          throw new AppError('EMPTY', 'Gemini returned an empty response.', 502);
        }

        return text.trim();
      } catch (err) {
        lastError = err;

        if (isTimedOut || localController.signal.aborted || err instanceof AppError) {
          throw err;
        }

        const errMsg = err?.message || '';
        const isTransientOverload =
          errMsg.includes('503') ||
          errMsg.includes('404') ||
          errMsg.includes('429') ||
          errMsg.includes('high demand') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('NOT_FOUND');

        // If transient high-demand or model unavailable, fail over to next verified model
        if (isTransientOverload && i < candidateModels.length - 1) {
          console.warn(`[AI Service] Model ${modelName} returned overload (${errMsg.slice(0, 80)}...). Retrying with ${candidateModels[i + 1]}...`);
          await new Promise((resolve) => setTimeout(resolve, 600));
          continue;
        }

        throw err;
      }
    }

    throw lastError || new Error('All model candidates failed.');
  } catch (err) {
    if (isTimedOut || err?.message === 'TIMEOUT' || err?.name === 'TimeoutError') {
      throw new AppError('TIMEOUT', `AI generation timed out after ${timeoutMs}ms.`, 504);
    }

    if (localController.signal.aborted) {
      throw new AppError('TIMEOUT', 'Request was cancelled by client disconnect.', 504);
    }

    if (err instanceof AppError) {
      throw err;
    }

    // Map all API upstream errors, quota issues, or 429 rate limits to UPSTREAM
    const safeMessage = err?.message || 'Upstream AI model request failed.';
    throw new AppError('UPSTREAM', safeMessage, 502);
  } finally {
    clearTimeout(timeoutTimer);
    for (const cleanup of cleanupListeners) cleanup();
  }
}

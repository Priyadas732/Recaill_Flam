/**
 * API client service for Recall backend.
 */

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch (networkErr) {
    // AbortError means the request was cancelled — let it propagate as-is
    // so useAiRequest can silently ignore it.
    if (networkErr.name === 'AbortError') throw networkErr;

    // All other network failures (server down, DNS, offline) get a
    // user-friendly message instead of the raw "Failed to fetch".
    const friendly = new Error(
      'Could not reach the server. Please check your connection and try again.'
    );
    friendly.code = 'NETWORK_ERROR';
    friendly.status = 0;
    throw friendly;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || (json && (json.ok === false || json.success === false))) {
    const error = new Error(json?.error?.message || `Request failed with status ${response.status}`);
    error.code = json?.error?.code || 'UNKNOWN_ERROR';
    error.details = json?.error?.details;
    error.status = response.status;
    throw error;
  }

  return json.data;
}

export const api = {
  fetchLesson: (topic, level, signal) =>
    request('/api/lesson', {
      method: 'POST',
      body: JSON.stringify({ topic, level }),
      signal,
    }),

  fetchQuiz: (lesson, countOrSignal = 10, maybeSignal) => {
    const isSignal = countOrSignal && (typeof countOrSignal.addEventListener === 'function' || countOrSignal.aborted !== undefined);
    const count = isSignal ? 10 : (typeof countOrSignal === 'number' && countOrSignal >= 1 ? countOrSignal : 10);
    const signal = isSignal ? countOrSignal : maybeSignal;
    return request('/api/quiz', {
      method: 'POST',
      body: JSON.stringify({ lesson, count }),
      signal,
    });
  },

  fetchRemediation: (payload, signal) =>
    request('/api/remediation', {
      method: 'POST',
      body: JSON.stringify(payload),
      signal,
    }),
};

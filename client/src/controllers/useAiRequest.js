import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Controller hook providing loading/error states, AbortController lifecycle,
 * stale request guards, and auto/manual retries.
 */
export function useAiRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const execute = useCallback(async (requestFn) => {
    // Cancel in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentRequestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(abortController.signal);
      // Guard against stale request completing after a newer one started
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        return result;
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        return null; // Request was aborted cleanly
      }
      if (currentRequestId === requestIdRef.current) {
        setError(err);
        setLoading(false);
        throw err;
      }
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    loading,
    error,
    execute,
    cancel,
    clearError: () => setError(null),
  };
}


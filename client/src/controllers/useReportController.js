import { useCallback } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { api } from '../services/api.js';
import { useAiRequest } from './useAiRequest.js';
import { RemediationSchema } from '../models/remediation.schema.js';

export function useReportController() {
  const { state, dispatch } = useSession();
  const { loading, error, execute, clearError } = useAiRequest();

  const triggerRemediation = useCallback(async () => {
    if (!state.report || !state.lesson) return;

    try {
      const weakSectionIds = (state.report.weakSections || []).map((s) => s.sectionId || s.id);
      const wrongQuestions = (state.quiz?.questions || []).filter(
        (q) => state.answers[q.id] !== (q.answerIndex ?? q.correctIndex)
      );

      // Schema parse is INSIDE execute() so that if the server returns
      // valid JSON but a wrong shape, the error surfaces in the UI
      // rather than being silently swallowed.
      const validated = await execute(async (signal) => {
        const rawData = await api.fetchRemediation(
          {
            lesson: state.lesson,
            weakSectionIds,
            wrongQuestions,
          },
          signal
        );
        return RemediationSchema.parse(rawData);
      });
      if (!validated) return;

      dispatch({ type: 'SET_REMEDIATION', payload: validated });
    } catch (err) {
      // Error is already captured in useAiRequest's error state
      // and will be shown via the ErrorBanner component.
      console.error('Failed to generate remediation:', err);
    }
  }, [state.report, state.lesson, state.quiz, state.answers, execute, dispatch]);

  return {
    report: state.report,
    loading,
    error,
    clearError,
    triggerRemediation,
  };
}

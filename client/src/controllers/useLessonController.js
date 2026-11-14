import { useCallback } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { api } from '../services/api.js';
import { useAiRequest } from './useAiRequest.js';
import { LessonSchema } from '../models/lesson.schema.js';

export function useLessonController() {
  const { state, dispatch } = useSession();
  const { loading, error, execute, clearError } = useAiRequest();

  const generateLesson = useCallback(async (topic, level) => {
    try {
      dispatch({ type: 'SET_TOPIC_AND_LEVEL', payload: { topic, level } });

      // Schema parse is INSIDE execute() so that if the server returns
      // valid JSON but a wrong shape, the error surfaces in the UI
      // rather than being silently swallowed.
      const validated = await execute(async (signal) => {
        const rawData = await api.fetchLesson(topic, level, signal);
        return LessonSchema.parse(rawData);
      });
      if (!validated) return;

      dispatch({ type: 'SET_LESSON', payload: validated });
    } catch (err) {
      // Error is already captured in useAiRequest's error state
      // and will be shown via the ErrorBanner component.
      console.error('Failed to generate lesson:', err);
    }
  }, [dispatch, execute]);

  const startQuiz = useCallback(async () => {
    if (!state.lesson) return;
    try {
      const targetCount = Math.max(10, (state.lesson.sections?.length || 3) * 2);
      const rawData = await execute((signal) => api.fetchQuiz(state.lesson, targetCount, signal));
      if (!rawData) return;
      dispatch({ type: 'SET_QUIZ', payload: rawData });
    } catch (err) {
      console.error('Failed to start quiz:', err);
    }
  }, [dispatch, execute, state.lesson]);

  return {
    lesson: state.lesson,
    loading,
    error,
    clearError,
    generateLesson,
    startQuiz,
  };
}

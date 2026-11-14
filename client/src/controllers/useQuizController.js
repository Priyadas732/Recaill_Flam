import { useCallback } from 'react';
import { useSession } from '../context/SessionContext.jsx';
import { calculateScores } from '../models/scoring.js';

export function useQuizController() {
  const { state, dispatch } = useSession();
  const { quiz, answers, currentQuestionIndex, lesson } = state;

  const currentQuestion = quiz?.questions?.[currentQuestionIndex] || null;
  const totalQuestions = quiz?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const hasAnsweredCurrent = currentAnswer !== undefined;

  const answer = useCallback((optionIndex) => {
    if (!currentQuestion) return;
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: { questionId: currentQuestion.id, optionIndex },
    });
  }, [currentQuestion, dispatch]);

  const next = useCallback(() => {
    if (isLastQuestion) {
      // Complete quiz and compute report
      const report = calculateScores(quiz.questions, answers, lesson.sections);
      dispatch({ type: 'SET_REPORT', payload: report });
    } else {
      dispatch({ type: 'NEXT_QUESTION' });
    }
  }, [isLastQuestion, quiz, answers, lesson, dispatch]);

  const prev = useCallback(() => {
    dispatch({ type: 'PREV_QUESTION' });
  }, [dispatch]);

  const retryMissed = useCallback(() => {
    if (!quiz) return;
    const missedQuestions = quiz.questions.filter(
      (q) => answers[q.id] !== (q.answerIndex ?? q.correctIndex)
    );
    if (missedQuestions.length > 0) {
      dispatch({
        type: 'SET_QUIZ',
        payload: {
          ...quiz,
          questions: missedQuestions,
        },
      });
    }
  }, [quiz, answers, dispatch]);

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    hasAnsweredCurrent,
    isLastQuestion,
    answer,
    next,
    prev,
    retryMissed,
  };
}


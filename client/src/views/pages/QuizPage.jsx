import React, { useEffect } from 'react';
import { useQuizController } from '../../controllers/useQuizController.js';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { STAGES } from '../../models/constants.js';

export function QuizPage() {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    currentAnswer,
    hasAnsweredCurrent,
    isLastQuestion,
    answer,
    next,
    prev,
  } = useQuizController();
  const { dispatch, state } = useSession();

  const progressPct = totalQuestions > 0 ? Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100) : 0;
  const isSubmitted = hasAnsweredCurrent;
  const optionLetters = ['A', 'B', 'C', 'D'];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (hasAnsweredCurrent) {
          next();
        }
      } else if (e.key === '1' || e.key === 'a' || e.key === 'A') {
        if (!hasAnsweredCurrent) answer(0);
      } else if (e.key === '2' || e.key === 'b' || e.key === 'B') {
        if (!hasAnsweredCurrent) answer(1);
      } else if (e.key === '3' || e.key === 'c' || e.key === 'C') {
        if (!hasAnsweredCurrent) answer(2);
      } else if (e.key === '4' || e.key === 'd' || e.key === 'D') {
        if (!hasAnsweredCurrent) answer(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasAnsweredCurrent, next, answer]);

  if (!currentQuestion) {
    return (
      <EmptyState
        title="No Quiz Available"
        description="There is no active quiz session."
        actionLabel="Go to Topic Input"
        onAction={() => dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT })}
      />
    );
  }

  return (
    <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-12 flex flex-col justify-center">
      {/* Stepper & Retention Progress */}
      <div className="w-full max-w-3xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#447F98]" />
            <span className="font-label-lg text-label-lg text-on-surface-variant dark:text-outline-variant font-medium">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>
          <span className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant font-medium">
            {progressPct}% Complete
          </span>
        </div>

        {/* Spaced Progress Bar */}
        <div className="w-full h-2 bg-[#B9DBE1]/40 dark:bg-white/10 rounded-full overflow-hidden p-0.5 border border-[#B9DBE1]/50 dark:border-white/10">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #629BB6 0%, #447F98 100%)',
            }}
          />
        </div>
      </div>

      {/* Main Quiz Card: Scholarly tactile index geometry */}
      <div className="w-full max-w-3xl mx-auto bg-surface-container-lowest dark:bg-[#14272F] rounded-2xl shadow-sm border border-outline-variant/40 dark:border-white/10 p-6 sm:p-8 md:p-10 transition-all">
        {/* Question Stem */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#447F98] dark:text-[#94CFEA] font-semibold px-2 py-0.5 rounded bg-[#B9DBE1]/30 dark:bg-[#23637B]/30 border border-[#B9DBE1]/40">
              Conceptual Synthesis
            </span>
            <button
              className="text-on-surface-variant/70 dark:text-outline-variant/70 hover:text-on-surface text-xs flex items-center gap-1 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-sm">bookmark_border</span>
              <span>Save for later</span>
            </button>
          </div>

          <h1 className="font-headline-md text-headline-md md:text-[1.625rem] text-[#182F3A] dark:text-[#E2EFF5] font-normal leading-relaxed text-balance">
            {currentQuestion.question}
          </h1>
        </div>

        {/* Four Answer Options */}
        <div className="space-y-3.5 mb-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = currentAnswer === idx;
            const isCorrectOption = idx === (currentQuestion.answerIndex ?? currentQuestion.correctIndex);

            let buttonClass = 'w-full text-left flex items-start gap-3.5 p-4 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none';
            let badgeClass = 'flex-shrink-0 w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center font-semibold transition-colors';
            let textClass = 'font-body-md text-body-md leading-relaxed';

            if (isSubmitted) {
              if (isCorrectOption) {
                buttonClass += ' border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-on-surface ring-1 ring-emerald-500/20';
                badgeClass += ' bg-emerald-600 text-white';
                textClass += ' font-medium text-emerald-950 dark:text-emerald-100';
              } else if (isSelected) {
                buttonClass += ' border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-on-surface opacity-90';
                badgeClass += ' bg-rose-500 text-white';
                textClass += ' text-rose-950 dark:text-rose-100';
              } else {
                buttonClass += ' border border-[#B9DBE1]/40 dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/50 text-on-surface opacity-60';
                badgeClass += ' border border-[#B9DBE1]/40 text-on-surface-variant';
                textClass += ' text-[#41484C] dark:text-[#A6B4BC]';
              }
            } else if (isSelected) {
              buttonClass += ' border-2 border-[#447F98] bg-[#D6EBF3]/50 dark:bg-[#447F98]/20 text-on-surface shadow-xs';
              badgeClass += ' bg-[#447F98] text-white shadow-xs';
              textClass += ' font-medium text-on-surface dark:text-[#E2EFF5]';
            } else {
              buttonClass += ' border border-[#B9DBE1] dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/60 text-on-surface hover:bg-surface-container-low dark:hover:bg-white/5 group';
              badgeClass += ' border border-[#B9DBE1] dark:border-white/20 bg-surface-container-low/60 dark:bg-white/5 text-on-surface-variant font-semibold group-hover:border-[#447F98]';
              textClass += ' text-on-surface dark:text-[#C5C6D0] group-hover:text-primary transition-colors';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => !isSubmitted && answer(idx)}
                className={buttonClass}
              >
                <span className={badgeClass}>{optionLetters[idx]}</span>
                <div className="flex-1 pt-1">
                  <p className={textClass}>{option}</p>
                </div>
                {isSubmitted && isCorrectOption && (
                  <span className="material-symbols-outlined text-emerald-600 text-2xl mt-1 fill-1">
                    check_circle
                  </span>
                )}
                {isSubmitted && isSelected && !isCorrectOption && (
                  <span className="material-symbols-outlined text-rose-500 text-2xl mt-1">
                    cancel
                  </span>
                )}
                {!isSubmitted && isSelected && (
                  <span className="material-symbols-outlined text-[#447F98] text-xl mt-1.5">
                    radio_button_checked
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Post-Answer Explanation Panel: Lucid Scholarly Insights */}
        {isSubmitted && (
          <section className="mt-6 p-5 rounded-xl border border-[#B9DBE1]/60 dark:border-[#23637B]/40 bg-[#D6EBF3]/40 dark:bg-[#14272F]/90 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#447F98]/15 text-[#447F98]">
                <span className="material-symbols-outlined text-sm font-semibold">lightbulb</span>
              </span>
              <h2 className="font-label-lg text-label-lg font-semibold text-[#182F3A] dark:text-[#E2EFF5] tracking-tight">
                {currentAnswer === (currentQuestion.answerIndex ?? currentQuestion.correctIndex) ? 'Why this is correct' : 'Explanation & Context'}
              </h2>
            </div>
            <p className="font-body-md text-body-md text-[#223B47] dark:text-[#95CEEB]/90 leading-relaxed pl-8">
              {currentQuestion.explanation}
            </p>
          </section>
        )}

        {/* Action Buttons & Sub-controls */}
        <div className="mt-8 pt-6 border-t border-outline-variant/30 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Secondary Tools */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={prev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-outline-variant/50 dark:border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-surface-container dark:hover:bg-white/5 transition-all text-sm font-label-md text-label-md disabled:opacity-40 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Previous</span>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_STAGE', payload: STAGES.LESSON })}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-secondary dark:text-[#95CEEB] hover:bg-secondary-container/30 transition-all text-sm font-label-md text-label-md cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">menu_book</span>
              <span>Reference lesson</span>
            </button>
          </div>

          {/* Right: Primary CTA with keyboard cue */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="hidden lg:inline text-xs text-on-surface-variant/70 dark:text-outline-variant font-mono tracking-tight">
              Press Enter ↵ to continue
            </span>
            <button
              onClick={next}
              disabled={!hasAnsweredCurrent}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-label-lg text-label-lg font-medium text-white shadow-sm hover:shadow active:scale-95 transition-all duration-150 disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#447F98' }}
              type="button"
            >
              <span>{isLastQuestion ? 'View Results' : 'Next question'}</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Spaced Repetition Meta Hint */}
      <div className="max-w-3xl mx-auto mt-4 text-center">
        <p className="text-xs text-on-surface-variant/70 dark:text-outline-variant font-body-sm">
          Active Diagnostic Evaluation · Based on Socratic recall retrieval latency
        </p>
      </div>
    </main>
  );
}

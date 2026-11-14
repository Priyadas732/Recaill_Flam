import React, { useState, useEffect } from 'react';
import { useLessonController } from '../../controllers/useLessonController.js';
import { LoadingState } from '../components/feedback/LoadingState.jsx';
import { ErrorBanner } from '../components/feedback/ErrorBanner.jsx';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { STAGES } from '../../models/constants.js';

export function LessonPage() {
  const { lesson, loading, error, clearError, startQuiz } = useLessonController();
  const { dispatch, state } = useSession();
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  const sections = lesson?.sections || [];
  const currentSection = sections[activeSectionIndex] || sections[0];
  const totalSections = sections.length;
  const isLastSection = activeSectionIndex === totalSections - 1;
  const completionPct = totalSections > 0 ? Math.round(((activeSectionIndex + 1) / totalSections) * 100) : 0;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === 'ArrowRight') {
        if (!isLastSection) {
          e.preventDefault();
          setActiveSectionIndex((prev) => Math.min(totalSections - 1, prev + 1));
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeSectionIndex > 0) {
          e.preventDefault();
          setActiveSectionIndex((prev) => Math.max(0, prev - 1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSectionIndex, isLastSection, totalSections]);

  if (loading) {
    return <LoadingState message="Generating diagnostic quiz..." subMessage="Synthesizing active recall questions with Gemini." />;
  }

  if (!lesson) {
    return (
      <EmptyState
        title="No lesson found"
        description="Please provide a topic to generate your structured lesson."
        actionLabel="Go to Topic Input"
        onAction={() => dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT })}
      />
    );
  }

  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto pt-20 pb-12 px-4 md:px-6">
      {/* Stepper Bar (Above Main Layout) */}
      <div className="mb-8 pt-2">
        <div className="flex items-center justify-between text-on-surface-variant mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary dark:text-[#95CEEB] text-[18px]">
              auto_stories
            </span>
            <span className="font-label-md text-label-md tracking-wider font-semibold text-secondary dark:text-[#95CEEB]">
              Section {activeSectionIndex + 1} of {totalSections}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline dark:text-outline-variant font-medium">
            {completionPct}% completed
          </span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-1.5 bg-[#B9DBE1]/40 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#447F98] dark:bg-[#629BB6] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <ErrorBanner message={error ? error.message : null} onDismiss={clearError} />

      {/* Centered Two-Column Academic Layout */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Slim Left Sidebar: Section Navigator (w-64) */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-5">
          <div className="bg-surface-container-lowest/80 dark:bg-[#14272F]/90 backdrop-blur-sm border border-outline-variant/30 dark:border-white/10 rounded-xl p-4 shadow-sm">
            <div className="font-label-sm text-label-sm uppercase tracking-wider text-outline dark:text-outline-variant mb-3 font-semibold px-2">
              Table of Contents
            </div>
            <nav className="space-y-1">
              {sections.map((sec, idx) => {
                const isCompleted = idx < activeSectionIndex;
                const isActive = idx === activeSectionIndex;

                return (
                  <button
                    key={sec.id || idx}
                    type="button"
                    onClick={() => setActiveSectionIndex(idx)}
                    className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-[#B9DBE1]/30 dark:bg-[#23637B]/40 border border-[#447F98]/40 text-on-surface dark:text-[#E2EFF5] font-semibold'
                        : isCompleted
                        ? 'text-on-surface-variant hover:bg-surface-container/60 dark:hover:bg-white/5'
                        : 'text-on-surface-variant hover:bg-surface-container/60 dark:hover:bg-white/5 opacity-70'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[18px] mt-0.5 ${
                        isCompleted
                          ? 'text-[#447F98] fill-1'
                          : isActive
                          ? 'text-[#447F98]'
                          : 'text-outline-variant'
                      }`}
                    >
                      {isCompleted
                        ? 'check_circle'
                        : isActive
                        ? 'radio_button_checked'
                        : 'radio_button_unchecked'}
                    </span>
                    <span
                      className={`font-body-sm text-body-sm leading-snug ${
                        isCompleted ? 'text-outline line-through' : ''
                      }`}
                    >
                      {sec.heading || sec.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Footnote in sidebar */}
          <div className="px-3 py-2 border-l-2 border-[#447F98] text-on-surface-variant">
            <p className="font-label-sm text-label-sm text-outline dark:text-outline-variant uppercase tracking-wider mb-0.5 font-semibold">
              Topic
            </p>
            <p className="font-body-sm text-body-sm text-secondary dark:text-[#95CEEB] font-medium leading-snug">
              {state.topic || lesson.title} ({state.level || 'beginner'})
            </p>
          </div>
        </aside>

        {/* Main Lesson Area */}
        <section className="flex-1 w-full">
          <article className="bg-surface-container-lowest/95 dark:bg-[#14272F] backdrop-blur-md rounded-xl border border-[#B9DBE1] dark:border-[#23637B]/40 shadow-[0_8px_30px_rgb(50,97,120,0.06)] p-6 sm:p-8 md:p-10 transition-all">
            {/* Small uppercase label with wide letter spacing */}
            <div className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#447F98] dark:text-[#94CFEA] font-semibold mb-3">
              SECTION {activeSectionIndex + 1} · {(currentSection.heading || currentSection.title || '').toUpperCase()}
            </div>

            {/* Large Scholarly Serif Heading */}
            <h1 className="font-headline-lg text-headline-lg text-[#12303D] dark:text-[#E2EFF5] tracking-tight mb-6 font-normal">
              {currentSection.heading || currentSection.title}
            </h1>

            {/* Plain-Language Explanation */}
            <p className="font-body-lg text-body-lg text-[#181C1F] dark:text-[#C5C6D0] leading-relaxed mb-8">
              {currentSection.explanation || currentSection.summary}
            </p>

            {/* Key Points Section */}
            {currentSection.keyPoints && currentSection.keyPoints.length > 0 && (
              <div className="mb-8">
                <h2 className="font-headline-sm text-headline-sm text-[#12303D] dark:text-[#E2EFF5] mb-4 font-normal">
                  Key points to remember
                </h2>
                <ul className="space-y-3.5">
                  {currentSection.keyPoints.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#447F98] dark:text-[#34d399] text-[20px] mt-0.5 shrink-0 fill-1">
                        check_circle
                      </span>
                      <span className="font-body-md text-body-md text-[#41484C] dark:text-[#A6B4BC]">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Example Callout Card */}
            {currentSection.example && (
              <div className="bg-[#B9DBE1]/20 dark:bg-[#23637B]/20 border border-[#B9DBE1]/60 dark:border-[#23637B]/40 rounded-xl p-5 my-8 flex items-start gap-3.5">
                <span className="material-symbols-outlined text-[#447F98] dark:text-[#94CFEA] text-[24px] shrink-0 mt-0.5">
                  lightbulb
                </span>
                <div>
                  <h3 className="font-label-lg text-label-lg font-semibold text-[#12303D] dark:text-[#E2EFF5] mb-1">
                    Everyday analogy / Concrete Example
                  </h3>
                  <p className="font-body-md text-body-md text-[#41484C] dark:text-[#A6B4BC] leading-relaxed">
                    {currentSection.example}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Navigation Bar & Actions */}
            <div className="pt-6 border-t border-[#B9DBE1]/30 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  if (activeSectionIndex > 0) {
                    setActiveSectionIndex((prev) => prev - 1);
                  } else {
                    dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT });
                  }
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#447F98] text-[#447F98] dark:text-[#95CEEB] font-label-lg text-label-lg hover:bg-[#B9DBE1]/20 dark:hover:bg-white/5 transition-colors active:scale-95 duration-150 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back
              </button>

              <div className="w-full sm:w-auto flex flex-col sm:items-end gap-1.5">
                {isLastSection ? (
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#447F98] hover:bg-[#35657a] text-white font-label-lg text-label-lg shadow-sm active:scale-95 transition-all duration-150 cursor-pointer font-semibold"
                  >
                    <span>Take Diagnostic Quiz</span>
                    <span className="material-symbols-outlined text-[18px]">quiz</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveSectionIndex((prev) => prev + 1)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#447F98] hover:bg-[#35657a] text-white font-label-lg text-label-lg shadow-sm active:scale-95 transition-all duration-150 cursor-pointer font-semibold"
                  >
                    <span>Got it, next</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
                <span className="font-label-sm text-label-sm text-outline dark:text-outline-variant text-center sm:text-right">
                  Press Space or → to advance
                </span>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

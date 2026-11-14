import React, { useState } from 'react';
import { useSession } from '../../context/SessionContext.jsx';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { STAGES } from '../../models/constants.js';

export function ReviewPage() {
  const { state, dispatch } = useSession();
  const { remediation, activeReviewTab = 'reexplained', lesson } = state;
  const [completedPlanSteps, setCompletedPlanSteps] = useState({});

  if (!remediation && !lesson) {
    return (
      <EmptyState
        title="No Remediation Available"
        description="Complete your diagnostic quiz to receive a tailored review plan."
        actionLabel="Go to Topics"
        onAction={() => dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT })}
      />
    );
  }

  const getSectionHeading = (sectionId) => {
    const match = lesson?.sections?.find((s) => s.id === sectionId);
    return match?.heading || match?.title || `Section: ${sectionId}`;
  };

  const reteachItems = remediation?.reteach || [];
  const mustRememberItems = remediation?.mustRemember || (lesson?.sections?.flatMap((s) => s.keyPoints || []) || []);
  const memoryTricks = remediation?.memoryTricks || [];

  const defaultRevisionPlan = [
    { when: 'Day 1 (Tomorrow)', action: `Quick 5-minute active recall retrieval on all sections of "${lesson?.title || 'the lesson'}".` },
    { when: 'Day 3', action: 'Self-explanation and flashcard rehearsal of key principles without looking at notes.' },
    { when: 'Day 7', action: 'Re-test via diagnostic quiz and review any remaining misconception areas.' },
    { when: 'Day 14', action: 'Interleaved practice: summarize core mechanisms and connect to adjacent concepts.' },
    { when: 'Day 30', action: 'Final long-term retention verification and permanent memory consolidation.' },
  ];

  const revisionPlan = remediation?.revisionPlan?.length ? remediation.revisionPlan : defaultRevisionPlan;

  const togglePlanStep = (idx) => {
    setCompletedPlanSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 md:px-6 pt-24 pb-16 flex flex-col gap-6">
      {/* Header */}
      <div className="text-center space-y-3 mb-4">
        <div className="inline-flex items-center justify-center">
          <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-label-caps tracking-[0.16em] uppercase text-[#12303D] dark:text-[#94CFEA] bg-[#B9DBE1]/35 dark:bg-[#23637B]/30 border border-[#B9DBE1] dark:border-[#23637B]/50 font-semibold">
            ADAPTIVE REMEDIATION
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-[#12303D] dark:text-[#E2EFF5] tracking-tight font-normal">
          Closing Your Knowledge Gaps
        </h1>
        <p className="font-body-md text-body-md text-[#4F6B78] dark:text-[#95CEEB]/80 max-w-2xl mx-auto leading-relaxed">
          Targeted conceptual re-explanations, active recall hooks, and a spaced repetition schedule to solidify permanent memory.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center border-b border-outline-variant/30 dark:border-white/10 gap-8 mb-4">
        {[
          { id: 'reexplained', label: '1. Re-explained' },
          { id: 'remember', label: '2. Remember (Checklist)' },
          { id: 'revise', label: '3. Revise (Schedule)' },
        ].map((tab) => {
          const isActive = activeReviewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_REVIEW_TAB', payload: tab.id })}
              className={`pb-3 font-label-md text-label-md tracking-wider uppercase transition-colors cursor-pointer ${
                isActive
                  ? 'border-b-2 border-[#447F98] text-[#447F98] dark:text-[#94CFEA] font-semibold'
                  : 'text-on-surface-variant dark:text-outline-variant hover:text-on-surface'
              }`}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="mb-8">
        {activeReviewTab === 'reexplained' && (
          <div className="space-y-6">
            {reteachItems.length === 0 ? (
              <div className="bg-surface-container-lowest dark:bg-[#14272F] rounded-xl border border-[#B9DBE1] dark:border-white/10 p-8 text-center space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#447F98] dark:text-[#94CFEA]">
                  verified
                </span>
                <h3 className="font-headline-md text-headline-md text-[#181C1F] dark:text-[#E2EFF5] font-normal">
                  {remediation ? 'No Weak Spots Detected!' : 'Take the Diagnostic Quiz'}
                </h3>
                <p className="font-body-md text-body-md text-[#41484C] dark:text-[#C5C6D0] max-w-md mx-auto">
                  {remediation
                    ? 'Congratulations! You answered every question correctly. Review your key takeaways in the Remember tab or check your Spaced Repetition Schedule in Revise.'
                    : 'Complete the quiz to unlock targeted conceptual re-explanations based on your specific answers.'}
                </p>
                {!remediation && (
                  <button
                    onClick={() => dispatch({ type: 'SET_STAGE', payload: state.quiz ? STAGES.QUIZ : STAGES.LESSON })}
                    className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#447F98] hover:bg-[#35657a] text-white font-label-md cursor-pointer transition-all"
                    type="button"
                  >
                    <span>{state.quiz ? 'Take Quiz' : 'Go to Lesson'}</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </button>
                )}
              </div>
            ) : (
              reteachItems.map((item, idx) => (
                <article
                  key={item.sectionId || idx}
                  className="bg-surface-container-lowest dark:bg-[#14272F] rounded-xl border border-[#B9DBE1] dark:border-white/10 p-6 md:p-8 shadow-sm transition-all"
                >
                  <div className="font-label-sm text-label-sm uppercase tracking-wider text-[#447F98] dark:text-[#94CFEA] font-semibold mb-2">
                    Targeted Scaffolding
                  </div>
                  <h3 className="font-headline-md text-headline-md text-[#181C1F] dark:text-[#E2EFF5] mb-4 font-normal">
                    {getSectionHeading(item.sectionId)}
                  </h3>
                  <p className="font-body-md text-body-md text-[#41484C] dark:text-[#C5C6D0] leading-relaxed mb-6">
                    {item.newExplanation}
                  </p>

                  {item.whyYouMissedIt && (
                    <div className="bg-[#ba1a1a]/10 dark:bg-[#ba1a1a]/20 border border-[#ba1a1a]/30 rounded-xl p-4 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#ba1a1a] text-xl mt-0.5">
                        psychology_alt
                      </span>
                      <div>
                        <h4 className="font-label-md text-label-md font-semibold text-[#ba1a1a] dark:text-[#F87171] mb-1">
                          Why You Missed It
                        </h4>
                        <p className="font-body-sm text-body-sm text-[#41484C] dark:text-[#C5C6D0]">
                          {item.whyYouMissedIt}
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {activeReviewTab === 'remember' && (
          <div className="bg-surface-container-lowest dark:bg-[#14272F] rounded-xl border border-[#B9DBE1] dark:border-white/10 p-6 md:p-8 shadow-sm">
            <h3 className="font-headline-md text-headline-md text-[#181C1F] dark:text-[#E2EFF5] mb-2 font-normal">
              Active Recall Verification Checklist
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant mb-6">
              Check off each concept as you test your ability to explain it without looking at the notes.
            </p>
            <div className="space-y-3 mb-8">
              {mustRememberItems.map((checkItem, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-lg border border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-low/50 dark:hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded text-[#447F98] focus:ring-[#447F98] border-outline-variant"
                  />
                  <span className="font-body-md text-body-md text-[#181C1F] dark:text-[#E2EFF5]">
                    {checkItem}
                  </span>
                </label>
              ))}
            </div>

            {memoryTricks.length > 0 && (
              <div className="pt-6 border-t border-outline-variant/30 dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[#447F98] dark:text-[#94CFEA]">
                    lightbulb
                  </span>
                  <h4 className="font-label-lg text-label-lg font-semibold text-[#181C1F] dark:text-[#E2EFF5]">
                    Memory Hooks & Mnemonics
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {memoryTricks.map((trick, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-[#B9DBE1]/50 dark:border-[#23637B]/40 bg-[#D6EBF3]/20 dark:bg-[#23637B]/20 text-body-sm text-[#223B47] dark:text-[#C5C6D0]"
                    >
                      <span className="font-semibold block mb-1 text-[#447F98] dark:text-[#94CFEA]">Anchor {idx + 1}</span>
                      {trick}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeReviewTab === 'revise' && (
          <div className="bg-surface-container-lowest dark:bg-[#14272F] rounded-xl border border-[#B9DBE1] dark:border-white/10 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline-md text-headline-md text-[#181C1F] dark:text-[#E2EFF5] font-normal">
                Spaced Repetition Schedule
              </h3>
              <span className="text-xs font-label-caps uppercase tracking-wider text-[#447F98] dark:text-[#94CFEA] bg-[#B9DBE1]/30 dark:bg-[#23637B]/30 px-2.5 py-1 rounded-full font-semibold">
                Ebbinghaus Retention Curve
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant mb-6">
              Mark each interval as completed when you finish your active recall retrieval session.
            </p>
            <div className="space-y-3">
              {revisionPlan.map((planItem, idx) => {
                const isDone = Boolean(completedPlanSteps[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePlanStep(idx)}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                      isDone
                        ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 opacity-75'
                        : 'border-[#B9DBE1]/50 dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/50 hover:border-[#447F98]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => togglePlanStep(idx)}
                      className="w-5 h-5 rounded text-[#447F98] focus:ring-[#447F98] border-outline-variant cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div
                      className={`px-3 py-1 rounded-lg text-xs font-label-md font-semibold shrink-0 uppercase tracking-wider transition-colors ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#447F98] text-white'
                      }`}
                    >
                      {planItem.when}
                    </div>
                    <p
                      className={`font-body-md text-body-md transition-all flex-1 ${
                        isDone
                          ? 'line-through text-on-surface-variant/70 dark:text-outline-variant/60'
                          : 'text-[#181C1F] dark:text-[#E2EFF5]'
                      }`}
                    >
                      {planItem.action}
                    </p>
                    {isDone && (
                      <span className="material-symbols-outlined text-emerald-500 text-xl shrink-0">
                        check_circle
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Primary CTA */}
      <div className="flex justify-center">
        <button
          onClick={() => dispatch({ type: 'RESET_SESSION' })}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#447F98] hover:bg-[#35657a] text-white font-label-lg text-label-lg shadow-sm active:scale-95 transition-all duration-150 cursor-pointer font-semibold"
          type="button"
        >
          <span>Start a New Session</span>
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}

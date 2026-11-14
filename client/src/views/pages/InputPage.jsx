import React, { useState } from 'react';
import { useLessonController } from '../../controllers/useLessonController.js';
import { LEVELS, LIMITS } from '../../models/constants.js';
import { LoadingState } from '../components/feedback/LoadingState.jsx';
import { ErrorBanner } from '../components/feedback/ErrorBanner.jsx';

export function InputPage() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [validationError, setValidationError] = useState('');
  const { generateLesson, loading, error, clearError } = useLessonController();

  const handleLevelChange = (lvlId) => {
    setLevel(lvlId);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = topic.trim();
    if (trimmed.length < LIMITS.MIN_TOPIC_LENGTH) {
      setValidationError(`Topic must be at least ${LIMITS.MIN_TOPIC_LENGTH} characters long.`);
      return;
    }
    setValidationError('');
    generateLesson(trimmed, level);
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (topic.trim().length >= LIMITS.MIN_TOPIC_LENGTH) {
        handleSubmit(e);
      }
    }
  };

  const handleSuggestionClick = (title) => {
    const text = `Explain the fundamentals of ${title} in clear structured sections.`;
    setTopic(text);
  };

  if (loading) {
    return <LoadingState message="Preparing your lesson..." subMessage="Breaking the topic into simple steps. About 10 seconds." />;
  }

  const isSubmitDisabled = topic.trim().length === 0;

  return (
    <main className="w-full max-w-[760px] mx-auto pt-24 pb-16 flex-1 flex flex-col justify-center px-4">
      {/* Hero Header Unit */}
      <div className="text-center space-y-4 mb-8">
        {/* Pill Label */}
        <div className="inline-flex items-center justify-center">
          <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-label-caps tracking-[0.16em] uppercase text-[#12303D] dark:text-[#94CFEA] bg-[#B9DBE1]/35 dark:bg-[#23637B]/30 border border-[#B9DBE1] dark:border-[#23637B]/50 font-semibold">
            AI LEARNING COMPANION
          </span>
        </div>

        {/* Dignified Serif Headline */}
        <h1 className="font-headline-xl text-headline-xl text-[#12303D] dark:text-[#E2EFF5] tracking-tight font-normal">
          Learn anything, then prove it
        </h1>

        {/* Functional Explanatory Copy */}
        <p className="font-body-md text-body-md text-[#4F6B78] dark:text-[#95CEEB]/80 max-w-[560px] mx-auto">
          Enter a topic or paste notes. Recall explains it simply, tests you, and fixes your weak spots.
        </p>
      </div>

      <ErrorBanner
        message={validationError || (error ? error.message : null)}
        onDismiss={() => {
          setValidationError('');
          clearError();
        }}
      />

      {/* Main Study Input Card (Tier 1 Surface) */}
      <div className="bg-surface-container-lowest dark:bg-[#14272F] rounded-[20px] border border-[#B9DBE1] dark:border-[#23637B]/40 chilled-shadow p-6 sm:p-8 backdrop-blur-md transition-all">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Textarea with Clean Framing & Counter */}
          <div className="relative bg-surface-bright/50 dark:bg-[#0D1B22]/50 rounded-xl p-4 border border-[#B9DBE1]/40 dark:border-[#23637B]/30 focus-within:border-[#447F98] focus-within:ring-2 focus-within:ring-[#447F98]/15 transition-all">
            <textarea
              className="w-full bg-transparent border-0 resize-none p-0 font-body-md text-body-md text-[#12303D] dark:text-[#E2EFF5] placeholder-[#4F6B78] focus:ring-0 focus:outline-none"
              maxLength={8000}
              placeholder="What do you want to learn?"
              rows={6}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#B9DBE1]/20 dark:border-white/10">
              <span className="font-body-sm text-body-sm text-[#4F6B78] dark:text-outline-variant select-none">
                {topic.length} / 8000
              </span>

              <div className="flex items-center gap-2 text-[#4F6B78] dark:text-outline-variant text-xs">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high/60 dark:bg-white/10 text-[10px] font-mono">
                    ⌘
                  </kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high/60 dark:bg-white/10 text-[10px] font-mono">
                    ↵
                  </kbd>
                  to start
                </span>
              </div>
            </div>
          </div>

          {/* Operational Configuration Layer: Level Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div aria-label="Proficiency Level" className="flex items-center gap-2" role="radiogroup">
              <span className="font-label-caps text-label-caps text-[#4F6B78] dark:text-outline-variant mr-1 select-none font-semibold">
                DEPTH:
              </span>
              {LEVELS.map((lvl) => {
                const isSelected = level === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleLevelChange(lvl.id)}
                    className={`px-4 py-1.5 rounded-full font-label-md text-label-md transition-all ${
                      isSelected
                        ? 'bg-[#447F98] text-white border border-[#447F98] shadow-sm font-semibold'
                        : 'bg-transparent text-[#4F6B78] dark:text-[#95CEEB] border border-[#DADEE1] dark:border-outline/40 hover:border-[#629BB6]'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#4F6B78] dark:text-[#95CEEB] select-none">
              <span className="material-symbols-outlined !text-base text-[#23637B] dark:text-[#94CFEA]">
                auto_awesome
              </span>
              <span>Adaptive synthesis</span>
            </div>
          </div>

          {/* Full-Width Primary Action Control */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`w-full min-h-[48px] rounded-[12px] flex items-center justify-center gap-2 font-label-md text-label-md transition-all duration-200 ${
              isSubmitDisabled
                ? 'cursor-not-allowed bg-[#DADEE1] dark:bg-white/10 text-white dark:text-outline-variant'
                : 'cursor-pointer bg-[#447F98] hover:bg-[#386A7F] text-white shadow-md active:scale-[0.99] font-semibold'
            }`}
          >
            <span>Start learning</span>
            <span className="material-symbols-outlined !text-lg">arrow_forward</span>
          </button>
        </form>
      </div>

      {/* Suggestion Chips Row */}
      <div className="mt-8 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-label-caps text-label-caps text-[#4F6B78] dark:text-outline-variant uppercase tracking-wider font-semibold">
            Suggested starting points
          </span>
          <span className="text-xs text-[#4F6B78] dark:text-outline-variant">Quick populate</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { label: 'Photosynthesis', icon: 'energy_savings_leaf' },
            { label: 'World War II', icon: 'history_edu' },
            { label: 'React hooks', icon: 'code_blocks' },
            { label: 'Quantum computing', icon: 'grain' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleSuggestionClick(item.label)}
              type="button"
              className="suggestion-chip px-4 py-2 rounded-full font-label-md text-label-md text-[#12303D] dark:text-[#E2EFF5] bg-surface-container-lowest/80 dark:bg-[#14272F] border border-[#B9DBE1] dark:border-[#23637B]/40 hover:border-[#447F98] hover:bg-white dark:hover:bg-[#19323c] transition-all chilled-shadow active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined !text-base text-secondary dark:text-[#95CEEB]">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Accent Study Metrics Banner */}
      <div className="mt-12 grid grid-cols-3 divide-x divide-[#B9DBE1]/40 dark:divide-[#23637B]/30 py-4 px-6 rounded-2xl bg-white/40 dark:bg-[#14272F]/40 border border-[#B9DBE1]/30 dark:border-[#23637B]/20 backdrop-blur-sm text-center">
        <div className="px-2">
          <p className="font-headline-md text-headline-md text-[#12303D] dark:text-[#E2EFF5] font-normal">3-Tier</p>
          <p className="font-label-caps text-[10px] text-[#4F6B78] dark:text-outline-variant uppercase tracking-wider font-semibold">
            Validation check
          </p>
        </div>
        <div className="px-2">
          <p className="font-headline-md text-headline-md text-[#12303D] dark:text-[#E2EFF5] font-normal">85%</p>
          <p className="font-label-caps text-[10px] text-[#4F6B78] dark:text-outline-variant uppercase tracking-wider font-semibold">
            Long-term recall
          </p>
        </div>
        <div className="px-2">
          <p className="font-headline-md text-headline-md text-[#12303D] dark:text-[#E2EFF5] font-normal">Socratic</p>
          <p className="font-label-caps text-[10px] text-[#4F6B78] dark:text-outline-variant uppercase tracking-wider font-semibold">
            Adaptive inquiry
          </p>
        </div>
      </div>
    </main>
  );
}

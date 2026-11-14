import React from 'react';

export function ExplanationPanel({ isCorrect, explanation }) {
  return (
    <section className="mt-6 p-5 rounded-xl border border-[#B9DBE1]/60 dark:border-[#23637B]/40 bg-[#D6EBF3]/40 dark:bg-[#14272F]/90 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#447F98]/15 text-[#447F98]">
          <span className="material-symbols-outlined text-sm font-semibold">lightbulb</span>
        </span>
        <h2 className="font-label-lg text-label-lg font-semibold text-[#182F3A] dark:text-[#E2EFF5] tracking-tight">
          {isCorrect ? 'Why this is correct' : 'Explanation & Context'}
        </h2>
      </div>
      <p className="font-body-md text-body-md text-[#223B47] dark:text-[#95CEEB]/90 leading-relaxed pl-8">
        {explanation}
      </p>
    </section>
  );
}

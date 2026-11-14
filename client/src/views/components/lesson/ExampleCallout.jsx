import React from 'react';

export function ExampleCallout({ example }) {
  if (!example) return null;

  return (
    <div className="bg-[#B9DBE1]/20 dark:bg-[#23637B]/20 border border-[#B9DBE1]/60 dark:border-[#23637B]/40 rounded-xl p-5 my-6 flex items-start gap-3.5">
      <span className="material-symbols-outlined text-[#447F98] dark:text-[#94CFEA] text-[24px] shrink-0 mt-0.5">
        lightbulb
      </span>
      <div>
        <h4 className="font-label-lg text-label-lg font-semibold text-[#12303D] dark:text-[#E2EFF5] mb-1">
          Everyday analogy / Concrete Example
        </h4>
        <p className="font-body-md text-body-md text-[#41484C] dark:text-[#A6B4BC] leading-relaxed">
          {example}
        </p>
      </div>
    </div>
  );
}

import React from 'react';

export function ReteachCard({ item }) {
  if (!item) return null;

  return (
    <article className="bg-surface-container-lowest dark:bg-[#14272F] rounded-xl border border-[#B9DBE1] dark:border-white/10 p-6 md:p-8 shadow-sm transition-all mb-6">
      <div className="font-label-sm text-label-sm uppercase tracking-wider text-[#447F98] dark:text-[#94CFEA] font-semibold mb-2">
        Targeted Scaffolding
      </div>
      <h3 className="font-headline-md text-headline-md text-[#181C1F] dark:text-[#E2EFF5] mb-4 font-normal">
        {item.sectionTitle}
      </h3>
      <p className="font-body-md text-body-md text-[#41484C] dark:text-[#C5C6D0] leading-relaxed mb-6">
        {item.reExplanation}
      </p>

      {item.mnemonicOrAnalogy && (
        <div className="bg-[#B9DBE1]/25 dark:bg-[#23637B]/20 border border-[#B9DBE1]/60 dark:border-[#23637B]/40 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#447F98] dark:text-[#94CFEA] text-xl mt-0.5">
            psychology
          </span>
          <div>
            <h4 className="font-label-md text-label-md font-semibold text-[#12303D] dark:text-[#E2EFF5] mb-1">
              Memory Hook / Mental Anchor
            </h4>
            <p className="font-body-sm text-body-sm text-[#41484C] dark:text-[#A6B4BC]">
              {item.mnemonicOrAnalogy}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

import React from 'react';

export function EmptyState({ title = 'No content available', description, actionLabel, onAction }) {
  return (
    <div className="w-full max-w-[760px] mx-auto text-center py-16 px-6 bg-surface-container-lowest/80 dark:bg-[#14272F]/80 border border-[#B9DBE1]/60 dark:border-white/10 rounded-2xl shadow-sm my-8">
      <div className="w-12 h-12 mx-auto rounded-full bg-[#B9DBE1]/30 dark:bg-white/5 flex items-center justify-center text-secondary dark:text-[#95CEEB] mb-4">
        <span className="material-symbols-outlined text-2xl">auto_stories</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface dark:text-[#E2EFF5] font-normal mb-2">
        {title}
      </h3>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant dark:text-outline-variant max-w-md mx-auto mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#447F98] hover:bg-[#35657a] text-white font-label-md text-label-md shadow-sm transition-all active:scale-95 cursor-pointer font-semibold"
          type="button"
        >
          <span>{actionLabel}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      )}
    </div>
  );
}

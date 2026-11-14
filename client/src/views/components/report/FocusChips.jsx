import React from 'react';

export function FocusChips({ weakSections = [], onSelect }) {
  if (!weakSections || weakSections.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {weakSections.map((sec) => (
        <button
          key={sec.sectionId}
          onClick={onSelect}
          type="button"
          className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#14272F] border border-[#ba1a1a]/40 text-on-surface dark:text-[#E2EFF5] hover:border-[#ba1a1a] transition-all shadow-sm cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
          <span className="font-label-md text-label-md font-medium">
            {sec.title} ({sec.scorePct}%)
          </span>
          <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-[#ba1a1a] transition-colors">
            arrow_forward
          </span>
        </button>
      ))}
    </div>
  );
}

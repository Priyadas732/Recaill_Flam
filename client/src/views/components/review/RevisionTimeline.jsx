import React from 'react';

export function RevisionTimeline({ schedule = [] }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <div className="space-y-4">
      {schedule.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 p-4 rounded-xl border border-[#B9DBE1]/40 dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/50 shadow-xs"
        >
          <div className="px-3 py-1 rounded-lg bg-[#447F98] text-white font-label-md text-label-md font-semibold shrink-0">
            {item.day}
          </div>
          <p className="font-body-md text-body-md text-[#181C1F] dark:text-[#E2EFF5]">
            {item.activity}
          </p>
        </div>
      ))}
    </div>
  );
}

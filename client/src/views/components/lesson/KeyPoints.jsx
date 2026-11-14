import React from 'react';

export function KeyPoints({ points = [] }) {
  if (!points || points.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="font-headline-sm text-headline-sm text-on-surface dark:text-[#E2EFF5] mb-3 font-normal">
        Key points to remember
      </h3>
      <ul className="space-y-3">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
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
  );
}

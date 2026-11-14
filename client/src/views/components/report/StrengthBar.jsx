import React from 'react';

export function StrengthBar({ title, scorePct, strength }) {
  let barColor = 'bg-[#447F98]';
  let badgeText = 'Moderate';
  let badgeIcon = 'change_history';
  let badgeClass = 'text-[#A56828] dark:text-[#FBBF24]';

  if (scorePct === 100) {
    barColor = 'bg-emerald-500';
    badgeText = 'Mastered';
    badgeIcon = 'check_circle';
    badgeClass = 'text-emerald-600 dark:text-emerald-400';
  } else if (strength === 'strong' || scorePct >= 80) {
    barColor = 'bg-[#447F98]';
    badgeText = 'Solid';
    badgeIcon = 'verified';
    badgeClass = 'text-[#447F98] dark:text-[#629BB6]';
  } else if (strength === 'weak' || scorePct < 50) {
    barColor = 'bg-[#ba1a1a]';
    badgeText = 'Review needed';
    badgeIcon = 'error_outline';
    badgeClass = 'text-[#ba1a1a] dark:text-[#F87171]';
  }

  return (
    <div className="p-3 rounded-lg hover:bg-surface-container-low/60 dark:hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-body-md text-body-md font-medium text-on-surface dark:text-[#E2EFF5]">
          {title}
        </span>
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center gap-1 font-label-md text-label-md font-semibold ${badgeClass}`}>
            <span className="material-symbols-outlined text-[16px]">{badgeIcon}</span>
            {badgeText}
          </span>
          <span className="font-label-md text-label-md font-semibold text-on-surface dark:text-[#E2EFF5] w-10 text-right">
            {scorePct}%
          </span>
        </div>
      </div>
      <div className="w-full h-2 bg-surface-dim dark:bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${scorePct}%` }}
        />
      </div>
    </div>
  );
}

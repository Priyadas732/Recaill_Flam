import React from 'react';

export function ScoreRing({ scorePct }) {
  const circumference = 301.6;
  const dashoffset = circumference - (scorePct / 100) * circumference;

  let strokeColor = '#447F98';
  if (scorePct >= 80) strokeColor = '#34d399';
  else if (scorePct < 50) strokeColor = '#ba1a1a';

  return (
    <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 120 120">
        <circle
          className="opacity-40 dark:opacity-20"
          cx="60"
          cy="60"
          fill="none"
          r="48"
          stroke="#d6dadd"
          strokeWidth="8"
        />
        <circle
          className="transition-all duration-1000 ease-out"
          cx="60"
          cy="60"
          fill="none"
          r="48"
          stroke={strokeColor}
          strokeDasharray="301.6"
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          strokeWidth="8"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-headline-lg text-headline-lg text-on-surface dark:text-[#E2EFF5] font-semibold tracking-tight leading-none">
          {scorePct}%
        </span>
        <span className="font-label-md text-label-md text-primary dark:text-[#94CFEA] mt-1 font-medium">
          Mastery Score
        </span>
      </div>
    </div>
  );
}

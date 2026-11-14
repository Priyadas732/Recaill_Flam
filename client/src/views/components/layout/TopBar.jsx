import React from 'react';
import { ThemeToggle } from './ThemeToggle.jsx';
import { StageTrail } from './StageTrail.jsx';
import { useSession } from '../../../context/SessionContext.jsx';

export function TopBar() {
  const { dispatch } = useSession();

  return (
    <header className="w-full fixed top-0 left-0 z-50 h-14 border-b border-outline-variant/40 dark:border-white/10 bg-surface-container-lowest/80 dark:bg-[#14272F]/80 backdrop-blur-md shadow-sm">
      <div className="max-w-[1120px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Brand Anchor */}
        <button
          onClick={() => dispatch({ type: 'RESET_SESSION' })}
          className="flex items-center gap-2.5 font-headline-md text-headline-md text-on-surface dark:text-[#E2EFF5] tracking-tight focus:outline-none cursor-pointer"
          type="button"
        >
          <img
            src="/logo.jpg"
            alt="Recall Logo"
            className="w-8 h-8 rounded-lg object-cover shadow-sm border border-outline-variant/30"
          />
          <span className="font-semibold text-xl tracking-tight text-[#181C1F] dark:text-[#E2EFF5]">Recall</span>
        </button>

        {/* 5-Step Progress Trail */}
        <StageTrail />

        {/* Trailing Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

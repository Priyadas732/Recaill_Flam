import React from 'react';
import { useTheme } from '../../../controllers/useTheme.js';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle display theme"
      onClick={toggleTheme}
      className="p-2 rounded-xl text-secondary dark:text-[#95CEEB] hover:bg-surface-container-high/50 dark:hover:bg-white/10 transition-all active:scale-95 duration-150 flex items-center justify-center focus:outline-none"
      type="button"
    >
      <span className="material-symbols-outlined text-[20px]" data-icon="dark_mode">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}

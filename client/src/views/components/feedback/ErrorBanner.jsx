import React from 'react';

/**
 * Dismissible error banner shown at the top of pages.
 * Displays a message with an optional retry button and a dismiss × button.
 */
export function ErrorBanner({ message, onDismiss, onRetry }) {
  if (!message) return null;

  return (
    <div className="w-full max-w-[760px] mx-auto mb-6 p-4 rounded-xl border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-center justify-between gap-3 text-sm shadow-xs">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="material-symbols-outlined text-rose-600 dark:text-rose-400 text-lg shrink-0">
          error
        </span>
        <span className="break-words">{message}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-rose-100 font-semibold text-xs px-2 py-1 rounded-md hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
            type="button"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-rose-600 dark:text-rose-400 hover:opacity-75 font-bold text-lg p-1 leading-none cursor-pointer"
            type="button"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}

import React from 'react';

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="w-full max-w-[760px] mx-auto text-center p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-900/50 rounded-2xl shadow-sm my-8">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <span className="material-symbols-outlined text-2xl">error</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-rose-900 dark:text-rose-200 font-normal mb-2">
        {title}
      </h3>
      {message && (
        <p className="font-body-md text-body-md text-rose-700 dark:text-rose-300 max-w-md mx-auto mb-6">
          {message}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-label-md text-label-md shadow-sm transition-all active:scale-95 cursor-pointer font-semibold"
          type="button"
        >
          <span>Try Again</span>
          <span className="material-symbols-outlined text-sm">refresh</span>
        </button>
      )}
    </div>
  );
}

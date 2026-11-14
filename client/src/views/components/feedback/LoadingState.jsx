import React from 'react';
import { useSession } from '../../../context/SessionContext.jsx';
import { STAGES } from '../../../models/constants.js';

export function LoadingState({
  message = 'Preparing your lesson...',
  subMessage = 'Breaking the topic into simple steps. About 10 seconds.',
  onCancel,
}) {
  const { dispatch } = useSession();

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT });
    }
  };

  return (
    <main className="w-full flex-grow flex items-center justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-[680px] mx-auto">
        <section className="bg-surface-container-lowest/85 dark:bg-[#14272F]/90 backdrop-blur-md rounded-[20px] border border-[#B9DBE1] dark:border-[#23637B]/40 shadow-[0_12px_40px_-15px_rgba(50,97,120,0.12)] p-6 sm:p-8 text-center transition-all">
          {/* Spinner Ring */}
          <div className="flex justify-center items-center mb-6">
            <div className="relative w-11 h-11 flex items-center justify-center">
              {/* Background subtle track */}
              <div className="w-full h-full rounded-full border-[2.5px] border-[#DADEE1]/50 dark:border-white/10" />
              {/* Rotating Slate Blue Accent ring */}
              <div className="absolute inset-0 rounded-full border-[2.5px] border-t-[#629BB6] border-r-[#629BB6] border-b-transparent border-l-transparent animate-spin-smooth" />
            </div>
          </div>

          {/* Academic Typography Cluster */}
          <div className="space-y-2 mb-8">
            <h1 className="font-headline-md text-headline-md sm:text-[28px] sm:leading-[34px] text-[#12303D] dark:text-[#E2EFF5] font-normal tracking-normal">
              {message}
            </h1>
            <p className="font-body-md text-body-md text-[#4F6B78] dark:text-[#95CEEB]/80 max-w-[440px] mx-auto">
              {subMessage}
            </p>
          </div>

          {/* Skeleton Content Units with Shimmer */}
          <div className="space-y-3.5 mb-8 text-left">
            {/* Card 1 */}
            <div className="rounded-xl border border-[#B9DBE1]/40 dark:border-white/10 p-4 space-y-3 bg-surface-container-lowest/60 dark:bg-white/5 shadow-xs">
              <div className="w-2/5 h-3.5 bg-[#B9DBE1]/45 dark:bg-white/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full shimmer-line" />
                <div className="h-2.5 w-4/5 rounded-full shimmer-line" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-[#B9DBE1]/40 dark:border-white/10 p-4 space-y-3 bg-surface-container-lowest/60 dark:bg-white/5 shadow-xs">
              <div className="w-1/2 h-3.5 bg-[#B9DBE1]/45 dark:bg-white/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full shimmer-line" />
                <div className="h-2.5 w-11/12 rounded-full shimmer-line" />
                <div className="h-2.5 w-2/3 rounded-full shimmer-line" />
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-[#B9DBE1]/40 dark:border-white/10 p-4 space-y-3 bg-surface-container-lowest/60 dark:bg-white/5 shadow-xs">
              <div className="w-1/3 h-3.5 bg-[#B9DBE1]/45 dark:bg-white/20 rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-2.5 w-full rounded-full shimmer-line" />
                <div className="h-2.5 w-3/4 rounded-full shimmer-line" />
              </div>
            </div>
          </div>

          {/* Quiet Muted Cancellation Action */}
          <div className="pt-1">
            <button
              onClick={handleCancel}
              className="font-body-sm text-body-sm text-[#4F6B78] dark:text-[#95CEEB] hover:text-[#12303D] hover:underline underline-offset-4 transition-colors focus:outline-hidden px-4 py-1.5 rounded-lg cursor-pointer"
              type="button"
            >
              Cancel
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

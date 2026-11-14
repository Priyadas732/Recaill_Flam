import React from 'react';

/**
 * Catches unhandled errors thrown during React rendering.
 * Without this, a single bad render (e.g. accessing .map on undefined)
 * would crash the entire app to a blank white screen.
 *
 * Must be a class component — React does not support error boundaries
 * via hooks (as of React 18).
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-bright dark:bg-[#0D1B22]">
          <div className="w-full max-w-md text-center bg-surface-container-lowest dark:bg-[#14272F] rounded-2xl border border-rose-300 dark:border-rose-900/50 p-8 shadow-lg space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-rose-600 dark:text-rose-400">
                error
              </span>
            </div>
            <h1 className="font-headline-md text-headline-md text-[#12303D] dark:text-[#E2EFF5] font-normal">
              Something went wrong
            </h1>
            <p className="font-body-md text-body-md text-[#4F6B78] dark:text-[#95CEEB]/80">
              An unexpected error occurred while rendering the page. Try refreshing or starting a new session.
            </p>
            <pre className="text-xs text-left bg-surface-container-low dark:bg-[#0D1B22] rounded-lg p-3 max-h-24 overflow-auto text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/30">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#447F98] hover:bg-[#35657a] text-white font-label-md shadow-sm transition-all active:scale-95 cursor-pointer font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-base">refresh</span>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


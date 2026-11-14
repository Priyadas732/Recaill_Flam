import React from 'react';
import { useReportController } from '../../controllers/useReportController.js';
import { LoadingState } from '../components/feedback/LoadingState.jsx';
import { ErrorBanner } from '../components/feedback/ErrorBanner.jsx';
import { EmptyState } from '../components/feedback/EmptyState.jsx';
import { useSession } from '../../context/SessionContext.jsx';
import { STAGES } from '../../models/constants.js';

export function ReportPage() {
  const { report, loading, error, clearError, triggerRemediation } = useReportController();
  const { dispatch, state } = useSession();

  if (loading) {
    return <LoadingState message="Synthesizing personalized remediation..." subMessage="Pinpointing knowledge gaps and constructing memory scaffolds." />;
  }

  if (!report) {
    return (
      <EmptyState
        title="No Report Available"
        description="Please complete a quiz first to generate your performance report."
        actionLabel="Go to Topics"
        onAction={() => dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT })}
      />
    );
  }

  const hasWeakSections = report.weakSections && report.weakSections.length > 0;
  const scorePct = report.overallScorePct;

  // SVG circle calculations: r=48 => circumference = 2 * PI * 48 = 301.6px
  const circumference = 301.6;
  const dashoffset = circumference - (scorePct / 100) * circumference;

  return (
    <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 md:px-6 pt-24 pb-12 flex flex-col gap-6">
      {/* Breadcrumb / Session Meta */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 text-on-surface-variant dark:text-outline-variant border-b border-outline-variant/30 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2 font-label-md text-label-md">
          <span>{state.topic || 'Curriculum'}</span>
          <span className="text-outline-variant">/</span>
          <span className="text-primary dark:text-[#94CFEA] font-semibold">Diagnostic Evaluation</span>
        </div>
        <span className="font-label-sm text-label-sm text-outline dark:text-outline-variant">
          Session finished · Socratic Active Recall Mode
        </span>
      </div>

      <ErrorBanner message={error ? error.message : null} onDismiss={clearError} />

      {/* 1. Header Performance Card */}
      <section className="bg-surface-container-lowest dark:bg-[#14272F] border border-outline-variant/60 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
          {/* Circular Score Ring */}
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
                stroke={scorePct >= 80 ? '#34d399' : scorePct >= 50 ? '#447F98' : '#ba1a1a'}
                strokeDasharray="301.6"
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-headline-lg text-headline-lg text-on-surface dark:text-[#E2EFF5] font-semibold tracking-tight leading-none">
                {report.totalCorrect}/{report.totalQuestions}
              </span>
              <span className="font-label-md text-label-md text-primary dark:text-[#94CFEA] mt-1 font-medium">
                {scorePct}% correct
              </span>
            </div>
          </div>

          {/* Editorial Headline & Text Block */}
          <div className="flex-1 text-center md:text-left flex flex-col gap-1.5">
            <div className="inline-flex items-center self-center md:self-start gap-1.5 px-2.5 py-0.5 rounded-lg bg-surface-container-low dark:bg-[#0D1B22] border border-outline-variant/50 dark:border-white/10 text-secondary dark:text-[#95CEEB] font-label-md text-label-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#447F98]" />
              Evaluated by Recall Diagnostic Model
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-[#E2EFF5] tracking-tight mt-1 font-normal">
              {scorePct >= 80
                ? 'Outstanding Mastery! High retention verified.'
                : scorePct >= 50
                ? 'Good foundation. A few gaps to close.'
                : 'Targeted reinforcement recommended.'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant dark:text-[#C5C6D0] max-w-2xl leading-relaxed">
              You accurately solved {report.totalCorrect} out of {report.totalQuestions} conceptual prompts.
              {hasWeakSections
                ? ` Specific concepts in ${report.weakSections.map((s) => s.title).join(', ')} require remediation to solidify into permanent memory.`
                : ' All concepts demonstrated rock-solid mastery across the board!'}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Topic Understanding & Mastery Breakdown */}
      <section className="bg-surface-container-lowest dark:bg-[#14272F] border border-outline-variant/60 dark:border-white/10 rounded-xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b border-outline-variant/30 dark:border-white/10 pb-3 gap-1">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-[#E2EFF5] font-normal">
              Your understanding by topic
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant mt-0.5">
              Calculated from weighted retention, prompt complexity, and latency across sections.
            </p>
          </div>
          <span className="font-label-md text-label-md text-outline dark:text-outline-variant">
            {report.sectionResults.length} Sub-sections Monitored
          </span>
        </div>

        {/* Horizontal Performance Bars */}
        <div className="flex flex-col gap-3">
          {report.sectionResults.map((sec, idx) => {
            const is100 = sec.scorePct === 100;
            const isSolid = sec.scorePct >= 80 && sec.scorePct < 100;
            const isModerate = sec.scorePct >= 50 && sec.scorePct < 80;
            const isReviewNeeded = sec.scorePct < 50;

            let barColor = 'bg-[#447F98]';
            let badgeText = 'Moderate';
            let badgeIcon = 'change_history';
            let badgeClass = 'text-[#A56828] dark:text-[#FBBF24]';

            if (is100) {
              barColor = 'bg-emerald-500';
              badgeText = 'Mastered';
              badgeIcon = 'check_circle';
              badgeClass = 'text-emerald-600 dark:text-emerald-400';
            } else if (isSolid) {
              barColor = 'bg-[#447F98]';
              badgeText = 'Solid';
              badgeIcon = 'verified';
              badgeClass = 'text-[#447F98] dark:text-[#629BB6]';
            } else if (isReviewNeeded) {
              barColor = 'bg-[#ba1a1a]';
              badgeText = 'Review needed';
              badgeIcon = 'error_outline';
              badgeClass = 'text-[#ba1a1a] dark:text-[#F87171]';
            }

            return (
              <div
                key={sec.sectionId}
                className="p-3 rounded-lg hover:bg-surface-container-low/60 dark:hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md text-outline dark:text-outline-variant">
                      0{idx + 1}
                    </span>
                    <span className="font-body-md text-body-md font-medium text-on-surface dark:text-[#E2EFF5]">
                      {sec.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex items-center gap-1 font-label-md text-label-md font-semibold ${badgeClass}`}>
                      <span className="material-symbols-outlined text-[16px]">{badgeIcon}</span>
                      {badgeText}
                    </span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface dark:text-[#E2EFF5] w-10 text-right">
                      {sec.scorePct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-surface-dim dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-700`}
                    style={{ width: `${sec.scorePct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Focus Areas Sub-Section Callout */}
        {hasWeakSections && (
          <div className="mt-2 bg-surface-container-low dark:bg-[#0D1B22]/80 border border-outline-variant/40 dark:border-white/10 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-error-container text-[#ba1a1a] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]">lightbulb</span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg text-on-surface dark:text-[#E2EFF5] font-semibold">
                  Focus areas
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant">
                  Recommended focus before proceeding to next adaptive recall block.
                </p>
              </div>
            </div>

            {/* Interactive Chip Row */}
            <div className="flex flex-wrap items-center gap-2">
              {report.weakSections.map((sec) => (
                <button
                  key={sec.sectionId}
                  onClick={triggerRemediation}
                  type="button"
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest dark:bg-[#14272F] border border-[#ba1a1a]/40 text-on-surface dark:text-[#E2EFF5] hover:border-[#ba1a1a] transition-all shadow-sm cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                  <span className="font-label-md text-label-md font-medium">
                    {sec.title} ({sec.scorePct}%)
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-outline group-hover:text-[#ba1a1a] transition-colors">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. Action Buttons */}
      <section className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-outline dark:text-outline-variant font-label-md text-label-md">
          <span className="material-symbols-outlined text-[18px]">schedule</span>
          <span>Recommended review time: ~6 minutes</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => dispatch({ type: 'SET_STAGE', payload: STAGES.QUIZ })}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#447F98]/40 text-[#447F98] dark:text-[#95CEEB] bg-surface-container-lowest dark:bg-[#14272F] hover:bg-surface-container-low dark:hover:bg-white/5 font-label-lg text-label-lg transition-all active:scale-95 shadow-sm cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            <span>Retake the quiz</span>
          </button>

          {hasWeakSections ? (
            <button
              onClick={triggerRemediation}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#447F98] hover:bg-[#35657a] text-white font-label-lg text-label-lg transition-all active:scale-95 shadow-sm cursor-pointer font-semibold"
              type="button"
            >
              <span>Explain what I missed</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'RESET_SESSION' })}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#34d399] hover:bg-[#10b981] text-white font-label-lg text-label-lg transition-all active:scale-95 shadow-sm cursor-pointer font-semibold"
              type="button"
            >
              <span>Master Another Topic</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

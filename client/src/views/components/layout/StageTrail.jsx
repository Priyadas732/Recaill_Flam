import React from 'react';
import { useSession } from '../../../context/SessionContext.jsx';
import { STAGES } from '../../../models/constants.js';

export function StageTrail() {
  const { state, dispatch } = useSession();

  const isLearnActive = state.stage === STAGES.INPUT || state.stage === STAGES.LESSON;
  const isTestActive = state.stage === STAGES.QUIZ;
  const isReportActive = state.stage === STAGES.REPORT;
  const isReviewActive = state.stage === STAGES.REVIEW && state.activeReviewTab !== 'revise';
  const isReviseActive = (state.stage === STAGES.REVIEW && state.activeReviewTab === 'revise') || state.stage === 'revise';

  const steps = [
    {
      id: 'learn',
      label: 'Learn',
      isActive: isLearnActive,
      isEnabled: true,
      onClick: () => {
        if (state.lesson) {
          dispatch({ type: 'SET_STAGE', payload: STAGES.LESSON });
        } else {
          dispatch({ type: 'SET_STAGE', payload: STAGES.INPUT });
        }
      },
    },
    {
      id: 'test',
      label: 'Test',
      isActive: isTestActive,
      isEnabled: Boolean(state.quiz || state.lesson),
      onClick: () => {
        if (state.quiz) {
          dispatch({ type: 'SET_STAGE', payload: STAGES.QUIZ });
        } else if (state.lesson) {
          dispatch({ type: 'SET_STAGE', payload: STAGES.LESSON });
        }
      },
    },
    {
      id: 'report',
      label: 'Report',
      isActive: isReportActive,
      isEnabled: Boolean(state.report),
      onClick: () => {
        if (state.report) {
          dispatch({ type: 'SET_STAGE', payload: STAGES.REPORT });
        }
      },
    },
    {
      id: 'review',
      label: 'Review',
      isActive: isReviewActive,
      isEnabled: Boolean(state.remediation || state.report || state.lesson),
      onClick: () => {
        dispatch({ type: 'SET_REVIEW_TAB', payload: 'reexplained' });
        dispatch({ type: 'SET_STAGE', payload: STAGES.REVIEW });
      },
    },
    {
      id: 'revise',
      label: 'Revise',
      isActive: isReviseActive,
      isEnabled: Boolean(state.lesson || state.remediation),
      onClick: () => {
        dispatch({ type: 'SET_REVIEW_TAB', payload: 'revise' });
        dispatch({ type: 'SET_STAGE', payload: STAGES.REVIEW });
      },
    },
  ];

  return (
    <nav className="hidden sm:flex items-center gap-6" aria-label="Curriculum Progress Steps">
      {steps.map((step) => {
        return (
          <button
            key={step.id}
            type="button"
            disabled={!step.isEnabled}
            onClick={step.onClick}
            className={`font-label-caps text-label-caps tracking-widest uppercase pb-1 transition-colors ${
              step.isActive
                ? 'text-[#23637b] dark:text-[#94CFEA] border-b-2 border-[#23637b] dark:border-[#94CFEA] font-semibold'
                : step.isEnabled
                ? 'text-on-surface-variant dark:text-outline-variant hover:text-on-surface dark:hover:text-white cursor-pointer'
                : 'text-on-surface-variant/40 dark:text-outline-variant/30 cursor-not-allowed'
            }`}
          >
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}

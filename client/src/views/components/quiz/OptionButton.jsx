import React from 'react';

export function OptionButton({
  option,
  index,
  isSelected,
  isCorrect,
  isSubmitted,
  onClick,
}) {
  const optionLetters = ['A', 'B', 'C', 'D'];

  let buttonClass = 'w-full text-left flex items-start gap-3.5 p-4 rounded-xl transition-all duration-150 cursor-pointer focus:outline-none';
  let badgeClass = 'flex-shrink-0 w-8 h-8 rounded-lg font-label-md text-label-md flex items-center justify-center font-semibold transition-colors';
  let textClass = 'font-body-md text-body-md leading-relaxed';

  if (isSubmitted) {
    if (isCorrect) {
      buttonClass += ' border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-on-surface ring-1 ring-emerald-500/20';
      badgeClass += ' bg-emerald-600 text-white';
      textClass += ' font-medium text-emerald-950 dark:text-emerald-100';
    } else if (isSelected) {
      buttonClass += ' border border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-on-surface opacity-90';
      badgeClass += ' bg-rose-500 text-white';
      textClass += ' text-rose-950 dark:text-rose-100';
    } else {
      buttonClass += ' border border-[#B9DBE1]/40 dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/50 text-on-surface opacity-60';
      badgeClass += ' border border-[#B9DBE1]/40 text-on-surface-variant';
      textClass += ' text-[#41484C] dark:text-[#A6B4BC]';
    }
  } else if (isSelected) {
    buttonClass += ' border-2 border-[#447F98] bg-[#D6EBF3]/50 dark:bg-[#447F98]/20 text-on-surface shadow-xs';
    badgeClass += ' bg-[#447F98] text-white shadow-xs';
    textClass += ' font-medium text-on-surface dark:text-[#E2EFF5]';
  } else {
    buttonClass += ' border border-[#B9DBE1] dark:border-white/10 bg-surface-container-lowest dark:bg-[#0D1B22]/60 text-on-surface hover:bg-surface-container-low dark:hover:bg-white/5 group';
    badgeClass += ' border border-[#B9DBE1] dark:border-white/20 bg-surface-container-low/60 dark:bg-white/5 text-on-surface-variant font-semibold group-hover:border-[#447F98]';
    textClass += ' text-on-surface dark:text-[#C5C6D0] group-hover:text-primary transition-colors';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isSubmitted}
      className={buttonClass}
    >
      <span className={badgeClass}>{optionLetters[index]}</span>
      <div className="flex-1 pt-1">
        <p className={textClass}>{option}</p>
      </div>
      {isSubmitted && isCorrect && (
        <span className="material-symbols-outlined text-emerald-600 text-2xl mt-1 fill-1">
          check_circle
        </span>
      )}
      {isSubmitted && isSelected && !isCorrect && (
        <span className="material-symbols-outlined text-rose-500 text-2xl mt-1">
          cancel
        </span>
      )}
      {!isSubmitted && isSelected && (
        <span className="material-symbols-outlined text-[#447F98] text-xl mt-1.5">
          radio_button_checked
        </span>
      )}
    </button>
  );
}

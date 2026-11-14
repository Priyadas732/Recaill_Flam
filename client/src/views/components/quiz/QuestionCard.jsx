import React from 'react';
import { OptionButton } from './OptionButton.jsx';
import { ExplanationPanel } from './ExplanationPanel.jsx';

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  onSelectOption,
}) {
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === question.correctIndex;

  return (
    <div className="w-full max-w-3xl mx-auto bg-surface-container-lowest dark:bg-[#14272F] rounded-2xl shadow-sm border border-outline-variant/40 dark:border-white/10 p-6 sm:p-8 md:p-10 transition-all">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-3">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-[#447F98] dark:text-[#94CFEA] font-semibold px-2 py-0.5 rounded bg-[#B9DBE1]/30 dark:bg-[#23637B]/30 border border-[#B9DBE1]/40">
            Conceptual Synthesis
          </span>
          <span className="text-on-surface-variant/70 dark:text-outline-variant/70 text-xs">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <h2 className="font-headline-md text-headline-md md:text-[1.625rem] text-[#182F3A] dark:text-[#E2EFF5] font-normal leading-relaxed text-balance">
          {question.question}
        </h2>
      </div>

      <div className="space-y-3.5 mb-2">
        {question.options.map((option, idx) => (
          <OptionButton
            key={idx}
            option={option}
            index={idx}
            isSelected={selectedAnswer === idx}
            isCorrect={idx === question.correctIndex}
            isSubmitted={isAnswered}
            onClick={() => onSelectOption(idx)}
          />
        ))}
      </div>

      {isAnswered && (
        <ExplanationPanel isCorrect={isCorrect} explanation={question.explanation} />
      )}
    </div>
  );
}

import React from 'react';
import { KeyPoints } from './KeyPoints.jsx';
import { ExampleCallout } from './ExampleCallout.jsx';

export function SectionCard({ section, index }) {
  if (!section) return null;

  return (
    <article className="bg-surface-container-lowest/95 dark:bg-[#14272F] backdrop-blur-md rounded-xl border border-[#B9DBE1] dark:border-[#23637B]/40 shadow-[0_8px_30px_rgb(50,97,120,0.06)] p-6 sm:p-8 md:p-10 mb-6 transition-all">
      <div className="font-label-md text-label-md uppercase tracking-[0.2em] text-[#447F98] dark:text-[#94CFEA] font-semibold mb-3">
        SECTION {index + 1} · {section.title?.toUpperCase()}
      </div>

      <h2 className="font-headline-lg text-headline-lg text-[#12303D] dark:text-[#E2EFF5] tracking-tight mb-4 font-normal">
        {section.title}
      </h2>

      <p className="font-body-lg text-body-lg text-[#181C1F] dark:text-[#C5C6D0] leading-relaxed mb-6">
        {section.summary}
      </p>

      {section.keyPoints && section.keyPoints.length > 0 && (
        <KeyPoints points={section.keyPoints} />
      )}

      {section.example && (
        <ExampleCallout example={section.example} />
      )}
    </article>
  );
}

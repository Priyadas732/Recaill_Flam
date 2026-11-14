import React, { useState } from 'react';

export function Checklist({ checklist = [] }) {
  const [checkedItems, setCheckedItems] = useState({});

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-3">
      {checklist.map((item, idx) => {
        const isChecked = !!checkedItems[idx];
        return (
          <label
            key={idx}
            className={`flex items-start gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
              isChecked
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                : 'border-outline-variant/30 dark:border-white/10 hover:bg-surface-container-low/50 dark:hover:bg-white/5 text-[#181C1F] dark:text-[#E2EFF5]'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleCheck(idx)}
              className="mt-1 w-4 h-4 rounded text-[#447F98] focus:ring-[#447F98] border-outline-variant cursor-pointer"
            />
            <span className={`font-body-md text-body-md ${isChecked ? 'line-through opacity-80' : ''}`}>
              {item}
            </span>
          </label>
        );
      })}
    </div>
  );
}

import React from "react";

// Segmented filter tabs with optional per-option counts.
export function FilterTabs({ options, value, onChange, counts, size = "sm" }) {
  const isSm = size === "sm";
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`inline-flex items-center rounded-md font-semibold transition-colors ${
              isSm
                ? "gap-1 px-2.5 py-1 text-xs sm:text-sm"
                : "gap-1.5 px-3 py-1.5 text-sm"
            } ${
              active ? "bg-ink text-surface shadow-xs" : "bg-surface text-ink-2 border border-brd hover:bg-surface-2"
            }`}
          >
            {opt}
            {counts && counts[opt] != null && (
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20 dark:bg-black/15" : "bg-surface-3 text-ink-3"}`}>
                {counts[opt]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

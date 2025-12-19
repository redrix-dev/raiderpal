"use client";

type TwoOptionToggleProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  optionA: { value: T; label: string };
  optionB: { value: T; label: string };
  className?: string;
};

export function TwoOptionToggle<T extends string>({
  value,
  onChange,
  optionA,
  optionB,
  className,
}: TwoOptionToggleProps<T>) {
  return (
    <div
      className={
        "inline-flex rounded-md border border-slate-700 bg-slate-900 p-1 text-xs " +
        (className ?? "")
      }
      role="group"
      aria-label="Toggle selection"
      >
      <button
        type="button"
        onClick={() => onChange(optionA.value)}
        aria-pressed={value === optionA.value}
        className={
          "flex-1 px-3 py-1 rounded " +
          (value === optionA.value
            ? "bg-brand-cyan text-white"
            : "text-text-primary hover:bg-surface-base")
        }
      >
        {optionA.label}
      </button>

      <button
        type="button"
        onClick={() => onChange(optionB.value)}
        aria-pressed={value === optionB.value}
        className={
          "flex-1 px-3 py-1 rounded " +
          (value === optionB.value
            ? "bg-brand-cyan text-white"
            : "text-text-primary hover:bg-surface-base")
        }
      >
        {optionB.label}
      </button>
    </div>
  );
}

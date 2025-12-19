import type { HTMLAttributes, ReactNode } from "react";

export type PanelPadding = "none" | "base" | "roomy";

type PanelProps = {
  children: ReactNode;
  className?: string;
  padding?: PanelPadding;
} & HTMLAttributes<HTMLDivElement>;

const paddingClasses: Record<PanelPadding, string> = {
  none: "",
  base: "p-4 sm:p-5 2xl:[.ui-compact_&]:p-4",
  roomy: "p-6 sm:p-7 2xl:[.ui-compact_&]:p-5",
};

const panelBase =
  "rounded-xl border border-border-strong/80 bg-panel-texture text-text-primary shadow-[0_0_40px_rgba(0,0,0,0.6)]";

export function Panel({ children, className = "", padding = "base", ...rest }: PanelProps) {
  const paddingClass = paddingClasses[padding];
  return (
    <div className={`${panelBase}${paddingClass ? ` ${paddingClass}` : ""}${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </div>
  );
}


import type { ReactNode } from "react";

type ToolPanelProps = {
  children: ReactNode;
  className?: string;
};

export function ToolPanel({ children, className }: ToolPanelProps) {
  return (
    <div
      className={`rp-panel space-y-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]${
        className ? ` ${className}` : ""
      }`}
    >
      {children}
    </div>
  );
}

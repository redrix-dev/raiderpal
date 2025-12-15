import type { ReactNode } from "react";
import { Panel } from "./ui/Panel";

type ToolPanelProps = {
  children: ReactNode;
  className?: string;
};

export function ToolPanel({ children, className }: ToolPanelProps) {
  return (
    <Panel className={className}>
      <div className="space-y-4">{children}</div>
    </Panel>
  );
}

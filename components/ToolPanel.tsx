import type { ReactNode } from "react";
import { Panel } from "./ui/Panel";

type ToolPanelProps = {
  children: ReactNode;
  className?: string;
  density?: "compact";
};

export function ToolPanel({ children, className = "", density }: ToolPanelProps) {
  const content = (
    <Panel className={className}>
      <div className="space-y-4 2xl:[.ui-compact_&]:space-y-3">{children}</div>
    </Panel>
  );

  if (density === "compact") {
    return <div className="ui-compact">{content}</div>;
  }

  return content;
}

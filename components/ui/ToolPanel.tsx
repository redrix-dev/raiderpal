// components/ui/ToolPanel.tsx
import type { ReactNode } from "react";
import { ToolShell } from "@/components/ui/ToolShell";

type ToolPanelProps = {
  children: ReactNode;
  className?: string;
  density?: "compact";

  /**
   * Width control for tool pages.
   */
  width?: "normal" | "wide";
};

export function ToolPanel({
  children,
  className = "",
  density,
  width = "normal",
}: ToolPanelProps) {
  const content = (
    <ToolShell width={width} className={className}>
      <div className="space-y-4 2xl:[.ui-compact_&]:space-y-3">{children}</div>
    </ToolShell>
  );

  if (density === "compact") {
    return <div className="ui-compact">{content}</div>;
  }

  return content;
}


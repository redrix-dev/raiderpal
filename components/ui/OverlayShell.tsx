import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type OverlayShellProps = {
  children: ReactNode;
  onDismiss: () => void;
  alignment?: "center" | "top";
  zIndexClassName?: string;
  viewportPaddingClassName?: string;
  containerClassName?: string;
  scrimClassName?: string;
};

export function OverlayShell({
  children,
  onDismiss,
  alignment = "center",
  zIndexClassName = "z-50",
  viewportPaddingClassName = "px-3 sm:px-6",
  containerClassName = "",
  scrimClassName = "bg-overlay-scrim",
}: OverlayShellProps) {
  const alignmentClasses =
    alignment === "top"
      ? "items-start justify-center pt-10"
      : "items-center justify-center";

  return (
    <div
      className={cn("fixed inset-0", zIndexClassName, viewportPaddingClassName)}
      onMouseDown={onDismiss}
      role="presentation"
    >
      <div className={cn("absolute inset-0", scrimClassName)} />
      <div className={cn("relative flex h-full pointer-events-none", alignmentClasses)}>
        <div
          className={cn("w-full pointer-events-auto", containerClassName)}
          onMouseDown={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

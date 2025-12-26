// components/ui/ToolShell.tsx
import type { ReactNode } from "react";

type ToolShellProps = {
  children: ReactNode;
  className?: string;

  /**
   * Optional: let some pages be wider (tables, dense lists).
   */
  width?: "normal" | "wide";
};

export function ToolShell({
  children,
  className = "",
  width = "normal",
}: ToolShellProps) {
  const max =
    width === "wide"
      ? "max-w-6xl"
      : "max-w-5xl";

  return (
    <main
      className={[
        // page spacing
        "mx-auto w-full px-4 sm:px-6 py-8",

        // width control
        max,

        // vertical rhythm
        "space-y-6",

        className,
      ].join(" ")}
    >
      {children}
    </main>
  );
}


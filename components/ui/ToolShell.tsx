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
      ? "max-w-[1520px]"
      : "max-w-[1360px]";

  return (
    <main
      className={[
        // page spacing
        "mx-auto w-full py-6 sm:py-7",

        // width control
        max,

        // vertical rhythm
        "space-y-5",

        className,
      ].join(" ")}
    >
      {children}
    </main>
  );
}

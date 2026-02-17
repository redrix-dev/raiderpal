import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToolGridProps = HTMLAttributes<HTMLDivElement> & {
  columnsAt?: "md" | "lg";
  children: ReactNode;
};

const columnClasses: Record<NonNullable<ToolGridProps["columnsAt"]>, string> = {
  md: "md:grid-cols-2",
  lg: "lg:grid-cols-2",
};

export function ToolGrid({
  children,
  className,
  columnsAt = "lg",
  ...rest
}: ToolGridProps) {
  return (
    <div
      className={cn("grid gap-4 sm:gap-5 items-start", columnClasses[columnsAt], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

// components/ui/CardHeader.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

/**
 * CardHeader
 *
 * Purpose:
 * - Dark chrome header for cards and modals
 * - Separates header content from card body
 * 
 * Token Usage:
 * - bg-surface-base (#0f1005) - dark background
 * - text-primary-invert (#ece2d0) - light text on dark
 * - Embark texture overlay
 */
export function CardHeader({
  children,
  className,
  contentClassName,
  style,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      {...rest}
      className={cn(
        "border-b border-border-strong bg-surface-base text-primary-invert",
        className
      )}
      style={{
        backgroundImage: 'url("/backgrounds/ARC_Raiders_Module_Background.png")',
        backgroundRepeat: "repeat-x",
        backgroundSize: "auto 100%",
        backgroundPosition: "center",
        ...style,
      }}
    >
      <div className={cn("px-6 sm:px-7 py-4", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

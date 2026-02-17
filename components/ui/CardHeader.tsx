// components/ui/CardHeader.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardHeaderPadding = "base" | "compact";
export type CardHeaderDivider = "strong" | "subtle" | "none";

type CardHeaderProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  padding?: CardHeaderPadding;
  divider?: CardHeaderDivider;
} & HTMLAttributes<HTMLDivElement>;

const paddingClasses: Record<CardHeaderPadding, string> = {
  base: "px-6 sm:px-7 py-4",
  compact: "px-4 py-2 sm:px-5 sm:py-2",
};

const dividerClasses: Record<CardHeaderDivider, string> = {
  strong: "border-b border-border-strong",
  subtle: "border-b border-border-subtle",
  none: "border-b-0",
};

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
  padding = "base",
  divider = "strong",
  style,
  ...rest
}: CardHeaderProps) {
  return (
    <div
      {...rest}
      className={cn(
        "bg-surface-base text-primary-invert",
        dividerClasses[divider],
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
      <div className={cn(paddingClasses[padding], contentClassName)}>
        {children}
      </div>
    </div>
  );
}

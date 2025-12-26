// components/ui/SectionHeader.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type SectionHeaderProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  accent?: boolean;
} & HTMLAttributes<HTMLElement>;

/**
 * SectionHeader
 *
 * Purpose:
 * - Page section headers with dark chrome background
 * - Consistent styling for top-level sections
 * 
 * Token Usage:
 * - bg-surface-base (#0f1005) - dark background
 * - text-primary-invert (#ece2d0) - light text on dark
 * - Embark texture overlay
 * - Optional amber accent stripe
 */
export function SectionHeader({
  children,
  className,
  contentClassName,
  accent = false,
  style,
  ...rest
}: SectionHeaderProps) {
  return (
    <header
      {...rest}
      className={cn(
        "rounded-t-lg border border-border-strong bg-surface-base text-primary-invert",
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
      {accent && <div className="h-1 w-full bg-brand-amber" />}
    </header>
  );
}

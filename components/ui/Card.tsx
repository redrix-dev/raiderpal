// components/ui/Card.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "neutral";

type CardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Variant usage:
   * - surface: default content surface with surface-card background.
   * - neutral: no background so callers can supply their own surface/rarity.
   */
  variant?: CardVariant;
} & HTMLAttributes<HTMLDivElement>;

const variantClasses: Record<CardVariant, string> = {
  surface: "bg-surface-card text-primary",
  neutral: "text-primary", // No bg, caller provides it
};

/**
 * Card
 *
 * Purpose:
 * - Content grouping surface
 * - Fully opaque (no blur, no translucency)
 * - Predictable separation from background
 * 
 * Token Usage:
 * - surface variant: Uses surface-card (#f5ede0) with dark text (text-primary #130918)
 * - neutral variant: No background, for custom surfaces like rarity colors
 */
export function Card({
  children,
  className,
  variant = "surface",
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-lg",
        "border border-border-subtle",
        "shadow-sm shadow-black/30",
        "p-4",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

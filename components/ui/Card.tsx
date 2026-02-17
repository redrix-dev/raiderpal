// components/ui/Card.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "neutral";
export type CardPadding = "none" | "xs" | "sm" | "base";

type CardProps = {
  children: ReactNode;
  className?: string;
  /**
   * Variant usage:
   * - surface: default content surface with surface-card background.
   * - neutral: no background so callers can supply their own surface/rarity.
   */
  variant?: CardVariant;
  /**
   * Internal padding for card content.
   * Prefer this over utility overrides such as `!p-*`.
   */
  padding?: CardPadding;
  /**
   * Removes top corners and top border for seamless attachment beneath
   * section headers.
   */
  flushTop?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const variantClasses: Record<CardVariant, string> = {
  surface: "bg-surface-card text-primary",
  neutral: "text-primary", // No bg, caller provides it
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  xs: "p-1",
  sm: "p-3",
  base: "p-4",
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
  padding = "base",
  flushTop = false,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-lg",
        "border border-border-subtle",
        "shadow-card-soft",
        paddingClasses[padding],
        flushTop && "rounded-t-none border-t-0",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

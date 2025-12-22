// components/ui/Panel.tsx
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PanelPadding = "none" | "base" | "roomy";

/**
 * Surface variants.
 * - "light" (RECOMMENDED): Light cream surface for main content
 * - "subtle": Slightly darker light surface for nested content
 * - "chrome": Dark textured surface for UI chrome (modals, drawers)
 */
export type PanelVariant = "light" | "subtle" | "chrome";

type PanelProps = {
  children: ReactNode;
  className?: string;
  padding?: PanelPadding;
  variant?: PanelVariant;
} & HTMLAttributes<HTMLDivElement>;

const paddingClasses: Record<PanelPadding, string> = {
  none: "",
  base: "p-4 sm:p-5 2xl:[.ui-compact_&]:p-4",
  roomy: "p-6 sm:p-7 2xl:[.ui-compact_&]:p-5",
};

const variantClasses: Record<PanelVariant, string> = {
  // Light content surface (RECOMMENDED for most content)
  light:
    "rounded-xl border border-border-subtle bg-surface-card text-primary " +
    "shadow-[0_12px_30px_rgba(0,0,0,0.18)]",

  // Nested / quieter light surface
  subtle:
    "rounded-xl border border-border-subtle bg-surface-panel text-primary " +
    "shadow-[0_10px_25px_rgba(0,0,0,0.22)]",

  // Dark UI chrome (modals, drawers, navigation)
  chrome:
    "rounded-xl border border-border-strong bg-panel-texture text-primary-invert " +
    "shadow-[0_0_40px_rgba(0,0,0,0.6)]",
};

/**
 * Panel
 *
 * Purpose:
 * - Large content containers with consistent styling
 * - Different visual hierarchy through variants
 * 
 * Token Usage:
 * - light variant: surface-card (#f5ede0) + dark text
 * - subtle variant: surface-panel (#ece2d0) + dark text
 * - chrome variant: dark texture + light text (for UI chrome only)
 */
export function Panel({
  children,
  className = "",
  padding = "base",
  variant = "light",
  ...rest
}: PanelProps) {
  return (
    <div
      className={cn(variantClasses[variant], paddingClasses[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
}

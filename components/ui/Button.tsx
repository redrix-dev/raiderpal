// components/ui/Button.tsx
import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "cta";

type CommonButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps =
  | (CommonButtonProps & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (CommonButtonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

const variantClasses: Record<ButtonVariant, string> = {
  // Primary action - cyan
  primary:
    "border-brand-cyan/70 bg-brand-cyan/16 text-primary " +
    "hover:bg-brand-cyan/24 hover:border-brand-cyan " +
    "focus-visible:ring-brand-cyan",

  // Secondary action - subtle light
  secondary:
    "border-border-strong bg-surface-panel text-primary " +
    "hover:border-brand-cyan/60 hover:text-brand-cyan " +
    "focus-visible:ring-brand-cyan",

  // Ghost - minimal
  ghost:
    "border-transparent bg-transparent text-primary " +
    "hover:bg-surface-panel hover:text-brand-cyan " +
    "focus-visible:ring-brand-cyan",

  // CTA - amber (most prominent)
  cta:
    "border-brand-amber/70 bg-brand-amber/18 text-primary " +
    "hover:bg-brand-amber/28 hover:border-brand-amber " +
    "focus-visible:ring-brand-amber",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-base font-medium transition " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-card " +
  "disabled:opacity-50 disabled:cursor-not-allowed";

/**
 * Button
 *
 * Purpose:
 * - Consistent button styling across the app
 * - Multiple variants for different contexts
 * 
 * Variants:
 * - primary: Cyan - main actions, links
 * - secondary: Subtle - cancel, back, secondary actions  
 * - ghost: Minimal - tertiary actions, close buttons
 * - cta: Amber - call-to-action, most important buttons
 * 
 * Token Usage:
 * - Uses brand-cyan and brand-amber for interactive colors
 * - Uses surface-panel for secondary backgrounds
 * - All buttons have dark text (text-primary) for consistency
 */
export function Button(props: ButtonProps) {
  const { children, className = "", variant = "primary", href, ...rest } = props as ButtonProps & {
    href?: string;
  };
  const classes = `${baseClasses} ${variantClasses[variant]}${className ? ` ${className}` : ""}`;

  if (href) {
    return (
      <Link href={href} className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

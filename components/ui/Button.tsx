import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "brand" | "neutral";

type CommonButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps =
  | (CommonButtonProps & { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | (CommonButtonProps & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>);

const variantClasses: Record<ButtonVariant, string> = {
  brand:
    "border-brand-cyan/60 bg-surface-base/60 text-brand-cyan hover:border-brand-cyan hover:bg-surface-base/80 focus-visible:ring-brand-cyan",
  neutral:
    "border-border-subtle bg-surface-base/60 text-text-primary hover:border-brand-cyan/60 hover:text-brand-cyan focus-visible:ring-brand-cyan",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-md border px-4 py-2.5 text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base";

export function Button(props: ButtonProps) {
  const { children, className = "", variant = "brand", href, ...rest } = props as ButtonProps & {
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

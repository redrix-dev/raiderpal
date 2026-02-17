import type { ReactNode } from "react";
import { Button } from "./Button";
import type { ButtonVariant } from "./Button";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

/**
 * Standard primary button used across pages and panels.
 * Keeps color, padding, and focus ring consistent.
 */
export function PrimaryButton({ href, children, className = "", variant = "primary" }: PrimaryButtonProps) {
  return (
    <Button href={href} className={className} variant={variant}>
      {children}
    </Button>
  );
}

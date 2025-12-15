import type { ReactNode } from "react";
import { Button } from "./ui/Button";
import type { ButtonVariant } from "./ui/Button";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

/**
 * Standard CTA button used across pages and panels.
 * Keeps color, padding, and focus ring consistent.
 */
export function PrimaryButton({ href, children, className = "", variant = "brand" }: PrimaryButtonProps) {
  return (
    <Button href={href} className={className} variant={variant}>
      {children}
    </Button>
  );
}

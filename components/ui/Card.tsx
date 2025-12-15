import type { HTMLAttributes, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const cardBase =
  "rounded-lg border border-border-subtle bg-surface-card/90 text-text-primary backdrop-blur-sm p-4";

export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div className={`${cardBase}${className ? ` ${className}` : ""}`} {...rest}>
      {children}
    </div>
  );
}

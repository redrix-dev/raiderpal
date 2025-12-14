import Link from "next/link";
import type { ReactNode } from "react";

type PrimaryButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

/**
 * Standard CTA button used across pages and panels.
 * Keeps color, padding, and focus ring consistent.
 */
export function PrimaryButton({ href, children, className = "" }: PrimaryButtonProps) {
  return (
    <Link
      href={href}
      className={
        "inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-black/30 px-4 py-2.5 text-base font-medium text-[#4fc1e9] transition hover:border-[#4fc1e9] hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-[#4fc1e9] focus:ring-offset-2 focus:ring-offset-slate-950 " +
        className
      }
    >
      {children}
    </Link>
  );
}

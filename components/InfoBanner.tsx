import type { ReactNode } from "react";

type InfoBannerProps = {
  children: ReactNode;
  variant?: "info" | "warning";
  className?: string;
};

/**
 * Reusable inline banner for empty states or notices.
 * Variants keep color/contrast consistent across pages.
 */
export function InfoBanner({ children, variant = "info", className = "" }: InfoBannerProps) {
  const styles =
    variant === "warning"
      ? "border-amber-700/50 bg-amber-900/20 text-amber-100"
      : "border-slate-600/70 bg-slate-900/50 text-primary-invert";

  return (
    <div className={`rounded-lg border p-4 text-sm ${styles} ${className}`}>
      {children}
    </div>
  );
}

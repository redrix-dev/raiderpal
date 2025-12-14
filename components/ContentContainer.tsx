import type { ReactNode } from "react";

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Standard horizontal padding wrapper to keep pages aligned.
 */
export function ContentContainer({ children, className = "" }: ContentContainerProps) {
  return <div className={`section-pad ${className}`}>{children}</div>;
}

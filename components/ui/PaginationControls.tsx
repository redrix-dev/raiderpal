/**
 * @fileoverview Pagination controls for browsing lists
 *
 * Provides navigation buttons and page numbers for paginated content.
 */

"use client";

/**
 * Props for the PaginationControls component
 */
type PaginationControlsProps = {
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Handler for page changes */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show at once */
  visiblePageCount?: number;
};

/**
 * Pagination controls component
 *
 * Features:
 * - Previous/Next navigation
 * - Skip forward/backward by visiblePageCount pages
 * - Direct page number selection
 * - Window of visible page numbers
 *
 * @param props - Component props
 * @returns React component
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  visiblePageCount = 5,
}: PaginationControlsProps) {
  const pageWindowStart = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(visiblePageCount / 2),
      totalPages - visiblePageCount + 1
    )
  );
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + visiblePageCount - 1);
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, i) => pageWindowStart + i
  );

  return (
    <div className="flex flex-col gap-2 text-xs text-muted">
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <PageButton
          label="<<"
          onClick={() => onPageChange(Math.max(1, currentPage - visiblePageCount))}
          disabled={currentPage === 1}
        />
        <PageButton
          label="Prev"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />
        {pageNumbers.map((num) => (
          <PageButton
            key={num}
            label={String(num)}
            onClick={() => onPageChange(num)}
            active={num === currentPage}
          />
        ))}
        <PageButton
          label="Next"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
        <PageButton
          label=">>"
          onClick={() =>
            onPageChange(Math.min(totalPages, currentPage + visiblePageCount))
          }
          disabled={currentPage === totalPages}
        />
      </div>
    </div>
  );
}

function PageButton({
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-current={active ? "page" : undefined}
      className={`rounded-md border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel ${
        active
          ? "border-brand-cyan/70 bg-brand-cyan/10 text-brand-cyan"
          : "border-border-subtle bg-surface-panel text-primary hover:border-brand-cyan/60 hover:text-brand-cyan"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}


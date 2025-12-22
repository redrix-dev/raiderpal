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
    <div className="flex flex-col gap-2 text-sm text-muted pt-2">
      <div>
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - visiblePageCount))}
            disabled={currentPage === 1}
            className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-primary hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ‹‹
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-primary hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-primary hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
          <button
            type="button"
            onClick={() =>
              onPageChange(Math.min(totalPages, currentPage + visiblePageCount))
            }
            disabled={currentPage === totalPages}
            className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-primary hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ››
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {pageNumbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onPageChange(num)}
              className={`rounded-md border px-3 py-1 text-sm ${
                num === currentPage
                  ? "border-[#4fc1e9] bg-[#4fc1e9]/15 text-primary"
                  : "border-white/10 bg-black/20 text-primary hover:border-white/30"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

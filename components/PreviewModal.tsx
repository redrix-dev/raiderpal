/**
 * @fileoverview Item preview modal dialog
 *
 * Modal dialog that displays item details including crafting recipes
 * and recycling outputs with proper focus management and keyboard navigation.
 */

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { RarityBadge } from "@/components/ItemCard";
import type {
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
} from "@/lib/data/client";

/**
 * Extended item type for browse display
 */
export type BrowseItem = CanonicalItemSummary & { workbench?: string | null };

/**
 * Preview details shown in the modal
 */
type PreviewDetails = {
  /** Crafting components required to build the item */
  crafting: CraftingComponentRow[];
  /** Recycling outputs when breaking down the item */
  recycling: RecyclingOutputRow[];
};

/**
 * Props for the PreviewModal component
 */
type PreviewModalProps = {
  /** Item to display in the modal */
  item: BrowseItem;
  /** Preview details (crafting/recycling data) */
  details: PreviewDetails | null;
  /** Whether details are currently loading */
  loading: boolean;
  /** Handler for closing the modal */
  onClose: () => void;
  /** Dialog ID for aria-controls */
  dialogId: string;
  /** Ref to the element that opened the modal (for focus restoration) */
  lastFocusedRef: React.MutableRefObject<HTMLElement | null>;
};

/**
 * Item preview modal component
 *
 * Features:
 * - Proper focus management (traps focus, restores on close)
 * - Keyboard navigation (Escape to close, Tab trapping)
 * - ARIA attributes for accessibility
 * - Loading states
 *
 * @param props - Component props
 * @returns React component
 */
export function PreviewModal({
  item,
  details,
  loading,
  onClose,
  dialogId,
  lastFocusedRef,
}: PreviewModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus close button when modal opens
  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  // Restore focus when modal closes
  useEffect(() => {
    const elementToFocus = lastFocusedRef.current;
    return () => {
      if (elementToFocus) {
        elementToFocus.focus();
      }
    };
  }, [lastFocusedRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Tab") {
      const focusable = Array.from(
        (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
          'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-preview-title"
        id={dialogId}
        className="w-full max-w-md md:max-w-lg mx-0 md:mx-4 rounded-lg border border-slate-700 bg-slate-950 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.name ?? "Item icon"}
                width={40}
                height={40}
                sizes="40px"
                loading="lazy"
                className="h-10 w-10 rounded border border-slate-700 bg-slate-900 object-contain"
              />
            )}
            <div>
              <h3
                id="item-preview-title"
                className="text-base font-condensed font-semibold text-warm"
              >
                {item.name}
              </h3>
              <div className="text-xs text-warm-muted flex flex-wrap gap-2 items-center font-medium">
                <RarityBadge rarity={item.rarity} />
                {item.item_type && <span>{item.item_type}</span>}
                {item.loot_area && (
                  <span className="text-warm">Loot: {item.loot_area}</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs text-warm-muted hover:text-warm"
            aria-label="Close"
            ref={closeButtonRef}
          >
            Close
          </button>
        </div>

        {/* Value */}
        {item.value != null && (
          <div className="mb-3 text-sm text-warm">
            <span className="font-medium">Value:</span> {item.value}
          </div>
        )}

        {/* Details loading / content */}
        {loading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-32 rounded bg-white/10" />
            <div className="h-3 w-44 rounded bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
        )}

        {!loading && details && (
          <div className="space-y-3 text-sm">
            {/* Crafting */}
            <div>
              <h4 className="text-xs font-condensed font-semibold text-warm mb-1">
                Crafting Recipe
              </h4>
              {details.crafting.length === 0 ? (
                <div className="text-xs text-warm-muted font-medium">
                  No crafting recipe.
                </div>
              ) : (
                <ul className="space-y-1">
                  {details.crafting.map((c, idx) => {
                    const componentId = c.component_id ?? c.component?.id;
                    return (
                      <li
                        key={`${componentId ?? "component"}-${idx}`}
                        className="flex items-center justify-between text-xs text-warm font-medium"
                      >
                        <span>{c.component?.name ?? "Unknown component"}</span>
                        <span className="text-warm-muted">
                          ×{c.quantity ?? "-"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Recycles Into */}
            <div>
              <h4 className="text-xs font-condensed font-semibold text-warm mb-1">
                Recycles Into
              </h4>
              {details.recycling.length === 0 ? (
                <div className="text-xs text-warm-muted font-medium">
                  No recycling outputs.
                </div>
              ) : (
                <ul className="space-y-1">
                  {details.recycling.map((r, idx) => {
                    const componentId =
                      r.component_id ?? r.component?.id ?? `component-${idx}`;
                    return (
                      <li
                        key={`${componentId}-${idx}`}
                        className="flex items-center justify-between text-xs text-warm font-medium"
                      >
                        <span>{r.component?.name ?? "Unknown component"}</span>
                        <span className="text-warm-muted">×{r.quantity ?? "-"}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Full details link */}
        <div className="mt-4 flex justify-end gap-2">
          <a
            href={`/items/${item.id}`}
            className="inline-flex items-center rounded-md border border-[#4fc1e9]/70 bg-[#4fc1e9]/10 px-3 py-1.5 text-xs text-[#4fc1e9] hover:bg-[#4fc1e9]/15"
          >
            View full details
          </a>
        </div>
      </div>
    </div>
  );
}

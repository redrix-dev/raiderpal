/** app/components/ItemsBrowseClient.tsx
 * @fileoverview Client component for browsing and searching items
 *
 * Interactive item browser with search, filtering, pagination, and preview modals.
 * Displays item cards in a grid with rarity filtering and text search capabilities.
 * Includes modal dialogs showing crafting recipes and recycling outputs.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ItemCard } from "@/components/ItemCard";
import { SearchControls, type RarityFilter } from "@/components/SearchControls";
import { PaginationControls } from "@/components/PaginationControls";
import { PreviewModal, type BrowseItem } from "@/components/PreviewModal";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useRaidReminders } from "@/hooks/useRaidReminders";
import { useAppVersion } from "@/hooks/useAppVersion";
import {
  craftingDataSchema,
  craftingResponseSchema,
  recyclingDataSchema,
  recyclingResponseSchema,
} from "@/lib/apiSchemas";
import { CACHE } from "@/lib/constants";
import type {
  CraftingComponentRow,
  RecyclingOutputRow,
} from "@/lib/data/client";

/**
 * Props for the ItemsBrowseClient component
 */
type ItemsBrowseClientProps = {
  /** Initial items to display before any filtering */
  initialItems: BrowseItem[];
  /** Data version for cache invalidation */
  dataVersion?: number | string | null;
};

/**
 * Preview details shown in the modal dialog
 */
type PreviewDetails = {
  /** Crafting components required to build the item */
  crafting: CraftingComponentRow[];
  /** Recycling outputs when breaking down the item */
  recycling: RecyclingOutputRow[];
};

const rarityOrder = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

/**
 * Client component for interactive item browsing
 *
 * Features:
 * - Text search across item names, types, and loot areas
 * - Rarity-based filtering
 * - Paginated grid display
 * - Modal previews with crafting/recycling details
 * - Raid reminder integration
 *
 * @param props - Component props
 * @returns React component
 */
export function ItemsBrowseClient({
  initialItems,
  dataVersion,
}: ItemsBrowseClientProps) {
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;
  const dialogId = "item-preview-dialog";
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const { add, isAdded } = useRaidReminders();

  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const visiblePageCount = 5;

  /**
   * Available rarity options derived from initial items
   */
  const rarityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of initialItems) {
      if (item.rarity) set.add(item.rarity);
    }
    const values = Array.from(set);
    values.sort(
      (a, b) =>
        (rarityOrder.indexOf(a) === -1 ? 999 : rarityOrder.indexOf(a)) -
        (rarityOrder.indexOf(b) === -1 ? 999 : rarityOrder.indexOf(b))
    );
    return values;
  }, [initialItems]);

  /**
   * Items filtered by search query and rarity
   */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return initialItems.filter((item) => {
      if (rarity !== "all" && item.rarity !== rarity) return false;
      if (!q) return true;

      const name = item.name?.toLowerCase() ?? "";
      const type = item.item_type?.toLowerCase() ?? "";
      const loot = item.loot_area?.toLowerCase() ?? "";

      return name.includes(q) || type.includes(q) || loot.includes(q);
    });
  }, [initialItems, search, rarity]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, rarity, initialItems]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  /**
   * Fetches crafting data for the selected item
   */
  const {
    data: craftingData,
    loading: craftingLoading,
  } = useCachedJson<CraftingComponentRow[]>(
    selectedItem ? `/api/items/${selectedItem.id}/crafting` : null,
    {
      version: cacheVersion,
      enabled: Boolean(selectedItem),
      ttlMs: CACHE.MODAL_TTL_MS,
      responseSchema: craftingResponseSchema,
      dataSchema: craftingDataSchema,
    }
  );

  /**
   * Fetches recycling data for the selected item
   */
  const {
    data: recyclingData,
    loading: recyclingLoading,
  } = useCachedJson<RecyclingOutputRow[]>(
    selectedItem ? `/api/items/${selectedItem.id}/recycling` : null,
    {
      version: cacheVersion,
      enabled: Boolean(selectedItem),
      ttlMs: CACHE.MODAL_TTL_MS,
      responseSchema: recyclingResponseSchema,
      dataSchema: recyclingDataSchema,
    }
  );

  /**
   * Combined preview details for the modal
   */
  const details = useMemo<PreviewDetails | null>(() => {
    if (!selectedItem) return null;
    return {
      crafting: craftingData ?? [],
      recycling: recyclingData ?? [],
    };
  }, [selectedItem, craftingData, recyclingData]);

  const loadingDetails = craftingLoading || recyclingLoading;

  /**
   * Opens the item preview modal
   * @param item - Item to preview
   */
  function handleOpenPreview(item: BrowseItem) {
    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
    setSelectedItem(item);
  }

  /**
   * Closes the item preview modal
   */
  function handleClosePreview() {
    setSelectedItem(null);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <SearchControls
        search={search}
        onSearchChange={setSearch}
        rarity={rarity}
        onRarityChange={setRarity}
        rarityOptions={rarityOptions}
      />

      {/* Results summary */}
      <div className="text-xs text-muted">
        Showing {filtered.length} of {initialItems.length} items
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-sm text-muted">
          No items match your filters.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 min-w-0">
          {paged.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => handleOpenPreview(item)}
              ariaControls={dialogId}
              action={
                <AddReminderButton
                  item={item}
                  isAdded={isAdded(item.id)}
                  onAdd={() =>
                    add({
                      id: item.id,
                      name: item.name ?? "Unknown item",
                      icon: item.icon,
                      rarity: item.rarity,
                      lootLocation: item.loot_area,
                    })
                  }
                />
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > pageSize && (
        <PaginationControls
          currentPage={page}
          totalPages={pageCount}
          onPageChange={setPage}
          visiblePageCount={visiblePageCount}
        />
      )}

      {/* Preview modal */}
      {selectedItem && (
        <PreviewModal
          item={selectedItem}
          details={details}
          loading={loadingDetails}
          onClose={handleClosePreview}
          dialogId={dialogId}
          lastFocusedRef={lastFocusedRef}
        />
      )}
    </div>
  );
}

function AddReminderButton({
  item,
  isAdded,
  onAdd,
}: {
  item: BrowseItem;
  isAdded: boolean;
  onAdd: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="rounded-md border border-border-strong bg-surface-panel px-2 py-1 text-[11px] font-medium text-muted opacity-50"
      >
        ...
      </button>
    );
  }

  if (isAdded) {
    return (
      <span className="text-[11px] font-semibold text-emerald-300">(added)</span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="rounded-md border border-brand-cyan/40 bg-brand-cyan/10 px-2 py-1 text-[11px] font-medium text-brand-cyan hover:bg-brand-cyan/15"
    >
      Add to Raid Reminders
    </button>
  );
}

// components/ItemsBrowseClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ItemCard, RarityBadge } from "@/components/ItemCard";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useRaidReminders } from "@/hooks/useRaidReminders";


export type BrowseItem = {
  id: string;
  name: string | null;
  icon?: string | null;
  rarity?: string | null;
  value?: number | null;
  item_type?: string | null;
  loot_area?: string | null;
  workbench?: string | null;
};

type ItemsBrowseClientProps = {
  initialItems: BrowseItem[];
  dataVersion?: number | string | null;
};

type PreviewDetails = {
  crafting: any[];
  recycling: any[];
};

const rarityOrder = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

export function ItemsBrowseClient({
  initialItems,
  dataVersion,
}: ItemsBrowseClientProps) {
  const dialogId = "item-preview-dialog";
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | "all">("all");
  const { add, isAdded } = useRaidReminders();

  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const visiblePageCount = 5;

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
  const pageWindowStart = Math.max(
    1,
    Math.min(page - Math.floor(visiblePageCount / 2), pageCount - visiblePageCount + 1)
  );
  const pageWindowEnd = Math.min(pageCount, pageWindowStart + visiblePageCount - 1);
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, i) => pageWindowStart + i
  );

  const {
    data: craftingData,
    loading: craftingLoading,
  } = useCachedJson<any[]>(
    selectedItem ? `/items/${selectedItem.id}/crafting` : null,
    { version: dataVersion ?? undefined, enabled: Boolean(selectedItem) }
  );

  const {
    data: recyclingData,
    loading: recyclingLoading,
  } = useCachedJson<any[]>(
    selectedItem ? `/items/${selectedItem.id}/recycling` : null,
    { version: dataVersion ?? undefined, enabled: Boolean(selectedItem) }
  );

  const details = useMemo<PreviewDetails | null>(() => {
    if (!selectedItem) return null;
    return {
      crafting: craftingData ?? [],
      recycling: recyclingData ?? [],
    };
  }, [selectedItem, craftingData, recyclingData]);

  const loadingDetails = craftingLoading || recyclingLoading;

  function handleOpenPreview(item: BrowseItem) {
    setSelectedItem(item);
  }

  function handleClosePreview() {
    setSelectedItem(null);
  }

  // Focus management: focus close button when dialog opens
  useEffect(() => {
    if (selectedItem && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedItem]);

  // Focus management for modal: focus close button when opened
  useEffect(() => {
    if (selectedItem && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedItem]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-warm-muted mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, type, or loot area"
            className="w-full rounded-md border border-[#4fc1e9]/60 bg-panel-texture px-3 py-2 text-base sm:text-sm text-warm placeholder:text-warm-muted focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
          />
        </div>

        <div className="w-full md:w-52">
          <label className="block text-xs font-medium text-warm-muted mb-1">
            Rarity
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as any)}
            className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base sm:text-sm text-warm focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
          >
            <option value="all">All rarities</option>
            {rarityOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="text-xs text-warm-muted">
        Showing {filtered.length} of {initialItems.length} items
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-sm text-warm-muted">
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
        <div className="flex flex-col gap-2 text-sm text-warm-muted pt-2">
          <div>Page {page} of {pageCount}</div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - visiblePageCount))}
                disabled={page === 1}
                className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-warm hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹‹
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-warm hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={page === pageCount}
                className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-warm hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + visiblePageCount))}
                disabled={page === pageCount}
                className="rounded-md border border-white/10 bg-black/30 px-3 py-1 text-sm text-warm hover:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ››
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  className={`rounded-md border px-3 py-1 text-sm ${
                    num === page
                      ? "border-[#4fc1e9] bg-[#4fc1e9]/15 text-warm"
                      : "border-white/10 bg-black/20 text-warm hover:border-white/30"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          onClick={handleClosePreview}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="item-preview-title"
            id={dialogId}
            className="w-full max-w-md md:max-w-lg mx-0 md:mx-4 rounded-lg border border-slate-700 bg-slate-950 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                handleClosePreview();
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
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                {selectedItem.icon && (
                  <img
                    src={selectedItem.icon}
                    alt={selectedItem.name ?? "Item icon"}
                    className="h-10 w-10 rounded border border-slate-700 bg-slate-900 object-contain"
                  />
                )}
                <div>
                  <h3
                    id="item-preview-title"
                    className="text-base font-condensed font-semibold text-warm"
                  >
                    {selectedItem.name}
                  </h3>
                  <div className="text-xs text-warm-muted flex flex-wrap gap-2 items-center font-medium">
                    <RarityBadge rarity={selectedItem.rarity} />
                    {selectedItem.item_type && <span>{selectedItem.item_type}</span>}
                    {selectedItem.loot_area && (
                      <span className="text-warm">Loot: {selectedItem.loot_area}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                className="text-xs text-warm-muted hover:text-warm"
                aria-label="Close"
                ref={closeButtonRef}
              >
                Close
              </button>
            </div>

            {/* Value */}
            {selectedItem.value != null && (
              <div className="mb-3 text-sm text-warm">
                <span className="font-medium">Value:</span>{" "}
                {selectedItem.value}
              </div>
            )}

            {/* Details loading / content */}
            {loadingDetails && (
              <div className="text-xs text-warm-muted">Loading details…</div>
            )}

            {!loadingDetails && details && (
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
                      {details.crafting.map((c: any, idx: number) => (
                        <li
                          key={`${c.component_id}-${idx}`}
                          className="flex items-center justify-between text-xs text-warm font-medium"
                        >
                          <span>{c.component_name}</span>
                          <span className="text-warm-muted">
                            ×{c.quantity}
                          </span>
                        </li>
                      ))}
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
                      {details.recycling.map((r: any, idx: number) => (
                        <li
                          key={`${r.component_id}-${idx}`}
                          className="flex items-center justify-between text-xs text-warm font-medium"
                        >
                          <span>{r.component_name}</span>
                          <span className="text-warm-muted">
                            ×{r.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Full details link */}
            <div className="mt-4 flex justify-end gap-2">
              <a
                href={`/items/${selectedItem.id}`}
                className="inline-flex items-center rounded-md border border-[#4fc1e9]/70 bg-[#4fc1e9]/10 px-3 py-1.5 text-xs text-[#4fc1e9] hover:bg-[#4fc1e9]/15"
              >
                View full details
              </a>
            </div>
          </div>
        </div>
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
      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-warm hover:border-[#4fc1e9] hover:text-[#4fc1e9]"
    >
      Add to Raid Reminders
    </button>
  );
}



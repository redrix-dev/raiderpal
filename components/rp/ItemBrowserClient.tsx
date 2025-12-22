"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Panel } from "@/components/ui/Panel";
import { RarityBadge } from "@/components/RarityBadge";
import { ItemDetailsModal } from "@/components/rp/ItemDetailsModal";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useRaidReminders } from "@/hooks/useRaidReminders";
import { useAppVersion } from "@/hooks/useAppVersion";
import {
  craftingDataSchema,
  craftingResponseSchema,
  recyclingDataSchema,
  recyclingResponseSchema,
  sourcesDataSchema,
  sourcesResponseSchema,
  usedInDataSchema,
  usedInResponseSchema,
} from "@/lib/apiSchemas";
import { CACHE } from "@/lib/constants";
import type {
  CanonicalItemSummary,
  CraftingComponentRow,
  RecyclingOutputRow,
  RecyclingSourceRow,
  UsedInRow,
} from "@/lib/data/client";

type BrowseItem = CanonicalItemSummary & { workbench?: string | null };

type ItemBrowserClientProps = {
  initialItems: BrowseItem[];
  dataVersion?: number | string | null;
};

type PreviewDetails = {
  crafting: CraftingComponentRow[];
  recycling: RecyclingOutputRow[];
  sources: RecyclingSourceRow[];
  usedIn: UsedInRow[];
};

type RarityFilter = "all" | string;

const rarityOrder = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

const rarityBackgrounds: Record<string, string> = {
  Legendary: "bg-rarity-legendary/40 hover:bg-rarity-legendary/80",
  Epic: "bg-rarity-epic/40 hover:bg-rarity-epic/80",
  Rare: "bg-rarity-rare/40 hover:bg-rarity-rare/80",
  Uncommon: "bg-rarity-uncommon/40 hover:bg-rarity-uncommon/80",
  Common: "bg-rarity-common/40 hover:bg-rarity-common/80",
};

const defaultBackground = "bg-surface-card/80 hover:bg-surface-panel";

function getRarityBackground(rarity?: string | null) {
  if (!rarity) return defaultBackground;
  return rarityBackgrounds[rarity] ?? defaultBackground;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ItemBrowserClient({
  initialItems,
  dataVersion,
}: ItemBrowserClientProps) {
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;
  const dialogId = "item-browser-preview";
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<RarityFilter>("all");
  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const { add, isAdded } = useRaidReminders();
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

  useEffect(() => {
    setPage(1);
  }, [search, rarity, initialItems]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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

  const {
    data: sourcesData,
    loading: sourcesLoading,
  } = useCachedJson<RecyclingSourceRow[]>(
    selectedItem ? `/api/items/${selectedItem.id}/sources` : null,
    {
      version: cacheVersion,
      enabled: Boolean(selectedItem),
      ttlMs: CACHE.MODAL_TTL_MS,
      responseSchema: sourcesResponseSchema,
      dataSchema: sourcesDataSchema,
    }
  );

  const {
    data: usedInData,
    loading: usedInLoading,
  } = useCachedJson<UsedInRow[]>(
    selectedItem ? `/api/items/${selectedItem.id}/used-in` : null,
    {
      version: cacheVersion,
      enabled: Boolean(selectedItem),
      ttlMs: CACHE.MODAL_TTL_MS,
      responseSchema: usedInResponseSchema,
      dataSchema: usedInDataSchema,
    }
  );

  const details = useMemo<PreviewDetails | null>(() => {
    if (!selectedItem) return null;
    return {
      crafting: craftingData ?? [],
      recycling: recyclingData ?? [],
      sources: sourcesData ?? [],
      usedIn: usedInData ?? [],
    };
  }, [selectedItem, craftingData, recyclingData, sourcesData, usedInData]);

  const loadingDetails = {
    crafting: craftingLoading,
    recycling: recyclingLoading,
    sources: sourcesLoading,
    usedIn: usedInLoading,
  };

  function handleOpenPreview(item: BrowseItem) {
    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }
    setSelectedItem(item);
  }

  function handleClosePreview() {
    setSelectedItem(null);
  }

  function handleClearFilters() {
    setSearch("");
    setRarity("all");
  }

  return (
    <div className="space-y-6">
      <Panel variant="light" padding="roomy">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-muted mb-1">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, type, or loot area"
                className="w-full rounded-md border border-border-strong bg-surface-panel px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan/60"
              />
            </div>

            <div className="w-full lg:w-56">
              <label className="block text-xs font-medium text-muted mb-1">
                Rarity
              </label>
              <select
                value={rarity}
                onChange={(e) => setRarity(e.target.value as RarityFilter)}
                className="w-full rounded-md border border-border-strong bg-surface-panel px-3 py-2 text-sm text-primary focus:outline-none focus:ring-1 focus:ring-brand-cyan hover:border-brand-cyan/60"
              >
                <option value="all">All rarities</option>
                {rarityOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="cta"
                onClick={handleClearFilters}
                className="h-10 px-4 py-2 text-sm bg-surface-panel text-primary border-border-strong hover:border-brand-cyan/60 hover:text-brand-cyan focus-visible:ring-offset-surface-panel"
              >
                Clear filters
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-3 text-xs text-muted">
            <div>
              Showing {filtered.length} of {initialItems.length} items
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span>Rarity:</span>
              <span className="text-primary">
                {rarity === "all" ? "All" : rarity}
              </span>
              <span>Page:</span>
              <span className="text-primary">
                {page} of {pageCount}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-sm font-medium text-primary">No results</div>
          <p className="mt-1 text-xs text-muted">
            Try clearing filters or search for a different term.
          </p>
          <div className="mt-3">
            <Button
              type="button"
              variant="cta"
              onClick={handleClearFilters}
              className="px-3 py-1.5 text-xs bg-brand-cyan/10 border-brand-cyan/60 text-brand-cyan hover:bg-brand-cyan/15 focus-visible:ring-offset-surface-card"
            >
              Clear filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 min-w-0">
          {paged.map((item) => (
            <ItemResultCard
              key={item.id}
              item={item}
              dialogId={dialogId}
              onOpen={() => handleOpenPreview(item)}
              action={
                <ReminderAction
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

      {pageCount > 1 && (
        <Panel variant="light" padding="base">
          <PaginationControls
            currentPage={page}
            totalPages={pageCount}
            visiblePageCount={visiblePageCount}
            onPageChange={setPage}
          />
        </Panel>
      )}

      {selectedItem && (
        <ItemDetailsModal
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

function ItemResultCard({
  item,
  onOpen,
  action,
  dialogId,
}: {
  item: BrowseItem;
  onOpen: () => void;
  action?: React.ReactNode;
  dialogId: string;
}) {
  return (
    <Card
      variant="neutral"
      role="button"
      tabIndex={0}
      aria-controls={dialogId}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group transition-colors cursor-pointer min-w-0 !p-1",
        "hover:border-brand-cyan/60 focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand-cyan focus-visible:ring-offset-2",
        "focus-visible:ring-offset-surface-panel",
        getRarityBackground(item.rarity)
      )}
    >
      <Panel variant="light" padding="none" className="flex items-start gap-3 p-3">
        <div className="h-10 w-10 flex-shrink-0 rounded-md border border-border-subtle bg-surface-panel p-1">
          {item.icon ? (
            <Image
              src={item.icon}
              alt={item.name ?? "Item icon"}
              width={36}
              height={36}
              sizes="36px"
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full rounded bg-surface-panel" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-condensed font-semibold text-primary">
              {item.name ?? "Unknown item"}
            </span>
          <RarityBadge rarity={item.rarity} />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
            {item.item_type && <span>{item.item_type}</span>}
            {item.loot_area && <span>Loot: {item.loot_area}</span>}
            {item.workbench && <span>WB: {item.workbench}</span>}
          </div>
        </div>

        {(item.value != null || action) && (
          <div className="ml-2 flex flex-col items-end gap-2 text-right text-xs text-primary">
            {item.value != null && (
              <div>
                <div className="font-semibold">{item.value}</div>
                <div className="text-[10px] text-muted">value</div>
              </div>
            )}
            {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          </div>
        )}
      </Panel>
    </Card>
  );
}

function ReminderAction({
  isAdded,
  onAdd,
}: {
  isAdded: boolean;
  onAdd: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="cta"
        disabled
        className="px-2 py-1 text-[11px] bg-surface-panel text-muted border-border-strong opacity-60 cursor-not-allowed focus-visible:ring-offset-surface-panel"
      >
        ...
      </Button>
    );
  }

  if (isAdded) {
    return (
      <span className="text-[11px] font-semibold text-brand-cyan">
        Added
      </span>
    );
  }

  return (
    <Button
      type="button"
      variant="cta"
      onClick={(e) => {
        e.stopPropagation();
        onAdd();
      }}
      className="px-2 py-1 text-[11px] border-brand-cyan/60 text-primaryfocus-visible:ring-offset-surface-panel"
    >
      Add reminder
    </Button>
  );
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  visiblePageCount = 5,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  visiblePageCount?: number;
}) {
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
      className={cn(
        "rounded-md border px-3 py-1 text-xs font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan",
        "focus-visible:ring-offset-2 focus-visible:ring-offset-surface-panel",
        active
          ? "border-brand-cyan/70 bg-brand-cyan/10 text-brand-cyan"
          : "border-border-subtle bg-surface-panel text-primary hover:border-brand-cyan/60 hover:text-brand-cyan",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </button>
  );
}

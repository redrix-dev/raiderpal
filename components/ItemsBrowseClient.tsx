// components/ItemsBrowseClient.tsx
"use client";

import { useMemo, useState } from "react";
import { ItemCard, RarityBadge } from "@/components/ItemCard";
import { cachedFetchJson } from "@/lib/clientCache";
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
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | "all">("all");
  const { add, isAdded } = useRaidReminders();

  const [selectedItem, setSelectedItem] = useState<BrowseItem | null>(null);
  const [details, setDetails] = useState<PreviewDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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

  async function handleOpenPreview(item: BrowseItem) {
    setSelectedItem(item);
    setLoadingDetails(true);
    setDetails(null);

    try {
      const [craftRes, recRes] = await Promise.all([
        cachedFetchJson<any[]>(`/items/${item.id}/crafting`, {
          version: dataVersion ?? undefined,
        }),
        cachedFetchJson<any[]>(`/items/${item.id}/recycling`, {
          version: dataVersion ?? undefined,
        }),
      ]);

      setDetails({
        crafting: craftRes ?? [],
        recycling: recRes ?? [],
      });
    } catch {
      setDetails({ crafting: [], recycling: [] });
    } finally {
      setLoadingDetails(false);
    }
  }

  function handleClosePreview() {
    setSelectedItem(null);
    setDetails(null);
    setLoadingDetails(false);
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, type, or loot area…"
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-base sm:text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="w-full md:w-52">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Rarity
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as any)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-base sm:text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
      <div className="text-xs text-gray-500">
        Showing {filtered.length} of {initialItems.length} items
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-sm text-gray-400">
          No items match your filters.
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 min-w-0">
          {filtered.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => handleOpenPreview(item)}
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

      {/* Preview modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
          onClick={handleClosePreview}
        >
          <div
            className="w-full max-w-md md:max-w-lg mx-0 md:mx-4 rounded-lg border border-slate-700 bg-slate-950 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
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
                  <h3 className="text-base font-semibold text-gray-50">
                    {selectedItem.name}
                  </h3>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2 items-center">
                    <RarityBadge rarity={selectedItem.rarity} />
                    {selectedItem.item_type && <span>{selectedItem.item_type}</span>}
                    {selectedItem.loot_area && (
                      <span className="text-gray-300">Loot: {selectedItem.loot_area}</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClosePreview}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Value */}
            {selectedItem.value != null && (
              <div className="mb-3 text-sm text-gray-300">
                <span className="font-medium">Value:</span>{" "}
                {selectedItem.value}
              </div>
            )}

            {/* Details loading / content */}
            {loadingDetails && (
              <div className="text-xs text-gray-400">Loading details…</div>
            )}

            {!loadingDetails && details && (
              <div className="space-y-3 text-sm">
                {/* Crafting */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 mb-1">
                    Crafting Recipe
                  </h4>
                  {details.crafting.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      No crafting recipe.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {details.crafting.map((c: any, idx: number) => (
                        <li
                          key={`${c.component_id}-${idx}`}
                          className="flex items-center justify-between text-xs text-gray-200"
                        >
                          <span>{c.component_name}</span>
                          <span className="text-gray-400">
                            ×{c.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recycles Into */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-300 mb-1">
                    Recycles Into
                  </h4>
                  {details.recycling.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      No recycling outputs.
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {details.recycling.map((r: any, idx: number) => (
                        <li
                          key={`${r.component_id}-${idx}`}
                          className="flex items-center justify-between text-xs text-gray-200"
                        >
                          <span>{r.component_name}</span>
                          <span className="text-gray-400">
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
                className="inline-flex items-center rounded-md border border-sky-600/70 bg-sky-950/40 px-3 py-1.5 text-xs text-sky-100 hover:bg-sky-900/60"
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
      className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-100 hover:border-sky-500 hover:text-sky-100"
    >
      Add to Raid Reminders
    </button>
  );
}

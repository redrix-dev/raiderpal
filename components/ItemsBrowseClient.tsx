// components/ItemsBrowseClient.tsx
"use client";

import { useMemo, useState } from "react";
import { ItemCard } from "@/components/ItemCard";

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
};

const rarityOrder = ["Legendary", "Epic", "Rare", "Uncommon", "Common"];

export function ItemsBrowseClient({ initialItems }: ItemsBrowseClientProps) {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState<string | "all">("all");

  // Build rarity options from data
  const rarityOptions = useMemo(() => {
    const set = new Set<string>();
    for (const item of initialItems) {
      if (item.rarity) set.add(item.rarity);
    }
    const values = Array.from(set);
    values.sort(
      (a, b) =>
        (rarityOrder.indexOf(a) === -1
          ? 999
          : rarityOrder.indexOf(a)) -
        (rarityOrder.indexOf(b) === -1
          ? 999
          : rarityOrder.indexOf(b))
    );
    return values;
  }, [initialItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return initialItems.filter((item) => {
      // rarity filter
      if (rarity !== "all" && item.rarity !== rarity) {
        return false;
      }

      if (!q) return true;

      const name = item.name?.toLowerCase() ?? "";
      const type = item.item_type?.toLowerCase() ?? "";
      const loot = item.loot_area?.toLowerCase() ?? "";

      return (
        name.includes(q) ||
        type.includes(q) ||
        loot.includes(q)
      );
    });
  }, [initialItems, search, rarity]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {/* Search */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, type, or loot area…"
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Rarity filter */}
        <div className="w-full md:w-52">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Rarity
          </label>
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as any)}
            className="w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
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

      {/* Grid of items */}
      {filtered.length === 0 ? (
        <div className="text-sm text-gray-400">
          No items match your filters.
        </div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  recommendAction,
  type ComponentCost,
  type ItemEconomy,
} from "@/lib/repairCalculator";
import type { RepairEconomyRow } from "@/data/repairEconomy";
import { cachedFetchJson } from "@/lib/clientCache";
import { RarityBadge } from "./ItemCard";
import { ModulePanel } from "./ModulePanel";

type Props = {
  items: RepairEconomyRow[];
  dataVersion?: string | number | null;
};

type CostRow = {
  id: string;
  name?: string | null;
  quantity: number;
  rarity?: string | null;
  icon?: string | null;
  isCredit?: boolean;
};

export function RepairCalculatorClient({
  items: initialItems,
  dataVersion,
}: Props) {
  const [items, setItems] = useState(initialItems);

  // Keep local state in sync with server-side props
  useEffect(() => setItems(initialItems), [initialItems]);

  // Refresh client-side when the data version changes
  useEffect(() => {
    let active = true;
    cachedFetchJson<RepairEconomyRow[]>("/repair-economy", {
      version: dataVersion ?? undefined,
    })
      .then((data) => {
        if (!active || !data) return;
        setItems(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [dataVersion]);

  const eligibleItems = useMemo(
    () =>
      items
        .filter(
          (i) =>
            (i.cheap_repair_cost?.length ?? 0) > 0 ||
            (i.expensive_repair_cost?.length ?? 0) > 0
        )
        .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "")),
    [items]
  );

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    eligibleItems.length ? eligibleItems[0].id : null
  );

  // Keep selectedId valid as eligibleItems list changes
  useEffect(() => {
    setSelectedId((prev) => {
      if (eligibleItems.length === 0) return null;
      if (!prev || !eligibleItems.some((item) => item.id === prev)) {
        return eligibleItems[0].id;
      }
      return prev;
    });
  }, [eligibleItems]);

  const selected = useMemo(
    () => eligibleItems.find((i) => i.id === selectedId) ?? null,
    [eligibleItems, selectedId]
  );

  const [durability, setDurability] = useState<number>(
    selected?.max_durability ?? 0
  );

  // Reset durability when selected item changes
  useEffect(() => {
    setDurability(selected?.max_durability ?? 0);
  }, [selected?.max_durability]);

  const filteredItems = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return eligibleItems;
    return eligibleItems.filter((item) =>
      (item.name ?? "").toLowerCase().includes(q)
    );
  }, [eligibleItems, pickerQuery]);

  const result = useMemo(() => {
    if (!selected) return null;
    return recommendAction(selected as ItemEconomy, durability);
  }, [selected, durability]);

  const repairCosts = useCostList(
    result?.repairCost,
    [
      ...(result?.repairBand === "cheap"
        ? selected?.cheap_repair_cost ?? []
        : selected?.expensive_repair_cost ?? []),
      ...(selected?.craft_components ?? []),
      ...(selected?.recycle_outputs ?? []),
    ],
    items
  );

  const craftCosts = useCostList(
    result?.trueCraftCost,
    [
      ...(selected?.craft_components ?? []),
      ...(selected?.recycle_outputs ?? []),
    ],
    items
  );

  return (
    <ModulePanel title="Repair or Replace Calculator">
      <div className="space-y-4">
        <p className="text-base text-warm">
          Compare repair cost vs craft cost (minus recycle outputs) to choose
          the better move.
        </p>

        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* LEFT: controls */}
          <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-6 h-full flex flex-col overflow-visible">
            <div className="space-y-3">
              <label className="text-base text-warm font-semibold">
                Select item
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((open) => !open)}
                  className="w-full h-11 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-base text-warm flex items-center justify-between transition hover:border-[#4fc1e9] focus:outline-none focus:ring-2 focus:ring-[#4fc1e9] focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  <span className="flex items-center gap-3 truncate">
                    {selected?.icon ? (
                      <img
                        src={selected.icon}
                        alt={selected.name ?? "Selected item"}
                        className="h-8 w-8 rounded border border-slate-800 bg-slate-950 object-contain"
                      />
                    ) : null}
                    <span className="truncate">
                      {selected?.name ?? "Select an item..."}
                    </span>
                  </span>
                  <span className="ml-2 text-xs text-warm-muted">
                    {pickerOpen ? "▲" : "▼"}
                  </span>
                </button>

                {pickerOpen && (
                  <div className="absolute z-40 left-0 top-full mt-2 w-full md:w-[420px] rounded-lg border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur text-sm max-h-[70vh] overflow-auto">
                    <div className="border-b border-slate-800 px-3 py-2 bg-slate-900/80 rounded-t-lg">
                      <input
                        type="text"
                        placeholder="Filter items..."
                        value={pickerQuery}
                        onChange={(e) => setPickerQuery(e.target.value)}
                        className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-warm placeholder:text-warm-muted focus:outline-none focus:ring-2 focus:ring-[#4fc1e9]"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {filteredItems.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-warm-muted">
                          No items found.
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-800">
                          {filteredItems.map((item) => (
                            <li key={item.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(item.id);
                                  setPickerOpen(false);
                                  setPickerQuery("");
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-900"
                              >
                                {item.icon ? (
                                  <img
                                    src={item.icon}
                                    alt={item.name ?? "Item icon"}
                                    className="h-10 w-10 rounded border border-slate-800 bg-slate-950 object-contain"
                                  />
                                ) : null}
                                <div className="min-w-0">
                                  <div className="truncate text-sm text-warm">
                                    {item.name}
                                  </div>
                                  <div className="text-[11px] text-warm-muted">
                                    Max durability: {item.max_durability ?? 0}
                                  </div>
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-base text-warm font-semibold flex items-center justify-between">
                <span>Current durability</span>
                <span className="text-xs text-warm-muted">{durability}</span>
              </label>
              <input
                type="range"
                min={0}
                max={selected?.max_durability ?? 0}
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="w-full accent-[#4fc1e9]"
              />
              <div className="text-xs text-warm-muted">
                Max durability: {selected?.max_durability ?? 0}
              </div>
            </div>

            {selected && result && (
              <div className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-2">
                <div className="text-sm text-warm font-semibold">
                  Recommended:{" "}
                  {result.recommendedAction === "REPAIR"
                    ? "Repair it"
                    : "Replace it"}
                </div>
                {result.repairBand && (
                  <div className="text-xs text-warm-muted font-medium">
                    Repair band: {result.repairBand}
                  </div>
                )}
                <span
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-sm font-semibold ${
                    result.recommendedAction === "REPAIR"
                      ? "bg-emerald-900/30 text-emerald-200 border border-emerald-700/50"
                      : "bg-amber-900/30 text-amber-100 border border-amber-700/50"
                  }`}
                >
                  {result.recommendedAction === "REPAIR"
                    ? "Repair"
                    : "Replace"}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: breakdown */}
          <div className="rounded-lg border border-white/5 bg-black/20 p-5 space-y-4 overflow-visible">
            {selected && (
              <div className="rounded-lg border border-white/5 bg-black/25 p-4 space-y-2">
                <div className="flex items-start gap-3">
                  {selected.icon ? (
                    <img
                      src={selected.icon}
                      alt={selected.name ?? "Selected item"}
                      className="h-12 w-12 rounded border border-white/10 bg-black/60 object-contain"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <div className="text-lg font-condensed font-semibold text-warm truncate">
                      {selected.name}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted font-medium">
                      {selected.rarity ? (
                        <RarityBadge rarity={selected.rarity} />
                      ) : null}
                      {selected.item_type ? (
                        <span className="inline-flex items-center rounded border border-white/10 bg-black/40 px-2 py-0.5">
                          {selected.item_type}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-warm-muted">
                      Max durability: {selected.max_durability ?? "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <CostCard title="Repair cost" items={repairCosts} />
              <CostCard
                title="True craft cost (craft - recycle)"
                items={craftCosts}
              />
            </div>
          </div>
        </div>

        {!selected || !result ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
            Could not compute yet. Choose an item with repair and craft data.
          </div>
        ) : null}
      </div>
    </ModulePanel>
  );
}

function useCostList(
  costMap: Record<string, number> | null | undefined,
  metaSources: ComponentCost[] | null | undefined,
  items: RepairEconomyRow[]
) {
  return useMemo<CostRow[]>(() => {
    if (!costMap) return [];

    const normalize = (id: string | null | undefined) =>
      (id ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

    const metaById = new Map<string, ComponentCost>();
    (metaSources ?? []).forEach((c) => {
      if (c.component_item_id) {
        metaById.set(normalize(c.component_item_id), c);
      }
    });

    const itemById = new Map<string, RepairEconomyRow>(
      items.map((i) => [normalize(i.id), i])
    );

    return Object.entries(costMap)
      .flatMap<CostRow | null>(([componentId, quantity]) => {
        const key = normalize(componentId);
        const meta = metaById.get(key);
        const fallback = itemById.get(key);

        const rawType = (meta?.item_type ?? fallback?.item_type ?? "").toLowerCase();
        const name = meta?.name ?? fallback?.name ?? componentId;
        const nameLower = name.toLowerCase();

        // Extra safety: hide any lingering blueprints if they ever slip in.
        if (rawType.includes("blueprint") || nameLower.includes("blueprint")) {
          return null;
        }

        return {
          id: componentId,
          quantity,
          name,
          rarity: meta?.rarity ?? fallback?.rarity,
          icon: meta?.icon ?? fallback?.icon,
          isCredit:
            (meta?.item_type ?? fallback?.item_type)?.toLowerCase() ===
              "credit" || componentId === "CREDIT",
        };
      })
      .filter((row): row is CostRow => row !== null)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [costMap, metaSources, items]);
}

function CostCard({ title, items }: { title: string; items: CostRow[] }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/25 p-4 space-y-3">
      <div className="text-base font-semibold text-warm">{title}</div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-sm text-warm-muted">No data.</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon ? (
                  <img
                    src={item.icon}
                    alt={item.name ?? "Component"}
                    className="h-8 w-8 rounded border border-white/10 bg-black/50 object-contain flex-shrink-0"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="truncate text-sm text-warm font-semibold">
                    {item.name}
                  </div>
                  {item.isCredit ? (
                    <div className="text-[11px] text-warm-muted">Credit</div>
                  ) : item.rarity ? (
                    <div className="text-[11px] text-warm-muted">
                      {item.rarity}
                    </div>
                  ) : null}
                </div>
              </div>
              {item.quantity !== 0 ? (
                <div
                  className={`text-sm font-semibold ${
                    item.quantity < 0 ? "text-emerald-300" : "text-warm"
                  }`}
                >
                  {item.quantity < 0
                    ? `+${Math.abs(item.quantity)}`
                    : `x${item.quantity}`}
                </div>
              ) : (
                <div className="text-sm font-semibold text-warm-muted">—</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// components/RepairCalculatorClient.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import {
  recommendAction,
  type ItemEconomy,
  type ComponentCost,
} from "@/lib/repairCalculator";
import type { RepairEconomyRow } from "@/data/repairEconomy";
import { RarityBadge } from "./ItemCard";
import { cachedFetchJson } from "@/lib/clientCache";

type Props = {
  items: RepairEconomyRow[];
  dataVersion?: string | number | null;
};

type CostRow = {
  id: string;
  name: string;
  quantity: number;
  isCredit?: boolean;
  rarity?: string | null;
  icon?: string | null;
};

export function RepairCalculatorClient({ items: initialItems, dataVersion }: Props) {
  const [items, setItems] = useState<RepairEconomyRow[]>(initialItems);

  // Keep local copy in sync with server payload
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  // Refresh from route handler using cache + versioning so LTC users get reuse
  useEffect(() => {
    let active = true;

    cachedFetchJson<RepairEconomyRow[]>("/repair-economy", {
      version: dataVersion ?? undefined,
    })
      .then((data) => {
        if (!active || !data) return;
        setItems(data);
      })
      .catch(() => {
        // Swallow to avoid breaking UI if the fetch fails
      });

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

  const selected = useMemo(
    () => eligibleItems.find((i) => i.id === selectedId) ?? null,
    [eligibleItems, selectedId]
  );

  const [durability, setDurability] = useState<number>(selected?.max_durability ?? 0);

  // Keep durability in sync when item changes
  useEffect(() => {
    setDurability(selected?.max_durability ?? 0);
  }, [selected?.max_durability]);

  useEffect(() => {
    if (!selectedId && eligibleItems.length) {
      setSelectedId(eligibleItems[0].id);
    } else if (
      selectedId &&
      !eligibleItems.some((i) => i.id === selectedId) &&
      eligibleItems.length
    ) {
      setSelectedId(eligibleItems[0].id);
    }
  }, [eligibleItems, selectedId]);

  const filteredItems = useMemo(() => {
    const q = pickerQuery.trim().toLowerCase();
    if (!q) return eligibleItems;
    return eligibleItems.filter((i) =>
      (i.name ?? "").toLowerCase().includes(q)
    );
  }, [eligibleItems, pickerQuery]);

  const result = useMemo(() => {
    if (!selected) return null;
    return recommendAction(selected as ItemEconomy, durability);
  }, [selected, durability]);

  const repairCosts = useCostList(
    result?.repairCost,
    result?.repairBand === "cheap"
      ? selected?.cheap_repair_cost
      : selected?.expensive_repair_cost,
    items
  );
  const craftMetaSources = [
    ...(
      selected?.net_upgrade_cost && selected.net_upgrade_cost.length > 0
        ? selected.net_upgrade_cost
        : selected?.craft_components ?? []
    ),
    ...(selected?.recycle_outputs ?? []),
  ];
  const craftCosts = useCostList(
    result?.trueCraftCost,
    craftMetaSources,
    items
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-panel-texture p-5">
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          {/* Left column: selector + durability in a card */}
          <div className="rounded-lg border border-slate-800 bg-panel-texture p-5 space-y-6 h-full flex flex-col">
      
            <div className="space-y-3">
              <label className="text-sm text-warm font-medium">Select item</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPickerOpen((prev) => !prev)}
                  className="w-full h-11 rounded-md border border-[#4fc1e9]/60 bg-panel-texture px-3 py-2 text-sm text-warm flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
                >
                  <span className="flex items-center gap-3 truncate">
                    {selected?.icon ? (
                      <img
                        src={selected.icon}
                        alt={selected.name ?? "Item"}
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
                  <div className="absolute z-20 left-0 top-full mt-2 w-full md:w-[420px] rounded-lg border border-[#4fc1e9]/60 bg-panel-texture shadow-2xl backdrop-blur text-sm">
                    <div className="border-b border-[#4fc1e9]/60 px-3 py-2 bg-slate-900/60 rounded-t-lg">
                      <input
                        autoFocus
                        type="text"
                        value={pickerQuery}
                        onChange={(e) => setPickerQuery(e.target.value)}
                        placeholder="Search items..."
                        className="w-full rounded-md border border-[#4fc1e9]/60 bg-slate-950 px-3 py-2 text-sm text-warm placeholder:text-warm-muted focus:outline-none focus:ring-1 focus:ring-[#4fc1e9] hover:border-[#4fc1e9]"
                      />
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {filteredItems.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-warm-muted">No items found.</div>
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
                                    alt={item.name ?? ""}
                                    className="h-10 w-10 rounded border border-slate-800 bg-slate-950 object-contain"
                                  />
                                ) : null}
                                <div className="min-w-0">
                                  <div className="truncate text-sm text-warm">
                                    {item.name}
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-warm-muted">
                                    {item.item_type && (
                                      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5">
                                        {item.item_type}
                                      </span>
                                    )}
                                    {item.rarity ? <RarityBadge rarity={item.rarity} /> : null}
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

            <div className="mt-6 space-y-4">
              <label className="text-sm text-warm font-medium">
                Current durability
                {selected?.max_durability != null
                  ? ` (max ${selected.max_durability})`
                  : ""}
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={selected?.max_durability ?? 100}
                  value={durability}
                  onChange={(e) => setDurability(parseInt(e.target.value, 10))}
                  className="w-full accent-[#4fc1e9]"
                />
                <input
                  type="number"
                  min={0}
                  max={selected?.max_durability ?? 100}
                  value={durability}
                  onChange={(e) =>
                    setDurability(
                      Math.max(
                        0,
                        Math.min(selected?.max_durability ?? 0, Number(e.target.value))
                      )
                    )
                  }
                  className="w-24 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-base text-warm focus:outline-none focus:ring-2 focus:ring-[#4fc1e9]"
                />
              </div>
            </div>
          </div>

          {/* Right column: quick details, recommendation, costs */}
          <div className="space-y-4 h-full flex flex-col">
            <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 space-y-3 order-2 md:order-1">
                <div className="text-sm font-semibold text-warm">
                  Quick details
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm text-warm">
                  <InfoRow label="Max durability">
                    {selected?.max_durability ?? "Unknown"}
                  </InfoRow>
                  <InfoRow label="Cheap threshold">
                    {selected?.cheap_threshold ?? "Unknown"}
                  </InfoRow>
                  <InfoRow label="Item type">
                    {selected?.item_type ?? "Unknown"}
                  </InfoRow>
                  <InfoRow label="Rarity">
                    {selected?.rarity ? (
                      <RarityBadge rarity={selected.rarity} />
                    ) : (
                      "Unknown"
                    )}
                  </InfoRow>
                </dl>
              </div>

              {selected && result ? (
                <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 space-y-3 order-1 md:order-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="text-xs uppercase tracking-[0.08em] text-warm-muted font-medium">
                        Recommendation
                      </div>
                      <div className="text-lg font-semibold text-warm">
                        {result.recommendedAction === "REPAIR"
                          ? "Repair it"
                          : result.recommendedAction === "REPLACE"
                          ? "Replace it"
                          : "Unknown"}
                      </div>
                      {result.repairBand && (
                        <div className="text-xs text-warm-muted font-medium">
                          Repair band: {result.repairBand}
                        </div>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                        result.recommendedAction === "REPAIR"
                          ? "bg-emerald-900/40 text-emerald-100 border border-emerald-500/50"
                          : result.recommendedAction === "REPLACE"
                          ? "bg-[#4fc1e9]/15 text-[#4fc1e9] border border-[#4fc1e9]/60"
                          : "bg-slate-900/60 text-warm border border-slate-700"
                      }`}
                    >
                      {result.recommendedAction === "REPAIR"
                        ? "Repair"
                        : result.recommendedAction === "REPLACE"
                        ? "Replace"
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <CostCard
                title="Repair cost"
                costs={repairCosts}
                emptyHint="No repair cost found."
              />
              <CostCard
                title="True craft cost (craft - recycle)"
                costs={craftCosts}
                emptyHint="No craft cost found."
              />
            </div>
          </div>
        </div>
      </div>

      {selected && result ? null : (
        <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
          Could not compute a recommendation for this item (missing durability
          data).
        </div>
      )}
    </div>
  );
}

function useCostList(
  costMap: Record<string, number> | undefined,
  metaSources: ComponentCost[] | undefined,
  items: RepairEconomyRow[]
): CostRow[] {
  return useMemo(() => {
    if (!costMap) return [];
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const componentMeta = new Map(
      (metaSources ?? []).map((c) => [c.component_item_id, c])
    );
    return Object.entries(costMap)
      .filter(([, qty]) => qty !== 0)
      .filter(([id]) => {
        const meta = componentMeta.get(id) ?? itemMap.get(id);
        const itemType = (meta as any)?.item_type;
        return itemType !== "Blueprint";
      })
      .map(([id, qty]) => {
        const meta = componentMeta.get(id) ?? itemMap.get(id);
        const name = (meta as any)?.name ?? id;
        return {
          id,
          name,
          quantity: Math.abs(qty),
          isCredit: qty < 0,
          rarity: (meta as any)?.rarity,
          icon: (meta as any)?.icon,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [costMap, metaSources, items]);
}

function CostCard({
  title,
  costs,
  emptyHint,
}: {
  title: string;
  costs: CostRow[];
  emptyHint: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-panel-texture p-4 space-y-3">
      <div className="text-sm font-semibold text-warm">{title}</div>
      {costs.length === 0 ? (
        <div className="text-sm text-warm-muted">{emptyHint}</div>
      ) : (
        <ul className="space-y-2 text-sm text-warm">
          {costs.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <span className="flex items-center gap-2 truncate">
                {c.icon ? (
                  <img
                    src={c.icon}
                    alt={c.name}
                    className="h-6 w-6 rounded border border-slate-800 bg-slate-950 object-contain"
                  />
                ) : null}
                <span className="truncate">{c.name}</span>
                {c.rarity ? (
                  <span className="shrink-0">
                    <RarityBadge rarity={c.rarity} />
                  </span>
                ) : null}
              </span>
              <div className="flex flex-col items-end text-right leading-tight">
                <span
                  className={`font-semibold ${
                    c.isCredit ? "text-emerald-400" : "text-warm"
                  }`}
                >
                  {c.isCredit ? `+${c.quantity}` : `x${c.quantity}`}
                </span>
                {c.isCredit ? (
                  <span className="text-[11px] text-emerald-200">(gained)</span>
                ) : (
                  <span className="text-[11px] text-transparent">.</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs uppercase tracking-[0.08em] text-warm-muted font-medium">
        {label}
      </div>
      <div className="text-warm">{children}</div>
    </div>
  );
}

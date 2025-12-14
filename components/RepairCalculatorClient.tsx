"use client";

import { useEffect, useMemo, useState } from "react";
import {
  recommendAction,
  type ComponentCost,
  type ItemEconomy,
} from "@/lib/repairCalculator";
import type { RepairEconomyRow } from "@/data/repairEconomy";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useAppVersion } from "@/hooks/useAppVersion";
import { ModulePanel } from "./ModulePanel";
import { SelectedItemSummary } from "@/components/SelectedItemSummary";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";

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
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;

  // cache-busting URL (not a DB schema)
  const economyUrl = `/api/repair-economy?v=repair_fix_1`;

  const { data: fetchedItems } = useCachedJson<unknown>(economyUrl, {
    version: cacheVersion,
    initialData: initialItems as unknown,
  });

  function normalizeRepairRows(input: unknown): RepairEconomyRow[] {
    if (Array.isArray(input)) return input as RepairEconomyRow[];

    if (input && typeof input === "object" && "data" in input) {
      const d = (input as { data?: unknown }).data;
      if (Array.isArray(d)) return d as RepairEconomyRow[];
    }

    return [];
  }

  const items = normalizeRepairRows(fetchedItems ?? initialItems);

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

  const [selectedId, setSelectedId] = useState<string | null>(
    eligibleItems.length ? eligibleItems[0].id : null
  );

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

  useEffect(() => {
    setDurability(selected?.max_durability ?? 0);
  }, [selected?.max_durability]);

  const pickerItems = useMemo<PickerItem[]>(
    () =>
      eligibleItems.map((item) => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        rarity: item.rarity ?? undefined,
        subtitle: item.max_durability
          ? `Max durability: ${item.max_durability}`
          : null,
      })),
    [eligibleItems]
  );

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
          <div className="rp-card space-y-6 h-full flex flex-col overflow-visible">
            <div className="space-y-3">
              <label className="text-base text-warm font-semibold">
                Select item
              </label>
              <ItemPicker
                items={pickerItems}
                selectedId={selectedId}
                onChange={(id) => setSelectedId(id)}
                placeholder="Select an item..."
                triggerClassName="h-11 text-base"
                dropdownClassName="md:w-[420px]"
              />
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
          </div>

          <div className="rp-card space-y-4 overflow-visible">
            {selected && (
              <SelectedItemSummary
                name={selected.name}
                icon={selected.icon}
                rarity={selected.rarity ?? undefined}
                itemType={selected.item_type ?? undefined}
                maxDurability={selected.max_durability ?? undefined}
                className="rounded-lg border border-white/5 bg-black/25 p-4"
              />
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
                {item.icon && (
                  <img
                    src={item.icon}
                    alt={item.name ?? "Component"}
                    className="h-8 w-8 rounded border border-white/10 bg-black/50 object-contain flex-shrink-0"
                  />
                )}
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
              <div className="text-sm font-semibold text-warm">
                {item.quantity < 0
                  ? `+${Math.abs(item.quantity)}`
                  : `x${item.quantity}`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

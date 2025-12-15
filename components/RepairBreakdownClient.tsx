"use client";

import { useEffect, useMemo, useState } from "react";
import { recommendAction, type ItemEconomy } from "@/lib/repairCalculator";
import type { RepairEconomyRow } from "@/data/repairEconomy";
import { useCachedJson } from "@/hooks/useCachedJson";
import { useAppVersion } from "@/hooks/useAppVersion";
import { ModulePanel } from "./ModulePanel";
import { ItemPicker, type PickerItem } from "./ItemPicker";
import { SelectedItemSummary } from "./SelectedItemSummary";
import { Card } from "./ui/Card";
import { CostCard, useCostRows, toComponentMap } from "./costs";

type Props = {
  items: RepairEconomyRow[];
  dataVersion?: string | number | null;
};

export function RepairBreakdownClient({ items: initialItems, dataVersion }: Props) {
  const { version: appVersion } = useAppVersion({ initialVersion: dataVersion });
  const cacheVersion = appVersion ?? dataVersion ?? undefined;

  const economyUrl = `/api/repair-economy?v=repair_fix_1`;

  const { data: fetchedItems } = useCachedJson<unknown>(economyUrl, {
    version: cacheVersion,
    initialData: initialItems as unknown,
  });

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

  const repairMeta = useMemo(
    () =>
      result?.repairBand === "cheap"
        ? selected?.cheap_repair_cost ?? []
        : selected?.expensive_repair_cost ?? [],
    [result?.repairBand, selected?.cheap_repair_cost, selected?.expensive_repair_cost]
  );

  const repairCosts = useCostRows(result?.repairCost, repairMeta, items);

  const fullRepairCosts = useCostRows(
    createFullRepairCost(result?.repairCost, result?.repairBand),
    repairMeta,
    items
  );

  const craftCosts = useCostRows(
    toComponentMap(selected?.craft_components),
    selected?.craft_components,
    items
  );

  const recycleYield = useCostRows(
    toComponentMap(selected?.recycle_outputs),
    selected?.recycle_outputs,
    items
  );

  const trueCraftCosts = useCostRows(
    result?.trueCraftCost,
    [
      ...(selected?.craft_components ?? []),
      ...(selected?.recycle_outputs ?? []),
    ],
    items
  );

  return (
    <ModulePanel title="Repair & Recycle Breakdown">
      <div className="space-y-6">
        <p className="text-base text-warm">
          Explore the full math behind repairing or rebuilding an item. Pick an
          item, slide its durability, and see the exact components that drive
          each step.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <Card className="space-y-6 h-full flex flex-col overflow-visible">
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

            {selected && result && (
              <div className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-warm">
                  <span>Recommended action</span>
                  <span
                    className={`rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      result.recommendedAction === "REPAIR"
                        ? "bg-emerald-900/30 text-emerald-200 border border-emerald-700/50"
                        : "bg-amber-900/30 text-amber-100 border border-amber-700/50"
                    }`}
                  >
                    {result.recommendedAction === "REPAIR" ? "Repair" : "Replace"}
                  </span>
                </div>
                {result.repairBand && (
                  <div className="text-xs text-warm-muted">
                    Using the {result.repairBand} repair table for this
                    durability level.
                  </div>
                )}
              </div>
            )}
          </Card>

          <Card className="space-y-4 overflow-visible">
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

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoLine label="Durability set to" value={`${durability}/${selected?.max_durability ?? 0}`} />
              <InfoLine
                label="Repair passes to full"
                value={result?.repairBand === "expensive" ? "2" : "1"}
              />
            </div>

            <div className="rounded-lg border border-white/5 bg-black/25 p-3 text-xs text-warm-muted">
              Full repair assumes expensive repairs may need two passes, while
              cheap repairs bring the item to max in one.
            </div>
          </Card>
        </div>

        {!selected || !result ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
            Could not compute yet. Choose an item with repair and craft data.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CostCard title="Repair cost" items={repairCosts} />
            <CostCard title="Repair cost (to full)" items={fullRepairCosts} />
            <CostCard title="Recycle yield" items={recycleYield} />
            <CostCard title="Craft cost (current item)" items={craftCosts} />
            <CostCard
              title="True craft cost (craft - recycle)"
              items={trueCraftCosts}
            />
          </div>
        )}
      </div>
    </ModulePanel>
  );
}

function normalizeRepairRows(input: unknown): RepairEconomyRow[] {
  if (Array.isArray(input)) return input as RepairEconomyRow[];

  if (input && typeof input === "object" && "data" in input) {
    const d = (input as { data?: unknown }).data;
    if (Array.isArray(d)) return d as RepairEconomyRow[];
  }

  return [];
}

function createFullRepairCost(
  repairCost: Record<string, number> | null | undefined,
  repairBand: string | null | undefined
) {
  if (!repairCost) return null;
  const multiplier = repairBand === "expensive" ? 2 : 1;

  return Object.fromEntries(
    Object.entries(repairCost).map(([id, qty]) => [id, qty * multiplier])
  );
}

function InfoLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-white/5 bg-black/30 px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.05em] text-warm-muted">
        {label}
      </div>
      <div className="text-sm font-semibold text-warm">{value}</div>
    </div>
  );
}

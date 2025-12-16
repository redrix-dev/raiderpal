"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type RepairableItem,
  computeRepairSummary,
} from "@/lib/data/client";
import { ModulePanel } from "./ModulePanel";
import { SelectedItemSummary } from "@/components/SelectedItemSummary";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";
import { Card } from "./ui/Card";
import { CostCard, type CostRow } from "./costs";

type Props = {
  items: RepairableItem[];
};

export function RepairCalculatorClient({ items }: Props) {
  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) =>
        (a.item.name ?? "").localeCompare(b.item.name ?? "")
      ),
    [items]
  );

  const [selectedId, setSelectedId] = useState<string | null>(
    sortedItems[0]?.item.id ?? null
  );

  useEffect(() => {
    setSelectedId((prev) => {
      const nextDefault = sortedItems[0]?.item.id ?? null;
      if (!prev || !sortedItems.some((item) => item.item.id === prev)) {
        return nextDefault;
      }
      return prev;
    });
  }, [sortedItems]);

  const selected = useMemo(
    () => sortedItems.find((i) => i.item.id === selectedId) ?? null,
    [sortedItems, selectedId]
  );

  const [durability, setDurability] = useState<number>(
    selected?.profile.max_durability ?? 0
  );

  useEffect(() => {
    setDurability(selected?.profile.max_durability ?? 0);
  }, [selected?.profile.max_durability]);

  const pickerItems = useMemo<PickerItem[]>(
    () =>
      sortedItems.map((entry) => ({
        id: entry.item.id,
        name: entry.item.name,
        icon: entry.item.icon,
        rarity: entry.item.rarity ?? undefined,
        subtitle: entry.profile.max_durability
          ? `Max durability: ${entry.profile.max_durability}`
          : null,
      })),
    [sortedItems]
  );

  const summary = useMemo(() => {
    if (!selected) return null;
    return computeRepairSummary({
      profile: selected.profile,
      recipe: selected.recipe,
      currentDurability: durability,
    });
  }, [durability, selected]);

  const perCycleRows = useMemo<CostRow[]>(() => {
    if (!selected) return [];
    return selected.recipe
      .map((row) => ({
        id: row.component_item_id,
        name: row.component?.name ?? row.component_item_id,
        icon: row.component?.icon ?? null,
        rarity: row.component?.rarity ?? null,
        quantity: row.quantity_per_cycle,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected]);

  const totalCostRows = useMemo<CostRow[]>(() => {
    if (!summary || !selected) return [];
    const meta = new Map(
      selected.recipe.map((r) => [r.component_item_id, r.component])
    );
    return Object.entries(summary.totals)
      .map(([componentId, quantity]) => {
        const component = meta.get(componentId);
        return {
          id: componentId,
          name: component?.name ?? componentId,
          icon: component?.icon ?? null,
          rarity: component?.rarity ?? null,
          quantity,
        } satisfies CostRow;
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected, summary]);

  const cycles = summary?.cycles ?? 0;
  const missing = summary?.missing ?? 0;

  return (
    <ModulePanel title="Repair Cost Calculator">
      <div className="space-y-4">
        <p className="text-base text-warm">
          Calculate how many repair cycles are needed to reach max durability
          and the total component cost based on the manual repair recipes.
        </p>

        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
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
                max={selected?.profile.max_durability ?? 0}
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="w-full accent-[#4fc1e9]"
              />
              <div className="text-xs text-warm-muted">
                Max durability: {selected?.profile.max_durability ?? 0}
              </div>
            </div>

            {selected && summary && (
              <div className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-2">
                <div className="text-sm text-warm font-semibold">
                  Repair cycles needed: {cycles}
                </div>
                <div className="text-xs text-warm-muted font-medium">
                  Missing durability: {missing} (step size {" "}
                  {selected.profile.step_durability})
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-4 overflow-visible">
            {selected && (
              <SelectedItemSummary
                name={selected.item.name}
                icon={selected.item.icon}
                rarity={selected.item.rarity ?? undefined}
                itemType={selected.item.item_type ?? undefined}
                maxDurability={selected.profile.max_durability ?? undefined}
                className="rounded-lg border border-white/5 bg-black/25 p-4"
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <CostCard title="Cost per repair cycle" items={perCycleRows} />
              <CostCard title="Cost to reach full" items={totalCostRows} />
            </div>
          </Card>
        </div>

        {!selected || !summary ? (
          <div className="rounded-lg border border-amber-700/50 bg-amber-900/20 p-4 text-sm text-amber-100">
            Could not compute yet. Choose an item with a repair profile and
            recipe.
          </div>
        ) : null}
      </div>
    </ModulePanel>
  );
}

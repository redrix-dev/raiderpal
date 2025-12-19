"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  type RepairableItem,
  computeRepairSummary,
} from "@/lib/data/client";
import { ModulePanel } from "./ModulePanel";
import { ItemPicker, type PickerItem } from "./ItemPicker";
import { SelectedItemSummary } from "./SelectedItemSummary";
import { Card } from "./ui/Card";
import { CostCard, type CostRow } from "./costs";

type Props = {
  items: RepairableItem[];
};

export function RepairBreakdownClient({ items }: Props) {
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
      if (!prev || !sortedItems.some((i) => i.item.id === prev)) {
        return nextDefault;
      }
      return prev;
    });
  }, [sortedItems]);

  const selected = useMemo(
    () => sortedItems.find((i) => i.item.id === selectedId) ?? null,
    [selectedId, sortedItems]
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
        itemType: entry.item.item_type ?? undefined,
        lootArea: entry.item.loot_area ?? undefined,
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
        id: row.component_id,
        name: row.component?.name ?? row.component_id,
        icon: row.component?.icon ?? null,
        rarity: row.component?.rarity ?? null,
        quantity: row.quantity_per_cycle,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected]);

  const craftingRows = useMemo<CostRow[]>(() => {
    if (!selected) return [];
    return selected.crafting
      .map((row) => ({
        id: row.component_id,
        name: row.component?.name ?? row.component_id,
        icon: row.component?.icon ?? null,
        rarity: row.component?.rarity ?? null,
        quantity: row.quantity,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected]);

  const recyclingRows = useMemo<CostRow[]>(() => {
    if (!selected) return [];
    return selected.recycling
      .map((row) => ({
        id: row.component_id,
        name: row.component?.name ?? row.component_id,
        icon: row.component?.icon ?? null,
        rarity: row.component?.rarity ?? null,
        quantity: row.quantity,
      }))
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected]);

  const netCraftRows = useMemo<CostRow[]>(() => {
    if (!selected) return [];
    const recyclingMap = new Map(
      selected.recycling.map((row) => [row.component_id, row.quantity])
    );

    return selected.crafting
      .map((row) => {
        const recycledQty = recyclingMap.get(row.component_id) ?? 0;
        const quantity = Math.max(0, row.quantity - recycledQty);
        return {
          id: row.component_id,
          name: row.component?.name ?? row.component_id,
          icon: row.component?.icon ?? null,
          rarity: row.component?.rarity ?? null,
          quantity,
        } satisfies CostRow;
      })
      .filter((row) => row.quantity > 0)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected]);

  const totalRows = useMemo<CostRow[]>(() => {
    if (!summary || !selected) return [];
    const meta = new Map(
      selected.recipe.map((r) => [r.component_id, r.component])
    );
    return Object.entries(summary.totals)
      .map(([id, quantity]) => {
        const component = meta.get(id);
        return {
          id,
          name: component?.name ?? id,
          icon: component?.icon ?? null,
          rarity: component?.rarity ?? null,
          quantity,
        } satisfies CostRow;
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [selected, summary]);

  const cycles = summary?.cycles ?? 0;

  return (
    <ModulePanel title="Repair & Recipe Breakdown">
      <div className="space-y-6">
        <p className="text-base text-text-primary">
          Inspect the manual repair recipe for each item, including per-cycle
          costs and the total components needed to reach max durability.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
          <Card className="space-y-6 h-full flex flex-col overflow-visible">
            <div className="space-y-3">
              <label className="text-base text-text-primary font-semibold">
                Select item
              </label>
              <ItemPicker
                items={pickerItems}
                selectedId={selectedId}
                onChange={(id) => setSelectedId(id)}
                placeholder="Select an item..."
                triggerClassName="h-11 text-base"
                dropdownClassName="md:w-[420px] 2xl:[.ui-compact_&]:w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-base text-text-primary font-semibold flex items-center justify-between">
                <span>Current durability</span>
                <span className="text-xs text-text-muted">{durability}</span>
              </label>
              <input
                type="range"
                min={0}
                max={selected?.profile.max_durability ?? 0}
                step={selected?.profile.step_durability ?? 1}
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="w-full accent-brand-cyan"
              />
              <div className="text-xs text-text-muted">
                Max durability: {selected?.profile.max_durability ?? 0}
              </div>
            </div>

            {selected && summary && (
              <div className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold text-text-primary">
                  <span>Repair cycles to full</span>
                  <span className="rounded-md bg-brand-cyan/10 px-3 py-1 text-xs text-brand-cyan">
                    {cycles}
                  </span>
                </div>
                <div className="text-xs text-text-muted">
                  Step durability: {selected.profile.step_durability}
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
              <CostCard title="Per-cycle recipe" items={perCycleRows} />
              <CostCard title="Total to full" items={totalRows} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <CostCard title="Crafting cost" items={craftingRows} />
              <CostCard title="Recycling return" items={recyclingRows} />
              <CostCard
                title="Net new to craft after recycling"
                items={netCraftRows}
              />
            </div>
          </Card>
        </div>

        {selected && (
          <Card className="space-y-3 overflow-hidden">
            <div className="text-base font-semibold text-text-primary px-4 pt-4">
              Recipe breakdown
            </div>
            <div className="overflow-x-auto px-2 pb-4">
              <table className="min-w-full text-sm text-text-primary">
                <thead className="text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">Component</th>
                    <th className="px-3 py-2 text-right">Per cycle</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.recipe.map((row) => {
                    const total = (summary?.totals ?? {})[row.component_id] ?? 0;
                    return (
                      <tr key={row.component_id} className="border-t border-white/5">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {row.component?.icon && (
                              <Image
                                src={row.component.icon}
                                alt={row.component.name ?? row.component_id}
                                width={32}
                                height={32}
                                sizes="32px"
                                loading="lazy"
                                className="h-8 w-8 rounded border border-white/10 bg-black/50 object-contain"
                              />
                            )}
                            <div>
                              <div className="font-semibold">
                                {row.component?.name ?? row.component_id}
                              </div>
                              {row.component?.rarity && (
                                <div className="text-[11px] text-warm-muted">
                                  {row.component.rarity}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          ×{row.quantity_per_cycle}
                        </td>
                        <td className="px-3 py-2 text-right">×{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

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

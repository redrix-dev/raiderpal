"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  type RepairableItem,
  computeRepairSummary,
} from "@/lib/data/client";
import { ModulePanel } from "./ModulePanel";
import { ItemPicker, type PickerItem } from "@/components/ItemPicker";
import { CostCard, type CostRow } from "./costs";

type Props = {
  items: RepairableItem[];
};

export function RepairCalculatorClient({ items }: Props) {
  const repairStep = 50;
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
      profile: { ...selected.profile, step_durability: repairStep },
      recipe: selected.recipe,
      currentDurability: durability,
    });
  }, [durability, selected, repairStep]);

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

  const totalCostRows = useMemo<CostRow[]>(() => {
    if (!summary || !selected) return [];
    const meta = new Map(
      selected.recipe.map((r) => [r.component_id, r.component])
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

  const maxDurability = selected?.profile.max_durability ?? 0;
  const sliderFill =
    maxDurability > 0 ? Math.min(100, Math.max(0, (durability / maxDurability) * 100)) : 0;
  const rangeStyle = {
    ["--rp-range-progress"]: `${sliderFill}%`,
  } as CSSProperties & { ["--rp-range-progress"]?: string };

  const costTableRows = useMemo(() => {
    const totalMap = new Map(totalCostRows.map((row) => [row.id, row]));
    const perCycleMap = new Map(perCycleRows.map((row) => [row.id, row]));
    const ids = new Set([...perCycleMap.keys(), ...totalMap.keys()]);

    return Array.from(ids)
      .map((id) => {
        const perCycle = perCycleMap.get(id);
        const total = totalMap.get(id);
        return {
          id,
          name: perCycle?.name ?? total?.name ?? id,
          icon: perCycle?.icon ?? total?.icon ?? null,
          rarity: perCycle?.rarity ?? total?.rarity ?? null,
          perCycleQty: perCycle?.quantity ?? 0,
          totalQty: total?.quantity ?? 0,
        };
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [perCycleRows, totalCostRows]);

  const cycles = summary?.cycles ?? 0;
  const missing = summary?.missing ?? 0;

  return (
    <ModulePanel title="Repair Cost Calculator">
      <div className="space-y-4">
        <p className="text-base text-text-primary">
          Calculate how many repair cycles are needed to reach max durability
          and the total component cost based on the manual repair recipes.
        </p>

        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <ModulePanel
            title="Item & Durability"
            className="overflow-visible"
            bodyClassName="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-base text-text-primary font-semibold">
                Select item
              </label>
              <ItemPicker
                items={pickerItems}
                selectedId={selectedId}
                onChange={(id) => setSelectedId(id)}
                placeholder="Select an item..."
                triggerClassName="h-18 text-base"
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
                max={maxDurability}
                step={1}
                value={durability}
                onChange={(e) => setDurability(Number(e.target.value))}
                className="w-full rp-range"
                style={rangeStyle}
              />
              <div className="text-xs text-text-muted">
                Max durability: {selected?.profile.max_durability ?? 0}
              </div>
            </div>

            {selected && summary && (
              <div className="rounded-lg border border-white/5 bg-black/20 p-4 space-y-2">
                <div className="text-sm text-text-primary font-semibold">
                  Repair cycles needed: {cycles}
                </div>
                <div className="text-xs text-text-muted font-medium">
                  Missing durability: {missing} (step size {repairStep})
                </div>
              </div>
            )}

            <div className="rounded-lg border border-white/5 bg-black/25 p-4 2xl:[.ui-compact_&]:p-3 space-y-3 2xl:[.ui-compact_&]:space-y-2.5">
              <div className="text-base 2xl:[.ui-compact_&]:text-sm font-semibold text-text-primary">
                Repair costs
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm 2xl:[.ui-compact_&]:text-xs text-text-primary">
                  <thead className="text-xs 2xl:[.ui-compact_&]:text-[10px] uppercase text-text-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Component</th>
                      <th className="px-3 py-2 text-right">Cost per cycle</th>
                      <th className="px-3 py-2 text-right">Cost to full</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costTableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-3 2xl:[.ui-compact_&]:py-2 text-center text-xs 2xl:[.ui-compact_&]:text-[10px] text-text-muted"
                        >
                          {selected ? "No repairs needed" : "No data."}
                        </td>
                      </tr>
                    ) : (
                      costTableRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-white/5"
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-3 min-w-0">
                              {row.icon && (
                                <Image
                                  src={row.icon}
                                  alt={row.name ?? "Component"}
                                  width={32}
                                  height={32}
                                  sizes="32px"
                                  loading="lazy"
                                  className="h-8 w-8 2xl:[.ui-compact_&]:h-7 2xl:[.ui-compact_&]:w-7 rounded border border-white/10 bg-black/50 object-contain flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="truncate text-sm 2xl:[.ui-compact_&]:text-xs text-text-primary font-semibold">
                                  {row.name}
                                </div>
                                {row.rarity ? (
                                  <div className="text-[11px] 2xl:[.ui-compact_&]:text-[10px] text-text-muted">
                                    {row.rarity}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.perCycleQty > 0 ? `x${row.perCycleQty}` : "-"}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {row.totalQty > 0 ? `x${row.totalQty}` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </ModulePanel>

          <ModulePanel
            title="Repair Costs"
            className="overflow-visible"
            bodyClassName="space-y-4"
          >
            <div className="space-y-4">
              <CostCard title="Crafting cost" items={craftingRows} />
              <CostCard title="Recycling return" items={recyclingRows} />
              <CostCard
                title="Net new to craft after recycling"
                items={netCraftRows}
              />
            </div>
          </ModulePanel>
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

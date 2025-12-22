"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { type RepairableItem, computeRepairSummary } from "@/lib/data/client";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Panel } from "@/components/ui/Panel";
import { ItemPicker, type PickerItem } from "@/components/rp/ItemPicker-portal";
import { type CostRow } from "@/components/costs";

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
    maxDurability > 0
      ? Math.min(100, Math.max(0, (durability / maxDurability) * 100))
      : 0;

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-condensed font-bold uppercase tracking-wide text-primary">
          Repair Cost Calculator
        </h1>
        <p className="text-base text-muted">
          Calculate how many repair cycles are needed to reach max durability
          and the total component cost based on the manual repair recipes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Left column: Tool Controls */}
        <div className="space-y-4">
          {/* Item Selection Card */}
          <div className="rounded-lg border border-border-subtle shadow-sm shadow-black/30 overflow-hidden">
            <CardHeader
              className="rounded-none border-0 border-b border-border-subtle"
              contentClassName="px-4 py-2 sm:px-5 sm:py-2"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                Item Selection
              </div>
            </CardHeader>

            <div className="bg-surface-panel p-4 sm:p-5">
              <div className="space-y-4 relative">
                <div className="space-y-2">
                  <label className="text-sm text-primary font-semibold">
                    Select item to repair
                  </label>
                  <ItemPicker
                    items={pickerItems}
                    selectedId={selectedId}
                    onChange={(id) => setSelectedId(id)}
                    placeholder="Select an item..."
                    triggerClassName="h-14 text-base"
                    dropdownClassName="max-h-[320px]"
                  />
                </div>

                <div className="space-y-2">
                <label className="text-sm text-primary font-semibold flex items-center justify-between">
                  <span>Current durability</span>
                  <span className="text-xs text-muted">{durability}</span>
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
                <div className="text-xs text-muted">
                  Max durability: {selected?.profile.max_durability ?? 0}
                </div>
              </div>

              {selected && summary ? (
                <Card className="!p-3 bg-brand-cyan/5 border-brand-cyan/20">
                  <div className="space-y-1">
                    <div className="text-sm text-primary font-semibold">
                      Repair cycles needed: {cycles}
                    </div>
                    <div className="text-xs text-muted">
                      Missing durability: {missing} (step size {repairStep})
                    </div>
                  </div>
                </Card>
              ) : null}
              </div>
            </div>
          </div>

          {/* Repair Costs Table Card */}
          <div className="overflow-hidden rounded-lg border border-border-subtle shadow-sm shadow-black/30">
            <CardHeader
              className="rounded-none border-0 border-b border-border-subtle"
              contentClassName="px-4 py-2 sm:px-5 sm:py-2"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                Repair Costs Breakdown
              </div>
            </CardHeader>

            <div className="bg-surface-panel p-4 sm:p-5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-primary">
                  <thead className="text-xs uppercase text-muted border-b border-border-subtle">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Component</th>
                      <th className="px-3 py-2 text-right font-semibold">Per Cycle</th>
                      <th className="px-3 py-2 text-right font-semibold">To Full</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costTableRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-3 py-4 text-center text-xs text-muted"
                        >
                          {selected ? "No repairs needed" : "Select an item to see repair costs"}
                        </td>
                      </tr>
                    ) : (
                      costTableRows.map((row) => (
                        <tr key={row.id} className="border-t border-border-subtle">
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3 min-w-0">
                              {row.icon && (
                                <Image
                                  src={row.icon}
                                  alt={row.name ?? "Component"}
                                  width={32}
                                  height={32}
                                  sizes="32px"
                                  loading="lazy"
                                  className="h-8 w-8 rounded border border-border-subtle bg-surface-card object-contain flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="truncate text-sm text-primary font-semibold">
                                  {row.name}
                                </div>
                                {row.rarity && (
                                  <div className="text-[11px] text-muted">
                                    {row.rarity}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-right font-medium">
                            {row.perCycleQty > 0 ? `x${row.perCycleQty}` : "-"}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">
                            {row.totalQty > 0 ? `x${row.totalQty}` : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Crafting Analysis */}
        <div className="overflow-hidden rounded-lg border border-border-subtle shadow-sm shadow-black/30">
          <CardHeader
            className="rounded-none border-0 border-b border-border-subtle"
            contentClassName="px-4 py-2 sm:px-5 sm:py-2"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
              Crafting Analysis
            </div>
          </CardHeader>

          <div className="bg-surface-panel p-4 sm:p-5 space-y-4">
            <CostSection title="Crafting Cost" rows={craftingRows} />
            <CostSection title="Recycling Return" rows={recyclingRows} isReturn />
            <CostSection 
              title="Net Components Needed" 
              rows={netCraftRows} 
              emptyText="No additional components needed (recycling covers all costs)"
            />
          </div>
        </div>
      </div>

      {!selected && (
        <Card className="!p-4 bg-amber-900/10 border-amber-700/30">
          <p className="text-sm text-primary">
            Select an item above to calculate repair costs and see the full crafting analysis.
          </p>
        </Card>
      )}
    </div>
  );
}

function CostSection({
  title,
  rows,
  isReturn = false,
  emptyText = "No components required",
}: {
  title: string;
  rows: CostRow[];
  isReturn?: boolean;
  emptyText?: string;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-primary">{title}</h3>
      {rows.length === 0 ? (
        <Card className="!p-3">
          <p className="text-xs text-muted">{emptyText}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((row) => (
            <Card key={row.id} className="!p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {row.icon && (
                    <Image
                      src={row.icon}
                      alt={row.name ?? "Component"}
                      width={32}
                      height={32}
                      sizes="32px"
                      loading="lazy"
                      className="h-8 w-8 rounded border border-border-subtle bg-surface-panel object-contain flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-sm text-primary font-semibold">
                      {row.name}
                    </div>
                    {row.rarity && (
                      <div className="text-[11px] text-muted">{row.rarity}</div>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${isReturn ? 'text-emerald-600' : 'text-primary'}`}>
                  {isReturn ? '+' : 'x'}{row.quantity}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

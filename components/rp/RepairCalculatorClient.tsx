"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type RepairableItem, computeRepairSummary } from "@/lib/data/client";
import { Card } from "@/components/ui/Card";
import { CardHeader } from "@/components/ui/CardHeader";
import { Panel } from "@/components/ui/Panel";
import { RarityBadge } from "@/components/ui/RarityBadge";
import { rarityClasses } from "@/components/ui/rarity";
import { ToolGrid } from "@/components/ui/ToolGrid";
import { ItemPicker, type PickerItem } from "@/components/rp/ItemPicker-portal";
import { RangeSlider } from "@/components/rp/RangeSlider";
import { type CostRow } from "@/lib/types/costs";
import { cn } from "@/lib/cn";

type Props = {
  items: RepairableItem[];
};

type ComponentMeta = Pick<CostRow, "id" | "name" | "icon" | "rarity">;

type CostBreakdownRow = ComponentMeta & {
  perCycleQty: number;
  totalQty: number;
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

  const costTableRows = useMemo<CostBreakdownRow[]>(() => {
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
      <ToolGrid columnsAt="md">
        <div className="space-y-6">
          <Card className="!p-0 overflow-hidden">
            <CardHeader
              className="rounded-none border-0 border-b border-border-subtle"
              contentClassName="px-4 py-2 sm:px-5 sm:py-2"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                Item Selection
              </div>
            </CardHeader>

            <div className="bg-surface-panel p-4 sm:p-5 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted">
                    Select item to repair
                  </label>
                  <ItemPicker
                    items={pickerItems}
                    selectedId={selectedId}
                    onChange={(id) => setSelectedId(id)}
                    placeholder="Select an item..."
                    dropdownClassName="max-h-[460px]"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-muted">
                    <span id="current-durability-label">Current durability</span>
                    <span className="text-primary">{durability}</span>
                  </div>
                  <RangeSlider
                    min={0}
                    max={maxDurability}
                    step={1}
                    value={durability}
                    onChange={setDurability}
                    className="w-full"
                    touchBehavior="pan-y"
                    ariaLabelledBy="current-durability-label"
                    ariaValueText={`Current durability ${durability}`}
                  />
                  <div className="text-xs text-muted">
                    Max durability: {selected?.profile.max_durability ?? 0}
                  </div>
                </div>
              </div>

              {selected && summary ? (
                <Card className="!p-3 border-brand-cyan/40 bg-brand-cyan/10">
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
          </Card>

          <Card className="!p-0 overflow-hidden">
            <CardHeader
              className="rounded-none border-0 border-b border-border-subtle"
              contentClassName="px-4 py-2 sm:px-5 sm:py-2"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-invert">
                Repair Costs Breakdown
              </div>
            </CardHeader>

          <div className="bg-surface-panel p-4 sm:p-5 space-y-3">
              {costTableRows.length === 0 ? (
                <Card className="!p-3">
                  <p className="text-xs text-muted">
                    {selected
                      ? "No repairs needed"
                      : "Select an item to see repair costs"}
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {costTableRows.map((row) => {
                    const perCycleLabel =
                      row.perCycleQty > 0 ? `x${row.perCycleQty}` : "-";
                    const totalLabel =
                      row.totalQty > 0 ? `x${row.totalQty}` : "-";

                    return (
                      <ComponentCard
                        key={row.id}
                        item={row}
                        right={
                          <TotalsBlock
                            perCycleLabel={perCycleLabel}
                            totalLabel={totalLabel}
                          />
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card className="!p-0 overflow-hidden">
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
        </Card>
      </ToolGrid>
    </div>
  );
}

function ComponentCard({
  item,
  right,
}: {
  item: ComponentMeta;
  right?: ReactNode;
}) {
  return (
    <Card
      variant="neutral"
      className={cn("!p-1", rarityClasses(item.rarity))}
    >
      <Panel
        variant="light"
        padding="none"
        className="flex items-center gap-3 p-3"
      >
        {item.icon ? (
          <Image
            src={item.icon}
            alt={item.name ?? "Component"}
            width={36}
            height={36}
            sizes="36px"
            loading="lazy"
            className="h-9 w-9 rounded border border-border-subtle bg-surface-panel object-contain flex-shrink-0"
          />
        ) : (
          <div className="h-9 w-9 rounded border border-border-subtle bg-surface-panel" />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-condensed font-semibold text-primary">
              {item.name ?? "Unknown component"}
            </span>
            <RarityBadge rarity={item.rarity} />
          </div>
        </div>

        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </Panel>
    </Card>
  );
}

function TotalsBlock({
  perCycleLabel,
  totalLabel,
}: {
  perCycleLabel: string;
  totalLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 text-right sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-16">
        <div className="text-[10px] uppercase text-muted">Per cycle</div>
        <div className="text-sm font-semibold text-primary">{perCycleLabel}</div>
      </div>
      <div className="min-w-16">
        <div className="text-[10px] uppercase text-muted">To full</div>
        <div className="text-sm font-semibold text-primary">{totalLabel}</div>
      </div>
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
          {rows.map((row) => {
            const quantityLabel =
              row.quantity > 0
                ? `${isReturn ? "+" : "x"}${row.quantity}`
                : "-";
            const quantityClass =
              row.quantity > 0
                ? isReturn
                  ? "text-emerald-600"
                  : "text-primary"
                : "text-muted";

            return (
              <ComponentCard
                key={row.id}
                item={row}
                right={
                  <div className={cn("text-sm font-semibold", quantityClass)}>
                    {quantityLabel}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

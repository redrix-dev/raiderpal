import type { RepairRecipeRow } from "./db/types";

export function computeRepairCycles({
  maxDurability,
  stepDurability,
  currentDurability,
}: {
  maxDurability: number;
  stepDurability: number;
  currentDurability: number;
}) {
  const safeMax = Math.max(0, maxDurability || 0);
  const safeStep = Math.max(1, stepDurability || 0);
  const safeCurrent = Math.max(0, Math.min(currentDurability || 0, safeMax));

  const missing = Math.max(0, safeMax - safeCurrent);
  const cycles = missing === 0 ? 0 : Math.ceil(missing / safeStep);

  return { missing, cycles };
}

export function computeRepairCost({
  recipeRows,
  cycles,
}: {
  recipeRows: RepairRecipeRow[];
  cycles: number;
}) {
  const totals = recipeRows.reduce<Record<string, number>>((acc, row) => {
    const id = row.component_item_id;
    const perCycle = Number(row.quantity_per_cycle ?? 0);
    const qty = perCycle * Math.max(0, cycles);
    if (!id || qty <= 0) return acc;

    acc[id] = (acc[id] ?? 0) + qty;
    return acc;
  }, {});

  return totals;
}

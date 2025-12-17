import type { RepairRecipeRow } from "./db/types";

/**
 * Calculates how many repair cycles are needed to restore an item.
 *
 * @param maxDurability - Maximum durability value for the item
 * @param stepDurability - Durability restored per repair cycle (default 50)
 * @param currentDurability - Current durability (clamped between 0 and max)
 * @returns Object with missing durability and the number of cycles needed
 *
 * @example
 * computeRepairCycles({ maxDurability: 100, stepDurability: 50, currentDurability: 30 })
 * // => { missing: 70, cycles: 2 }
 */
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
  const safeStep = Math.max(1, stepDurability || 50);
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

export function computeRepairSummary({
  profile,
  recipe,
  currentDurability,
}: {
  profile: { max_durability: number; step_durability: number };
  recipe: RepairRecipeRow[];
  currentDurability: number;
}) {
  const { cycles, missing } = computeRepairCycles({
    maxDurability: profile.max_durability,
    stepDurability: profile.step_durability,
    currentDurability,
  });

  const totals = computeRepairCost({ recipeRows: recipe, cycles });
  return { cycles, missing, totals };
}

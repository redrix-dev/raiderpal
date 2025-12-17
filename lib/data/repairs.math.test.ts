import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { computeRepairCycles, computeRepairCost } from "./repairs.math";

const sampleRecipe = [
  { component_item_id: "a", quantity_per_cycle: 2 },
  { component_item_id: "b", quantity_per_cycle: 1 },
];

describe("computeRepairCycles", () => {
  it("returns 0 cycles for full durability", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 100,
    });
    assert.deepEqual(result, { missing: 0, cycles: 0 });
  });

  it("calculates correct cycles for partial damage", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 30,
    });
    assert.deepEqual(result, { missing: 70, cycles: 2 });
  });

  it("handles over-damage gracefully", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 150,
    });
    assert.deepEqual(result, { missing: 0, cycles: 0 });
  });

  it("handles zero step durability", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 0,
      currentDurability: 50,
    });
    assert.ok(result.cycles > 0);
  });
});

describe("computeRepairCost", () => {
  it("aggregates per-cycle quantities across recipe rows", () => {
    const totals = computeRepairCost({ recipeRows: sampleRecipe, cycles: 3 });
    assert.deepEqual(totals, { a: 6, b: 3 });
  });

  it("returns empty totals for zero cycles", () => {
    const totals = computeRepairCost({ recipeRows: sampleRecipe, cycles: 0 });
    assert.deepEqual(totals, {});
  });
});

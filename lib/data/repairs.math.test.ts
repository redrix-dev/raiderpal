import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeRepairCycles, computeRepairCost } from "./repairs.math";

describe("computeRepairCycles", () => {
  it("returns 0 cycles for full durability", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 100,
    });
    assert.deepStrictEqual(result, { missing: 0, cycles: 0 });
  });

  it("calculates correct cycles for partial damage", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 30,
    });
    assert.deepStrictEqual(result, { missing: 70, cycles: 2 });
  });

  it("handles over-damage gracefully", () => {
    const result = computeRepairCycles({
      maxDurability: 100,
      stepDurability: 50,
      currentDurability: 150,
    });
    assert.deepStrictEqual(result, { missing: 0, cycles: 0 });
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
  it("totals per-cycle costs across cycles", () => {
    const result = computeRepairCost({
      recipeRows: [
        { item_id: "item1", component_id: "c1", quantity_per_cycle: 2 },
        { item_id: "item1", component_id: "c2", quantity_per_cycle: 1 },
      ],
      cycles: 3,
    });

    assert.deepStrictEqual(result, { c1: 6, c2: 3 });
  });
});

import { describe, expect, it } from "vitest";
import { VIEW_CONTRACTS } from "@/lib/data/db/contracts";
import { assertDatasetVersionInvariants } from "./invariants/datasetVersion.invariants";
import { readJsonFixture } from "./helpers/readJsonFixture";

describe("datasetVersion contract fixture", () => {
  it("validates fixture rows against the contract schema", () => {
    const data = readJsonFixture("datasetVersion.good.json");

    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const first = data[0] as Record<string, unknown>;
    expect(first).toHaveProperty("id");
    expect(first).toHaveProperty("version");
    expect(first).toHaveProperty("last_synced_at");

    const schema = VIEW_CONTRACTS.datasetVersion.schema;
    for (const row of data) {
      const result = schema.safeParse(row);
      expect(result.success).toBe(true);
    }
  });

  it("rejects bad fixture rows with field-level diagnostics", () => {
    const data = readJsonFixture<unknown[]>("datasetVersion.bad.json");
    const schema = VIEW_CONTRACTS.datasetVersion.schema;

    let sawFailure = false;
    for (const row of data) {
      const result = schema.safeParse(row);
      if (!result.success) {
        sawFailure = true;
        expect(result.error).toContain("version");
      }
    }

    expect(sawFailure).toBe(true);
  });

  it("fails invariant checks after schema validation", () => {
    const data = readJsonFixture<unknown[]>("datasetVersion.invariant-bad.json");
    const schema = VIEW_CONTRACTS.datasetVersion.schema;
    const parsedRows = [];

    for (const row of data) {
      const result = schema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        parsedRows.push(result.data);
      }
    }

    expect(() => assertDatasetVersionInvariants(parsedRows)).toThrow(/version/);
  });

  it("fails cardinality invariant for multiple rows", () => {
    const data = readJsonFixture<unknown[]>("datasetVersion.cardinality-bad.json");
    const schema = VIEW_CONTRACTS.datasetVersion.schema;
    const parsedRows = [];

    for (const row of data) {
      const result = schema.safeParse(row);
      expect(result.success).toBe(true);
      if (result.success) {
        parsedRows.push(result.data);
      }
    }

    expect(() => assertDatasetVersionInvariants(parsedRows)).toThrow(
      "Invariant failed: expected exactly 1 datasetVersion row, got 2"
    );
  });
});

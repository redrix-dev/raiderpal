type DatasetVersionRow = {
  id: string;
  version: number;
  last_synced_at: string | null;
};

export function assertDatasetVersionInvariants(rows: DatasetVersionRow[]) {
  if (rows.length !== 1) {
    throw new Error(
      `Invariant failed: expected exactly 1 datasetVersion row, got ${rows.length}`
    );
  }

  for (const row of rows) {
    if (!Number.isInteger(row.version)) {
      throw new Error("Invariant failed: version must be an integer");
    }
    if (typeof row.last_synced_at !== "string") {
      throw new Error("Invariant failed: last_synced_at must be a valid date string");
    }
    if (Number.isNaN(Date.parse(row.last_synced_at))) {
      throw new Error("Invariant failed: last_synced_at must be a valid date string");
    }
  }
}

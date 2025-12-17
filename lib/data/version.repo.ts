import { VIEW_CONTRACTS } from "./db/contracts";
import { queryViewMaybeSingle } from "./db/query";

export type AppMetadataRow = {
  id: string;
  version: number;
  last_synced_at: string | null;
};

export async function getDataVersion(): Promise<AppMetadataRow | null> {
  const row = await queryViewMaybeSingle(VIEW_CONTRACTS.datasetVersion, (q) =>
    q.eq("id", "global")
  );

  if (!row) return null;

  return {
    id: row.id,
    version: row.version,
    last_synced_at: row.last_synced_at,
  };
}

import { VIEW_CONTRACTS } from "./db/contracts";
import { queryView, queryViewMaybeSingle } from "./db/query";

export type AppMetadataRow = {
  id: string;
  version: number;
  last_synced_at: string | null;
};

export async function getDataVersion(): Promise<AppMetadataRow | null> {
  const row = await queryViewMaybeSingle(VIEW_CONTRACTS.datasetVersion, (q) =>
    q.eq("id", "global")
  );

  const resolved =
    row ??
    (await queryView(VIEW_CONTRACTS.datasetVersion, (q) => q.limit(1)))[0] ??
    null;

  if (!resolved) return null;

  if (!row && resolved.id !== "global") {
    console.warn(
      "[version] dataset version row missing expected id 'global'; using fallback row",
      { resolvedId: resolved.id }
    );
  }

  return {
    id: resolved.id,
    version: resolved.version,
    last_synced_at: resolved.last_synced_at,
  };
}

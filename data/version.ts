// /data/version.ts
import { createServerClient } from "@/lib/supabaseServer";

export type AppMetadataRow = {
  id: string;
  version: number;
  last_synced_at: string | null; // ISO timestamp
};

/**
 * Returns the current data version stored in Supabase.
 * Used later for "your local cache is stale" checks.
 */
export async function getDataVersion(): Promise<AppMetadataRow | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("app_metadata")
    .select("id, version, last_synced_at")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(`getDataVersion failed: ${error.message}`);
  }

  return (data as AppMetadataRow) ?? null;
}

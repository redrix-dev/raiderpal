import { createAnonClient } from "@/lib/supabase";

const VERSION_TABLE = "rp_app_metadata";

export type AppMetadataRow = {
  id: string;
  version: number;
  last_synced_at: string | null;
};

export async function getDataVersion(): Promise<AppMetadataRow | null> {
  const supabase = createAnonClient();

  const { data, error } = await supabase
    .from(VERSION_TABLE)
    .select("id, version, last_synced_at")
    .eq("id", "global")
    .maybeSingle();

  if (error) {
    throw new Error(`getDataVersion failed: ${error.message}`);
  }

  return (data as AppMetadataRow) ?? null;
}

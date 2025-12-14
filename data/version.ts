// /data/version.ts
import { createServerClient } from "@/lib/supabaseServer";
import { DB } from "@/lib/dbRelations";

export type AppMetadataRow = {
  id: string;
  version: number;
  last_synced_at: string | null;
};

export async function getDataVersion(): Promise<AppMetadataRow | null> {
  const supabase = createServerClient();

  // Preferred (rp_ naming)
  {
    const { data, error } = await supabase
      .from(DB.dataVersion) // ✅ NO QUOTES
      .select("id, version, last_synced_at")
      .eq("id", "global")
      .maybeSingle();

    if (!error) return (data as AppMetadataRow) ?? null;

    const msg = String(error.message || "").toLowerCase();
    const isMissing =
      msg.includes("could not find the table") || msg.includes("does not exist");

    if (!isMissing) {
      throw new Error(`getDataVersion failed: ${error.message}`);
    }
  }

  // Fallback (old name)
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

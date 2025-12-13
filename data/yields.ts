// /data/yields.ts
import { createServerClient } from "@/lib/supabaseServer";

export type DirectYieldSource = {
  sourceItemId: string;
  sourceName: string;
  sourceIcon: string | null;
  sourceRarity: string | null;
  sourceType: string | null;
  quantity: number;
};

export async function getBestSourcesForItem(
  targetItemId: string
): Promise<DirectYieldSource[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_recycling_sources")
    .select(
      `
        source_item_id,
        quantity,
        source_name,
        source_icon,
        source_rarity,
        source_type
      `
    )
    .eq("component_id", targetItemId);

  if (error || !data) {
    // If something goes wrong, just say "no best sources"
    return [];
  }

  type DirectYieldSourceRow = {
    source_item_id: string;
    source_name: string;
    source_icon: string | null;
    source_rarity: string | null;
    source_type: string | null;
    quantity: number;
  };

  const rows = data as DirectYieldSourceRow[];

  const mapped: DirectYieldSource[] = rows.map((row) => ({
    sourceItemId: row.source_item_id,
    sourceName: row.source_name,
    sourceIcon: row.source_icon,
    sourceRarity: row.source_rarity,
    sourceType: row.source_type,
    quantity: row.quantity,
  }));

  mapped.sort((a, b) => b.quantity - a.quantity);

  return mapped;
}

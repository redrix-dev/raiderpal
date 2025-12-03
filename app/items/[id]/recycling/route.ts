import { createServerClient } from "@/lib/supabaseServer";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest, context: any) {
  const { id } = context?.params ?? {};
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_recycling_sources")
    .select("*")
    .eq("source_item_id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data);
}

import { createServerClient } from "@/lib/supabaseServer";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("view_recycling_sources")
    .select("*")
    .eq("source_item_id", params.id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  return Response.json(data);
}

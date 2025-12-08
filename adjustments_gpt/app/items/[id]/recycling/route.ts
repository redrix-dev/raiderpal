import { getRecyclingForItem } from "@/data/recycling";
import type { NextRequest } from "next/server";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !id.trim()) {
    return new Response(JSON.stringify({ error: "Invalid item id" }), {
      status: 400,
    });
  }

  try {
    const data = await getRecyclingForItem(id.trim());
    return Response.json(data ?? []);
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
    });
  }
}

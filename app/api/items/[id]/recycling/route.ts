import { getRecyclingForItem } from "@/data/recycling";
import type { NextRequest } from "next/server";
import { jsonError, jsonOk, type RouteContext } from "@/lib/http";

type Params = { id: string };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<Params>
) {
  const { id } = await params;
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (!normalizedId) {
    return jsonError("Missing or invalid id", 400);
  }

  const data = await getRecyclingForItem(normalizedId);

  if (!data) {
    return jsonError("Item not found", 404);
  }

  return jsonOk(data, 200, {
    "Cache-Control": "public, max-age=86400, stale-while-revalidate=2592000",
  });
}

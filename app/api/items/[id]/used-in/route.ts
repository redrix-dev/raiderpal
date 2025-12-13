import { getUsedInForItem } from "@/data/usedIn";
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

  const data = await getUsedInForItem(normalizedId);

  if (!data) {
    return jsonError("Item not found", 404);
  }

  return jsonOk(data);
}

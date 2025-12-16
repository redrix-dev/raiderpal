import { getUsedInForItem } from "@/lib/data";
import type { NextRequest } from "next/server";
import { jsonError, jsonOk, type RouteContext } from "@/lib/http";

type Params = { id: string };

export const revalidate = 86400; // refresh daily
export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: RouteContext<Params>
) {
  const { id } = await params;
  const normalizedId = typeof id === "string" ? id.trim() : "";

  if (!normalizedId) {
    return jsonError("Missing or invalid id", 400);
  }

  try {
    const data = await getUsedInForItem(normalizedId);

    return jsonOk(data, 200, {
      "Cache-Control": "public, max-age=900, stale-while-revalidate=85500",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}

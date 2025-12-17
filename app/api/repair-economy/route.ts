import type { NextRequest } from "next/server";
import { REVALIDATE } from "@/lib/constants";
import { listRepairableItems } from "@/lib/data";
import { jsonError, jsonOk } from "@/lib/http";

export const revalidate = REVALIDATE.HOURLY; // refresh hourly to align with data syncs
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const data = await listRepairableItems();
    return jsonOk(data, 200, {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3300",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}

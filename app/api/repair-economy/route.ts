import type { NextRequest } from "next/server";
import { getRepairEconomy } from "@/data/repairEconomy";
import { jsonError, jsonOk } from "@/lib/http";

export const revalidate = 3600; // refresh hourly to align with data syncs
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const data = await getRepairEconomy();
    return jsonOk(data, 200, {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3300",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}

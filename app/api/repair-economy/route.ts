import type { NextRequest } from "next/server";
import { getRepairEconomy } from "@/data/repairEconomy";
import { jsonError, jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const data = await getRepairEconomy();
    return jsonOk(data, 200, {
      "Cache-Control": "no-store",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, 500);
  }
}

import type { NextRequest } from "next/server";
import { getRepairEconomy } from "@/data/repairEconomy";
import { jsonError } from "@/lib/http";

export const revalidate = 0;

export async function GET(_req: NextRequest) {
  try {
    const data = await getRepairEconomy();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(message, 500);
  }
}

import type { NextRequest } from "next/server";
import { getDataVersion } from "@/data/version";
import { jsonOk, jsonError } from "@/lib/http";

export const revalidate = 3600; // refresh every hour
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const meta = await getDataVersion();

    if (!meta) {
      return jsonError("Data version not found", 404);
    }

    return jsonOk(
      {
        version: meta.version,
        last_synced_at: meta.last_synced_at,
      },
      200,
      { "Cache-Control": "public, max-age=300, stale-while-revalidate=3300" }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonError(message, 500);
  }
}

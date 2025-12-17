import type { NextRequest } from "next/server";
import { versionPayloadSchema } from "@/lib/apiSchemas";
import { REVALIDATE } from "@/lib/constants";
import { getDataVersion } from "@/lib/data";
import { assertResponseShape, jsonOk, jsonError } from "@/lib/http";

export const revalidate = REVALIDATE.HOURLY; // refresh every hour
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

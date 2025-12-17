import type { NextRequest } from "next/server";
import { versionPayloadSchema } from "@/lib/apiSchemas";
import { REVALIDATE } from "@/lib/constants";
import { getDataVersion } from "@/lib/data";
import { assertResponseShape, jsonOk, jsonError, jsonErrorFromException } from "@/lib/http";

const REVALIDATE_HOURLY = REVALIDATE.HOURLY;

export const revalidate = REVALIDATE_HOURLY; // refresh every hour
export const runtime = "nodejs";

export async function GET(_req: NextRequest) {
  try {
    const meta = await getDataVersion();

    if (!meta) {
      return jsonError("not_found", "Data version not found", 404);
    }

    const payload = assertResponseShape(versionPayloadSchema, {
      version: meta.version,
      last_synced_at: meta.last_synced_at,
    });

    return jsonOk(payload, 200, {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3300",
    });
  } catch (err) {
    return jsonErrorFromException(err);
  }
}

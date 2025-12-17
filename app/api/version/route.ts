import type { NextRequest } from "next/server";
import { getDataVersion } from "@/lib/data";
import { versionPayloadSchema } from "@/lib/apiSchemas";
import { assertResponseShape, jsonOk, jsonError, jsonErrorFromException } from "@/lib/http";

export const revalidate = 3600; // refresh every hour
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

import type { NextRequest } from "next/server";

export type RouteContext<TParams> = {
  params: Promise<TParams>;
};

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

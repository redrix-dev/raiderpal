import { NextResponse } from "next/server";

export type RouteContext<TParams> = {
  params: Promise<TParams>;
};

const defaultJsonHeaders = Object.freeze({
  "Content-Type": "application/json",
});

function mergeHeaders(headers?: HeadersInit) {
  const merged = new Headers(defaultJsonHeaders);

  if (headers) {
    new Headers(headers).forEach((value, key) => merged.set(key, value));
  }

  return merged;
}

export function jsonOk<T>(data: T, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, {
    status,
    headers: mergeHeaders(headers),
  });
}

export function jsonError(message: string, status = 400, headers?: HeadersInit) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: mergeHeaders(headers),
    }
  );
}

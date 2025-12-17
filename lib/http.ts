import { NextResponse } from "next/server";
import type { Schema } from "@/lib/validation";

export type RouteContext<TParams> = {
  params: Promise<TParams>;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code?: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

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
  const body: ApiSuccess<T> = { success: true, data };
  return NextResponse.json(body, {
    status,
    headers: mergeHeaders(headers),
  });
}

export function formatValidationError(error: string): string {
  return error.replace(/[\[\]]/g, "").trim();
}

export function jsonError(
  message: string,
  status = 400,
  headers?: HeadersInit,
  code?: string
) {
  const body: ApiError = { success: false, error: message, code };
  return NextResponse.json(body, {
    status,
    headers: mergeHeaders(headers),
  });
}

export function assertResponseShape<T>(schema: Schema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(formatValidationError(String(result.error)));
  }
  return result.data;
}

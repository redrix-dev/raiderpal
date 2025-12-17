import { NextResponse } from "next/server";
import type { Schema } from "@/lib/validation";

export type RouteContext<TParams> = {
  params: Promise<TParams>;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

type ErrorInfo = { code?: string; status?: number; message?: string };

const isProd = process.env.NODE_ENV === "production";

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

function readErrorInfo(err: unknown): ErrorInfo {
  if (!err || typeof err !== "object") {
    return {};
  }

  const record = err as Record<string, unknown>;

  return {
    code: typeof record.code === "string" ? record.code : undefined,
    status: typeof record.status === "number" ? record.status : undefined,
    message: typeof record.message === "string" ? record.message : undefined,
  };
}

export function jsonOk<T>(data: T, status = 200, headers?: HeadersInit) {
  const body: ApiSuccess<T> = { success: true, data };
  return NextResponse.json(body, {
    status,
    headers: mergeHeaders(headers),
  });
}

export function jsonError(
  code: string,
  message: string,
  status = 400,
  headers?: HeadersInit
) {
  const body: ApiError = { success: false, error: { code, message } };
  return NextResponse.json(body, {
    status,
    headers: mergeHeaders(headers),
  });
}

export function jsonErrorFromException(
  err: unknown,
  fallbackCode = "internal_error",
  fallbackStatus = 500
) {
  const info = readErrorInfo(err);
  const message =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : info.message ?? "Unknown error";
  const code = info.code ?? fallbackCode;
  const status = info.status ?? fallbackStatus;

  if (!isProd) {
    if (err instanceof Error) {
      throw err;
    }
    if (err && typeof err === "object") {
      throw err;
    }
    throw new Error(message);
  }

  return jsonError(code, message, status);
}

export function assertResponseShape<T>(schema: Schema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(String(result.error));
  }
  return result.data;
}

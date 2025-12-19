/**
 * @fileoverview HTTP utilities for Raider Pal API responses
 *
 * Provides standardized JSON response formatting, error handling, and validation
 * for Next.js API routes. Ensures consistent API envelopes and proper error responses.
 */

import { NextResponse } from "next/server";
import type { Schema } from "@/lib/validation";

/**
 * Route context type for Next.js API routes with typed parameters
 */
export type RouteContext<TParams> = {
  params: Promise<TParams>;
};

/**
 * Successful API response envelope
 */
export type ApiSuccess<T> = { success: true; data: T };

/**
 * Error API response envelope
 */
export type ApiError = { success: false; error: { code: string; message: string } };

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/**
 * Internal error information structure
 */
type ErrorInfo = { code?: string; status?: number; message?: string };

const isProd = process.env.NODE_ENV === "production";

const defaultJsonHeaders = Object.freeze({
  "Content-Type": "application/json",
});

/**
 * Merges custom headers with default JSON headers
 * @param headers - Additional headers to include
 * @returns Merged Headers object
 */
function mergeHeaders(headers?: HeadersInit) {
  const merged = new Headers(defaultJsonHeaders);

  if (headers) {
    new Headers(headers).forEach((value, key) => merged.set(key, value));
  }

  return merged;
}

/**
 * Formats validation error messages for user-friendly display
 * @param error - Raw validation error string
 * @returns Cleaned error message
 */
export function formatValidationError(error: string): string {
  return error.replace(/\[|\]/g, "").trim();
}

/**
 * Extracts error information from unknown error objects
 * @param err - Error object to parse
 * @returns Structured error information
 */
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

/**
 * Creates a successful JSON response with standardized envelope
 * @param data - Response data to include
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional response headers
 * @returns NextResponse with success envelope
 */
export function jsonOk<T>(data: T, status = 200, headers?: HeadersInit) {
  const body: ApiSuccess<T> = { success: true, data };
  return NextResponse.json(body, {
    status,
    headers: mergeHeaders(headers),
  });
}

/**
 * Creates an error JSON response with standardized envelope
 * @param code - Error code identifier
 * @param message - Human-readable error message
 * @param status - HTTP status code (default: 400)
 * @param headers - Additional response headers
 * @returns NextResponse with error envelope
 */
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

/**
 * Creates an error response from an exception, with development re-throwing
 * @param err - Exception to convert to API error
 * @param fallbackCode - Default error code if none provided
 * @param fallbackStatus - Default HTTP status if none provided
 * @returns NextResponse with error envelope
 */
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

/**
 * Validates response data against a schema, throwing on validation failure
 * @param schema - Zod schema to validate against
 * @param payload - Data to validate
 * @returns Validated data with correct TypeScript type
 * @throws Error if validation fails
 */
export function assertResponseShape<T>(schema: Schema<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(String(result.error));
  }
  return result.data;
}

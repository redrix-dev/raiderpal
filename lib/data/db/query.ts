import { createAnonClient } from "@/lib/supabase";
import type {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
} from "@supabase/supabase-js";

export class DataQueryError extends Error {
  constructor(message: string, readonly kind: "db_contract" | "db_error") {
    super(message);
    this.name = "DataQueryError";
  }
}

function parseRows<T>(result: PostgrestResponse<T>, relation: string): T[] {
  if (result.error) {
    throw new DataQueryError(
      `Invalid row 0 for relation '${relation}': ${String(result.error)}`,
      "db_contract"
    );
  }

  if (!Array.isArray(result.data)) {
    throw new DataQueryError(
      `Unexpected payload for relation '${relation}': ${String(result.data)}`,
      "db_contract"
    );
  }

  return result.data ?? [];
}

function parseSingle<T>(
  result: PostgrestMaybeSingleResponse<T>,
  relation: string
): T | null {
  if (result.error) {
    throw new DataQueryError(
      `Invalid row 0 for relation '${relation}': ${String(result.error)}`,
      "db_contract"
    );
  }

  if (result.data === null) return null;
  return result.data as T;
}

export async function queryView<T>(
  relation: string,
  select: string
): Promise<T[]> {
  const supabase = createAnonClient();
  const result = await supabase.from(relation).select(select);

  if (result.error) {
    throw new DataQueryError(
      `Failed to query relation '${relation}': ${result.error.message}`,
      "db_error"
    );
  }

  return parseRows<T>(result, relation);
}

export async function queryViewMaybeSingle<T>(
  relation: string,
  select: string
): Promise<T | null> {
  const supabase = createAnonClient();
  const result = await supabase.from(relation).select(select).maybeSingle();

  if (result.error) {
    throw new DataQueryError(
      `Failed to query relation '${relation}': ${result.error.message}`,
      "db_error"
    );
  }

  return parseSingle<T>(result, relation);
}

import type { PostgrestError, PostgrestFilterBuilder } from "@supabase/postgrest-js";
import type { Schema } from "@/lib/validation";
import { createSupabaseServerClient } from "./server";
import type { ViewContract } from "./contracts";

type FilterBuilder = PostgrestFilterBuilder<any, any, any, any>;
type QueryBuilder = (query: FilterBuilder) => FilterBuilder;

export class DataQueryError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "db_error", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function formatErrorMessage(relation: string, select: string, error: PostgrestError) {
  const code = error.code ? `[${error.code}] ` : "";
  return `${code}Supabase query failed for relation '${relation}' (select: ${select}): ${error.message}`;
}

function parseRows<T>(
  schema: Schema<T>,
  rows: unknown[],
  relation: string,
  select: string
): T[] {
  const parsed: T[] = [];

  for (let i = 0; i < rows.length; i++) {
    const result = schema.safeParse(rows[i]);
    if (!result.success) {
      throw new DataQueryError(
        `Invalid row ${i} for relation '${relation}' (select: ${select}): ${result.error}`,
        "db_contract"
      );
    }
    parsed.push(result.data);
  }

  return parsed;
}

function parseSingle<T>(
  schema: Schema<T>,
  row: unknown,
  relation: string,
  select: string
): T {
  const result = schema.safeParse(row);
  if (!result.success) {
    throw new DataQueryError(
      `Invalid row for relation '${relation}' (select: ${select}): ${result.error}`,
      "db_contract"
    );
  }
  return result.data;
}

export async function queryView<T>(
  contract: ViewContract<T>,
  build?: QueryBuilder
): Promise<T[]> {
  const supabase = createSupabaseServerClient();
  let query = supabase.from(contract.relation).select(contract.select);

  if (build) {
    query = build(query);
  }

  const { data, error } = await query;

  if (error) {
    throw new DataQueryError(
      formatErrorMessage(contract.relation, contract.select, error),
      "db_error"
    );
  }

  return parseRows(
    contract.schema,
    (data ?? []) as unknown[],
    contract.relation,
    contract.select
  );
}

export async function queryViewMaybeSingle<T>(
  contract: ViewContract<T>,
  build?: QueryBuilder
): Promise<T | null> {
  const supabase = createSupabaseServerClient();
  let query = supabase.from(contract.relation).select(contract.select);

  if (build) {
    query = build(query);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new DataQueryError(
      formatErrorMessage(contract.relation, contract.select, error),
      "db_error"
    );
  }

  if (!data) {
    return null;
  }

  return parseSingle(contract.schema, data, contract.relation, contract.select);
}

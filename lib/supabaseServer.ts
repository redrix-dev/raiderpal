import { createClient } from "@supabase/supabase-js";

/**
 * Anon client intended for public, read-mostly endpoints governed by RLS.
 */
export function createServerClient() {
  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * Service role client bypasses RLS. Use only for trusted server-side tasks
 * (ingestion, administration) and never expose it to the browser.
 */
export function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

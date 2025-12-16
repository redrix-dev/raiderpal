import "server-only";
import { createClient } from "@supabase/supabase-js";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase environment is not configured");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
    global: { fetch: noStoreFetch },
  });
}

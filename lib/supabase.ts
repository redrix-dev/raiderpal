import "server-only";
import { createClient } from "@supabase/supabase-js";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export function createAnonClient() {
  const url =
    process.env.SUPABASEURL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASEANONKEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error(
      "Missing Supabase config: set SUPABASE_URL and SUPABASE_ANON_KEY (or NEXT_PUBLIC variants)"
    );

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

export function createServiceClient() {
  const url =
    process.env.SUPABASEURL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASESERVICEROLEKEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key)
    throw new Error(
      "Missing Supabase service key: set SUPABASE_SERVICE_ROLE_KEY if service access is required"
    );

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

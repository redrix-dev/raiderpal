import "server-only";
import { createClient } from "@supabase/supabase-js";

const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

export function createAnonClient() {
  const url = process.env.SUPABASEURL;
  const key = process.env.SUPABASEANONKEY;
  if (!url || !key) throw new Error("Missing Supabase config");

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

export function createServiceClient() {
  const url = process.env.SUPABASEURL;
  const key = process.env.SUPABASESERVICEROLEKEY;
  if (!url || !key) throw new Error("Missing Supabase service key");

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

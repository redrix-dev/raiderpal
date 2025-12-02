import { createClient } from "@supabase/supabase-js";

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

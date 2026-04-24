import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Singleton — one instance per browser tab prevents Web Lock contention
// when multiple callers (HMR, concurrent renders) hit createClient() at once.
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}

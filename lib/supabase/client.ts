import { createBrowserClient } from "@supabase/ssr";

//This gives your Client Components a Supabase client that can talk to Auth
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

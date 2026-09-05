import { createClient } from "@/lib/supabase/server";

export async function requireUserId() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

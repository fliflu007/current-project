import { createClient } from "../supabase/server";
import { cache } from "react";

export async function requireUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      {
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        },
      },
      { status: 401 },
    );
  }

  return user;
}

export async function requireUserId() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  console.log("USER:", data.user?.id);
  console.log("AUTH ERROR:", error?.message);

  if (error || !data.user) {
    return null;
  }
  return data.user.id;
}

export const requireUserIdCached = cache(requireUserId);

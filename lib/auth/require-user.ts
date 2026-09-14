import { createClient } from "../supabase/server";
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

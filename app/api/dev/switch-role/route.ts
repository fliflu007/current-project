import z from "zod";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const roleSchema = z.object({
  role: z.enum(["admin", "staff", "viewer"]),
});

export async function POST(request: Request) {
  const body = await request.json();

  const cleanData = roleSchema.parse(body);

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
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

  const [profile] = await db
    .update(profiles)
    .set({
      role: cleanData.role,
    })
    .where(eq(profiles.id, user.id))
    .returning();

  if (!profile) {
    return Response.json(
      {
        data: null,
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Profile not found",
        },
      },
      { status: 404 },
    );
  }

  return Response.json(
    {
      data: profile,
      error: null,
    },
    { status: 200 },
  );
}

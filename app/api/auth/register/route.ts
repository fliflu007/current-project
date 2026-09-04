import z from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { companies, profiles } from "@/db/schema";

const registerSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  const body = await request.json();

  const cleanData = registerSchema.parse(body);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: cleanData.email,
    password: cleanData.password,
  });

  if (error || !data.user) {
    return Response.json(
      {
        data: null,
        error: {
          code: "AUTH_ERROR",
          message: "Registration failed",
        },
      },
      { status: 400 },
    );
  }

  const [company] = await db
    .insert(companies)
    .values({
      name: cleanData.companyName,
    })
    .returning();

  if (!company) {
    return Response.json(
      {
        data: null,
        error: {
          code: "COMPANY_CREATION_FAILED",
          message: "Company could not be created",
        },
      },
      { status: 500 },
    );
  }

  const [profile] = await db
    .insert(profiles)
    .values({
      id: data.user.id,
      companyId: company.id,
      role: "admin",
    })
    .returning();
  if (!profile) {
    return Response.json(
      {
        data: null,
        error: {
          code: "PROFILE_CREATION_FAILED",
          message: "Profile could not be created",
        },
      },
      { status: 500 },
    );
  }

  return Response.json(
    {
      data: {
        user: data.user,
        company,
        profile,
      },
      error: null,
    },
    { status: 201 },
  );
}

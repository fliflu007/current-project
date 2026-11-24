import z from "zod";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { companies, profiles } from "@/db/schema";
import {
  internalServerErrorResponse,
  validationErrorResponse,
} from "@/lib/api/response";

const registerSchema = z.object({
  companyName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  let body: unknown;

  // 1. Read request body
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse("Invalid JSON body");
  }

  // 2. Validate request data
  const cleanData = registerSchema.safeParse(body);

  if (!cleanData.success) {
    return validationErrorResponse("Invalid registration data");
  }

  // 3. Register user and create company/profile
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: cleanData.data.email,
      password: cleanData.data.password,
    });

    // Supabase returned an authentication error
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

    // 4. Create company
    const [company] = await db
      .insert(companies)
      .values({
        name: cleanData.data.companyName,
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

    // 5. Create admin profile
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

    // 6. Registration successful
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
  } catch {
    // Unexpected Supabase or database exception
    return internalServerErrorResponse();
  }
}

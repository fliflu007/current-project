import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InternalServerError } from "../api/api.error";

export async function requireUserContext(userId: string) {
  const [profile] = await db
    .select({
      companyId: profiles.companyId,
      role: profiles.role,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile) {
    throw new InternalServerError("User profile not found");
  }

  return profile;
}

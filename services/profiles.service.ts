// Todo : implement erroring class
import { eq, inArray, and } from "drizzle-orm";
import { profiles } from "@/db/schema";
import { db } from "@/db";
import { Role } from "@/lib/actions/switch-role";

export async function getCompanyId(userId: string) {
  const result = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!result[0]) {
    throw new Error("Profile not found");
  }

  return result[0].companyId;
}

export async function updateUserRole(userId: string, role: Role) {
  const result = await db
    .update(profiles)
    .set({ role })
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id });

  if (!result[0]) {
    throw new Error("Profile not found");
  }

  return result[0];
}

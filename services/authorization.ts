import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";

export async function requireRole(userId: string, role: string[]) {
  // call DB for role
  const [profile] = await db
    .select({ role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (!profile) return false;

  if (!role.includes(profile.role)) return false;
  return true;
}

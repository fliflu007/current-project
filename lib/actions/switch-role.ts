"use server";

import { updateUserRole } from "@/services/profiles.service";
import { unauthorizedResponse } from "../api/response";
import { requireUserId } from "../auth/require-user";

export type Role = "admin" | "staff" | "viewer";

export async function switchRole(role: Role) {
  const userId = await requireUserId();

  if (!userId) {
    return {
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      },
    };
  }

  try {
    await updateUserRole(userId, role);

    return {
      data: { success: true },
      error: null,
    };
  } catch (error) {
    console.error("SWITCH ROLE ERROR:", error);

    return {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to update role",
      },
    };
  }
}

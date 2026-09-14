"use server";

import { createClient } from "../supabase/server";
import { redirect } from "next/navigation";

export async function logOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Logout failed:", error);
    return;
  }

  redirect("/login");
}

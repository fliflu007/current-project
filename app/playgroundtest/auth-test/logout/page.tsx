"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import React from "react";

export default function page() {
  async function logOut() {
    console.log("TEST logout");
    const superbase = createClient();

    const { error } = await superbase.auth.signOut();

    if (error) {
      console.log("Logout failed:", error);
    } else {
      console.log("Logout successful");
    }
  }
  return (
    <div>
      <Button onClick={logOut}>Logout</Button>
    </div>
  );
}

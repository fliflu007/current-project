import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Switcher from "@/components/auth/switcher";

export default async function page() {
  // is the cerate client user or sever both return promises ?
  // need recpa what is asyn what not .
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // redirect
    console.log("your are not logged bro");
  }

  return (
    <div>
      <Switcher></Switcher>
      <h1> this is the dashboard </h1>
    </div>
  );
}

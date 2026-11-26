import React from "react";
import Navbar from "@/components/navigation/navbar";
import CreateProductForm from "./components/create-product-form";
import { requireUserIdCached } from "@/lib/auth/require-user";
import { requireUserContextCached } from "@/lib/auth/require-user-context";
import { redirect } from "next/navigation";

export default async function page() {
  const user = await requireUserIdCached();
  if (user === null) {
    redirect("/login");
  }

  const { role } = await requireUserContextCached(user as string);
  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        <main className="w-full ">
          <CreateProductForm />
        </main>
      </div>
    </div>
  );
}

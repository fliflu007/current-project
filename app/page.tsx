import Navbar from "@/components/navbar";

import ProductUtilityBar from "@/components/product-utility-bar";
import ProductCard from "@/components/product-card";
import ProductToolbar from "@/components/product-toolbar";

import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await requireUser();
  if (user instanceof Response) {
    redirect("/login");
  }

  return (
    <div>
      <Navbar></Navbar>
      <ProductToolbar></ProductToolbar>
      <ProductUtilityBar />
      <div className="grid grid-cols-1 lg:grid-cols-2  2xl:grid-cols-3 gap-6 container mx-auto">
        <ProductCard />
        <ProductCard />
        <ProductCard />
        <ProductCard />
      </div>
    </div>
  );
}

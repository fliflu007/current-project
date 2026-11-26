import Navbar from "@/components/navigation/navbar";
import { requireUserContextCached } from "@/lib/auth/require-user-context";
import { requireUserIdCached } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import ProductToolbar from "@/components/products/product-toolbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserIdCached();
  // if null , redirect to Login or signup
  if (!user) {
    redirect("/login");
  }
  const { role } = await requireUserContextCached(user);

  return (
    <>
      <div className="sticky top-0 z-40 bg-background">
        <Navbar role={role as "admin" | "staff" | "viewer"} />
        <ProductToolbar role={role as "admin" | "staff" | "viewer"} />
      </div>

      {children}
    </>
  );
}

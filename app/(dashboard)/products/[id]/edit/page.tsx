import ProductEditForm from "@/components/products/product-edit-form";
import { notFound, redirect } from "next/navigation";
import { requireUserIdCached } from "@/lib/auth/require-user";
import { requireUserContextCached } from "@/lib/auth/require-user-context";
import {
  getProductById,
  getProductImageData,
} from "@/services/products.service";
import z from "zod";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  /// auth
  const userId = await requireUserIdCached();
  // authorisation
  const { role, companyId } = await requireUserContextCached(userId as string);
  if (role !== "admin") {
    redirect("/dashboard");
  }

  // fetch all data and show in console.
  const { id } = await params;

  const parsedId = z.string().uuid().safeParse(id);

  if (!parsedId.success) {
    notFound();
  }

  // fetch product
  const productData = await getProductById(parsedId.data, companyId);

  if (!productData) {
    notFound();
  }

  // get all image Data
  const productImages = await getProductImageData(id);
  // normalise for component
  const product = { ...productData, images: productImages };

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        <main className="flex flex-1 my-10 justify-center">
          <div className="w-136 overflow-visible">
            <ProductEditForm product={product} />
          </div>
        </main>
      </div>
    </div>
  );
}

import Navbar from "@/components/navbar";

import ProductToolbar from "@/components/product-toolbar";

import ProductViewer from "@/components/product-viewer";
import { requireUserId } from "@/lib/auth/require-user";
import { redirect, notFound } from "next/navigation";
import z from "zod";
import { db } from "@/db";
import { products, profiles } from "@/db/schema";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { productImages } from "@/db/schema";
import { ProductDetailUI } from "./type";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function page({ params }: PageProps) {
  const idParam = await params;

  const user = await requireUserId();
  console.log(user);
  if (user === null) {
    redirect("/login");
  }

  const product = idParam.id;

  const productId = z.string().uuid().safeParse(product);
  console.log("productid:", productId);
  if (!productId.success) {
    notFound();
  }

  // 3. Get the user's company ID // to make sure it should be accessible.
  const result = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, user));

  if (result.length === 0) {
    throw new Error("USer not associated to any company");
  }
  const companyId = result[0].companyId;

  const productdata = await db
    .select()
    .from(products)
    .where(
      and(eq(products.id, productId.data), eq(products.companyId, companyId)),
    );
  if (productdata.length === 0) {
    notFound();
  }

  const product1 = productdata[0];
  console.log("product data : ", productdata);
  console.log("company id", companyId);

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId.data));

  if (images.length == 0) {
    throw new Error("Product image not found");
  }

  // 6.  NOT FOR NOW => Fetch the product's movement history

  // 7. Pass the data to the display components
  const productDetail: ProductDetailUI = { data: product1, images: images };
  console.log(productDetail);

  return (
    <div>
      <Navbar isLoggedIn={true} />
      <div className="mb-8">
        <ProductToolbar></ProductToolbar>
      </div>
      <ProductViewer productDetail={productDetail} />
    </div>
  );
}

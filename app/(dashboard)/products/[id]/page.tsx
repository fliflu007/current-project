import ProductToolbar from "@/components/products/product-toolbar";
import ProductViewer from "@/components/products/product-detail-viewer";
import { requireUserIdCached } from "@/lib/auth/require-user";
import { redirect, notFound } from "next/navigation";
import z from "zod";
import { db } from "@/db";
import { products, profiles } from "@/db/schema";
import { and } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { productImages } from "@/db/schema";
import { ProductDetailUI } from "./type";
import { inventoryMovements } from "@/db/schema";
import { requireUserContextCached } from "@/lib/auth/require-user-context";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function page({ params }: PageProps) {
  const idParam = await params;

  const user = await requireUserIdCached();
  if (user === null) {
    redirect("/login");
  }

  const { companyId, role } = await requireUserContextCached(user);
  const typedRole = role as UserRole;

  const product = idParam.id;

  const productId = z.string().uuid().safeParse(product);
  console.log("productid:", productId);
  if (!productId.success) {
    notFound();
  }

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

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId.data));

  if (images.length == 0) {
    // Unexpected Error Every product must have at least ONE IMAGE
    // Might be Adjusted later
    notFound();
  }

  // 6.  NOT FOR NOW => Fetch the product's movement history
  const perpage = 20;
  const historicalMovements = await db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.productId, productId.data))
    .limit(perpage);

  // 7. Pass the data to the display components
  const productDetail: ProductDetailUI = { data: product1, images: images };

  return (
    <div>
      <div className="mb-8">
        <ProductToolbar></ProductToolbar>
      </div>
      <ProductViewer
        productDetail={productDetail}
        historicalMovements={historicalMovements}
        perpage={perpage}
        role={typedRole}
      />
    </div>
  );
}

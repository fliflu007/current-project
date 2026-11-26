import ProductToolbar from "@/components/products/product-toolbar";

import { ProductViewer } from "@/components/products/product-detail-viewer";

import { requireUserIdCached } from "@/lib/auth/require-user";
import { requireUserContextCached } from "@/lib/auth/require-user-context";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { products, productImages, inventoryMovements } from "@/db/schema";
import { and, eq, desc, count } from "drizzle-orm";
import { z } from "zod";
import { ProductDetailUI } from "./type";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    perPage?: string;
  }>;
};

const pageSizeSchema = z.coerce
  .number()
  .int()
  .refine((value) => [5, 10, 20, 50].includes(value));

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  const search = await searchParams;

  // Authentication
  const user = await requireUserIdCached();

  if (!user) {
    redirect("/login");
  }

  const { companyId, role } = await requireUserContextCached(user);

  const typedRole = role as UserRole;

  // Validate product ID
  const productId = z.string().uuid().safeParse(id);

  if (!productId.success) {
    notFound();
  }

  // Fetch product
  const productdata = await db
    .select()
    .from(products)
    .where(
      and(eq(products.id, productId.data), eq(products.companyId, companyId)),
    );

  if (productdata.length === 0) {
    notFound();
  }

  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId.data));

  if (images.length === 0) {
    notFound();
  }

  // Pagination parameters
  const parsedPage = Number(search.page ?? 1);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const parsedPerPage = pageSizeSchema.safeParse(search.perPage ?? "20");

  const perPage = parsedPerPage.success ? parsedPerPage.data : 20;

  // Count total movements
  const [movementCount] = await db
    .select({ total: count() })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.productId, productId.data));

  const totalMovements = movementCount.total;
  const totalPages = Math.ceil(totalMovements / perPage);

  // Keep page within available range
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);

  const offset = (currentPage - 1) * perPage;

  // Fetch current page, newest first
  const historicalMovements = await db
    .select()
    .from(inventoryMovements)
    .where(eq(inventoryMovements.productId, productId.data))
    .orderBy(desc(inventoryMovements.createdAt))
    .limit(perPage)
    .offset(offset);

  const productDetail: ProductDetailUI = {
    data: productdata[0],
    images,
  };

  return (
    <div>
      <div className="mb-8">
        <ProductToolbar role={typedRole} />
      </div>

      <ProductViewer
        productDetail={productDetail}
        historicalMovements={historicalMovements}
        perpage={perPage}
        currentPage={currentPage}
        totalPages={totalPages}
        totalMovements={totalMovements}
        role={typedRole}
      />
    </div>
  );
}

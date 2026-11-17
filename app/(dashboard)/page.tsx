import Navbar from "@/components/navigation/navbar";
import ProductUtilityBar from "@/components/products/product-utility-bar";
import ProductCard from "@/components/products/product-card";
import ProductToolbar from "@/components/products/product-toolbar";
import { requireUserId } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import { db } from "@/db";
import z from "zod";
import { eq, and, inArray, count, ilike } from "drizzle-orm";
import { products, productImages } from "@/db/schema";
import { requireUserContext } from "@/lib/auth/require-user-context";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

const pageSize = 10;

export default async function Page({ searchParams }: PageProps) {
  // if not will be undefined.
  const params = await searchParams;
  const user = await requireUserId();
  if (!user) {
    redirect("/login");
  }
  const { companyId, role } = await requireUserContext(user);

  const pageParam = z.coerce.number().int().positive().safeParse(params.page);
  let page: number;
  page = !pageParam.success ? 1 : pageParam.data;

  const searchParam = z.string().safeParse(params.search);

  const search = searchParam.success ? searchParam.data : "";

  // get quantity of product
  const [{ productSum }] = await db
    .select({ productSum: count() })
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        ilike(products.name, `%${search}%`),
      ),
    );

  // identify last page value
  const lastPage = Math.ceil(productSum / pageSize);

  /// DEFINE PAGE
  // Page params > existingpage
  if (page > lastPage) {
    page = lastPage;
  }
  // NO PRODUCT YET scenario
  if (lastPage === 0) {
    page = 1;
  }
  // page offset call start at 0
  const offset = (page - 1) * pageSize;

  /// GET PRODUCT LIST
  // could (condition) it but gain for this call is tiny
  const productList = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        ilike(products.name, `%${search}%`),
      ),
    )
    .limit(pageSize)
    .offset(offset);

  const productIds = productList.map((product) => product.id);

  // GET PRODUCT IMAGES INFO
  // getImage ProductID and url of Primary Image only.
  const mainImages = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
    })
    .from(productImages)
    .where(
      and(
        inArray(productImages.productId, productIds),
        eq(productImages.isPrimary, true),
      ),
    );

  // GROUP IMAGE DATA AND IMAGES
  const productsWithImages = productList.map((product) => {
    const mainImage = mainImages.find(
      (image) => image.productId === product.id,
    );
    if (!mainImage) {
      throw new Error("Product has no primary image");
    }
    return {
      ...product,
      mainImageUrl: mainImage.url,
    };
  });

  return (
    <div>
      <Navbar role={role as "admin" | "staff" | "viewer"} />
      <ProductToolbar />

      <div className="container mx-auto">
        <ProductUtilityBar currentPage={page} lastPage={lastPage} />

        {productSum < 1 ? (
          <div className="flex min-h-100 items-center justify-center">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
            {productsWithImages.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

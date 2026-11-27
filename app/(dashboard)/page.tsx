import ProductUtilityBar from "@/components/products/product-utility-bar";
import ProductCard from "@/components/products/product-card";
import ProductToolbar from "@/components/products/product-toolbar";
import { db } from "@/db";
import z from "zod";
import { eq, and, inArray, count, ilike } from "drizzle-orm";
import { products, productImages } from "@/db/schema";
import { requireUserContextCached } from "@/lib/auth/require-user-context";
import { requireUserIdCached } from "@/lib/auth/require-user";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

const pageSize = 15;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const user = await requireUserIdCached();

  const { companyId, role } = await requireUserContextCached(user as string);
  const typedRole = role as "admin" | "staff" | "viewer";

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

  // list of product ID
  const productIds = productList.map((product) => product.id);

  // bring image image and with is mainstatus as []
  const allImages = await db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      isPrimary: productImages.isPrimary,
    })
    .from(productImages)
    .where(and(inArray(productImages.productId, productIds)));

  // associate objectData with its image array
  const productsWithImages = productList.map((product) => {
    const images = allImages.filter((image) => image.productId === product.id);

    return {
      ...product,
      images,
    };
  });

  return (
    <div>
      <div className="sticky top-22 z-50 bg-background shadow-sm">
        <div className="container mx-auto">
          <ProductUtilityBar currentPage={page} lastPage={lastPage} />
        </div>
      </div>
      <div className="container mx-auto">
        {productSum < 1 ? (
          <div className="flex min-h-100 items-center justify-center">
            <p className="text-muted-foreground">No products found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pt-4">
            {productsWithImages.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                role={typedRole}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

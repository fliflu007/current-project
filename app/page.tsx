import Navbar from "@/components/navbar";

import ProductUtilityBar from "@/components/product-utility-bar";
import ProductCard from "@/components/product-card";
import ProductToolbar from "@/components/product-toolbar";

import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import { db } from "@/db";
import z from "zod";
import { eq, and, inArray, count } from "drizzle-orm";
import { products, profiles, productImages } from "@/db/schema";

type PageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const pageSize = 10;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  const user = await requireUser();
  if (user instanceof Response) {
    redirect("/login");
  }

  // validate
  const pageParam = z.coerce.number().int().positive().safeParse(params.page);
  const page = pageParam.success ? pageParam.data : 1;

  // offset 0= 1->20
  const offset = (page - 1) * pageSize;

  // get the Company id from userid
  const companyResult = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (companyResult.length === 0) {
    throw new Error("Issue USer with no company assigned in DB ? ");
  }

  const companyId = companyResult[0].companyId;

  // call the db for product list
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.companyId, companyId))
    .limit(pageSize)
    .offset(offset);

  const [{ totalProducts }] = await db
    .select({ totalProducts: count() })
    .from(products)
    .where(eq(products.companyId, companyId));

  const lastPage = totalProducts / pageSize;

  const productIds = productList.map((product) => product.id);

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

  // COMBINE
  const productsWithImages = productList.map((product) => {
    const mainImage = mainImages.find(
      (image) => image.productId === product.id,
    );
    return {
      ...product,
      mainImageUrl: mainImage?.url ?? null,
    };
  });

  console.log("product list coming", productList);

  return (
    <div>
      <Navbar></Navbar>
      <ProductToolbar></ProductToolbar>
      <ProductUtilityBar currentPage={page} lastPage={lastPage} />
      <div className="grid grid-cols-1 lg:grid-cols-2  2xl:grid-cols-3 gap-6 container mx-auto">
        {productsWithImages.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

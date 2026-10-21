import Navbar from "@/components/navbar";

import ProductUtilityBar from "@/components/products/product-utility-bar";
import ProductCard from "@/components/product-card";
import ProductToolbar from "@/components/product-toolbar";

import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";
import { db } from "@/db";
import z from "zod";
import { eq, and, inArray, count, ilike } from "drizzle-orm";
import { products, profiles, productImages } from "@/db/schema";

type PageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
  }>;
};

const pageSize = 10;

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;

  // here i need to get the query and : assign to search variable

  const user = await requireUser();
  if (user instanceof Response) {
    redirect("/login");
  }

  // QueryValidation
  const pageParam = z.coerce.number().int().positive().safeParse(params.page);
  let page = pageParam.success ? pageParam.data : 1;
  const searchParam = z.string().safeParse(params.search);
  const search = searchParam.success ? searchParam.data : "";

  // get the Companyid from userid
  const companyResult = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  if (companyResult.length === 0) {
    throw new Error("Issue user with no company assigned in DB... ");
  }

  const companyId = companyResult[0].companyId;

  // get Sum
  const [{ productSum }] = await db
    .select({ productSum: count() })
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        ilike(products.name, `%${search}%`),
      ),
    );

  const lastPage = Math.ceil(productSum / pageSize);

  // if page requested too high show furthest page
  if (page > lastPage) {
    page = lastPage;
  }

  // NO PRODUCT YET scenario
  if (lastPage === 0) {
    page = 1;
  }

  // page offset call start at 0
  const offset = (page - 1) * pageSize;

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

  // getImage url, isprimary for each product.
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

  // all data for ProductCard for eAch product Card component.
  const productsWithImages = productList.map((product) => {
    const mainImage = mainImages.find(
      (image) => image.productId === product.id,
    );
    return {
      ...product,
      mainImageUrl: mainImage?.url ?? null,
    };
  });

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

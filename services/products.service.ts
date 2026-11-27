import { products } from "@/db/schema";
import { CreateProductInput } from "@/schemas/product";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { productImages, inventoryMovements } from "@/db/schema";
import { ConflictError } from "@/lib/api/errors";
import { CreateProductData } from "@/schemas/product";
import { PatchProductDataApi } from "@/app/(dashboard)/products/[id]/edit/patch-types-schema";
import { NotFoundError } from "@/lib/api/errors";

export async function insertProductDb(
  productData: CreateProductData,
  companyId: string,
) {
  try {
    console.log("try to injectio data inDB");
    const [product] = await db
      .insert(products)
      .values({
        companyId,
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity.toString(),
        barcode: productData.barcode?.trim() || null,
      })
      .returning();
    console.log("injecting happened no ERROR");

    return product;
   } catch (error) {
    console.log("Error as productdata dB insertion");
    if (
      typeof error === "object" &&
      error !== null &&
      "cause" in error &&
      error.cause &&
      typeof error.cause === "object" &&
      "code" in error.cause &&
      error.cause.code === "23505"
    ) {
      const constraint =
        "constraint" in error.cause ? String(error.cause.constraint) : "";
      if (constraint.includes("barcode")) {
        throw new ConflictError("A product with this barcode already exists.");
      }
      console.log("throwinr ConflictError");
      throw new ConflictError("A product with this name already exists.");
    }

    throw error;
  }
}

export async function createProduct(
  companyId: string,
  data: CreateProductInput,
) {
  // products
  const result = await db
    .insert(products)
    .values({
      ...data,
      companyId,
      quantity: String(data.quantity),
    })
    .returning();
  const productId = result[0].id;

  const test = data.images.map(async (image) => {
    const res2 = await db.insert(productImages).values({
      productId,
      url: image.url,
      publicId: image.publicId,
      isPrimary: image.isMain,
    });
  });

  await Promise.all(test);
  // create inventory line
  await db.insert(inventoryMovements).values({
    productId,
    type: "IN",
    quantity: String(data.quantity),
    comment: "Initial stock",
  });

  return {
    ...result[0],
    quantity: Number(result[0].quantity),
  };
}

export async function getProducts(companyId: string) {
  const data = await db
    .select()
    .from(products)
    .where(eq(products.companyId, companyId));

  return data.map((product) => ({
    ...product,
    quantity: Number(product.quantity),
  }));
}

export async function getProductById(id: string, companyId: string) {
  const data = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.companyId, companyId)));

  if (!data[0]) {
    return null;
  }

  return {
    ...data[0],
    quantity: Number(data[0].quantity),
  };
}

export async function deleteProduct(id: string) {
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  const product = result[0];

  if (!product) return null;

  return {
    ...product,
    quantity: Number(product.quantity),
  };
}

export async function getProductImageData(productId: string) {
  const data = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));

  return data;
}

export async function updateProductDetails(
  productId: string,
  data: PatchProductDataApi,
) {
  if (data.barcode !== undefined) {
    (data as any).barcode = data.barcode?.trim() || null;
  }
  const [updatedProducts] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, productId))
    .returning();

  if (!updatedProducts) {
    throw new Error("not able to patch product details");
  }

  return updatedProducts;
}

export async function setPrimaryImage(imageId: string) {
  const result = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));
  if (!result.length) {
    return null;
  }
  const imageraw = result[0];
  const productId = imageraw.productId;

  await db.transaction(async (tx) => {
    await tx
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, productId));

    await tx
      .update(productImages)
      .set({ isPrimary: true })
      .where(eq(productImages.id, imageId));
  });
  return { success: true };
}

export async function deleteImageDB(publicId: string) {
  await db.delete(productImages).where(eq(productImages.publicId, publicId));
}

export async function setPrimaryImageByPublicID(
  publicId: string,
  productId: string,
) {
  // set the publicId

  await db.transaction(async (tx) => {
    await tx
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, productId));

    await tx
      .update(productImages)
      .set({ isPrimary: true })
      .where(
        and(
          eq(productImages.publicId, publicId),
          eq(productImages.productId, productId),
        ),
      );
  });
  return { success: true };
}

export async function addImagesToDB(
  images: {
    url: string;
    publicId: string;
    isPrimary: boolean;
  }[],
  id: string,
) {
  // loop remove image from db
  for (const image of images) {
    await db.insert(productImages).values({ ...image, productId: id });
  }
}

export async function getProductByBarcode(barcode: string, companyId: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.companyId, companyId),
        eq(products.barcode, barcode),
      ),
    )
    .limit(1);

  if (!product) return null;

  return {
    ...product,
    quantity: Number(product.quantity),
  };
}
export async function getProductForCompany(
  productId: string,
  companyId: string,
) {
  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.companyId, companyId)))
    .limit(1);

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
}

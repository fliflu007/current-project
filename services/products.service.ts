import { products } from "@/db/schema";
import { CreateProductInput, PatchProductInput } from "@/types/product";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { profiles } from "@/db/schema";
import { productImages, inventoryMovements } from "@/db/schema";

export async function getCompanyId(userId: string) {
  const result = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!result[0]) {
    throw new Error("Profile not found");
  }

  return result[0].companyId;
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

export async function getProducts() {
  const data = await db.select().from(products);

  return data.map((product) => ({
    ...product,
    quantity: Number(product.quantity),
  }));
}

export async function getProductById(id: string) {
  const data = await db.select().from(products).where(eq(products.id, id));

  if (!data[0]) {
    return null;
  }

  return {
    ...data[0],
    quantity: Number(data[0].quantity),
  };
}



  const result = await db
    .update(products)
    .set(dbData)
    .where(eq(products.id, id))
    .returning();

  const product = result[0];

  if (!product) {
    return null;
  }

  return {
    ...product,
    quantity: Number(product.quantity),
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

import { PatchProductServiceInput } from "@/types/product";


export async function patchProduct(input:  PatchProductServiceInput) {

  // 1. Find product

  // 2. If productData exists → update product

  // 3. If existingImages exists → synchronize existing images

  // 4. If newImages exists → upload + create image records

  // 5. Return updated product


}

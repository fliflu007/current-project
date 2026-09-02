import { products } from "@/db/schema";
import { CreateProductInput, PatchProductInput } from "@/types/product";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export async function createProduct(
  companyId: string,
  data: CreateProductInput,
) {
  // no business check

  // trigger DB
  const result = await db
    .insert(products)
    .values({
      ...data,
      companyId,
      quantity: String(data.quantity),
    })
    .returning();

  // format the Quantity into Number
  // return Data
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

export async function patchProduct(id: string, cleanData: PatchProductInput) {
  const dbData = {
    name: cleanData.name,
    description: cleanData.description,
    quantity:
      cleanData.quantity !== undefined ? String(cleanData.quantity) : undefined,
  };

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

import { products } from "@/db/schema";
import { CreateProductInput } from "@/types/product";
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

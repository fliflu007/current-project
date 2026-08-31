import { products } from "@/db/schema";
import { CreateProductInput } from "@/types/product";
import { db } from "@/db";

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

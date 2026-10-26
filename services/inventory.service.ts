import { db } from "@/db";
import { inventoryMovements } from "@/db/schema";
import { InventoryInputType } from "@/schemas/inventory";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function addToInventory(data: InventoryInputType) {
  const [movement] = await db
    .insert(inventoryMovements)
    .values({
      productId: data.productId,
      quantity: String(data.quantity),
      type: data.type,
      comment: data.comment,
    })
    .returning();

  return movement;
}

export async function updateProductQuantity(
  id: string,
  quantity: string | number,
) {
  const result = await db
    .update(products)
    .set({
      quantity: String(quantity),
    })
    .where(eq(products.id, id))
    .returning();

  return result[0];
}

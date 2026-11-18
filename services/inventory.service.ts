import { db } from "@/db";
import { inventoryMovements } from "@/db/schema";
import { InventoryInputType } from "@/schemas/inventory";
import { products } from "@/db/schema";

import { desc, eq, asc } from "drizzle-orm";

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

  export async function getTransactionsbyProduct(
      productId: string,
      perPageQuantity: number,
      offset: number,
      order: "asc" | "desc" = "desc",
      column: "date" | "quantity" | "type" = "date",
    ) {
      const transactions = await db
        .select()
        .from(inventoryMovements).where(eq(inventoryMovements.productId, productId))
        .orderBy(
              column === "quantity"
                  ? order === "asc"
                    ? asc(inventoryMovements.quantity)
                    : desc(inventoryMovements.quantity)
                  : column === "type"
                    ? order === "asc"
                      ? asc(inventoryMovements.type)
                      : desc(inventoryMovements.type)
                    : order === "asc"
                      ? asc(inventoryMovements.createdAt)
                      : desc(inventoryMovements.createdAt),
              )
        .limit(perPageQuantity)
        .offset(offset); 

     return transactions;
    
    }

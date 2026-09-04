import z from "zod";
import { db } from "@/db";
import { InventoryInput } from "@/types/inventory";
import { inventoryMovements } from "@/db/schema";

export async function addInventory(data: InventoryInput) {
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

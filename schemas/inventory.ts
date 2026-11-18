import { inventoryMovements } from "@/db/schema";
import z from "zod";


export type InventoryMovementDB =  typeof inventoryMovements.$inferSelect;

export const inventoryInputSchema = z.object({
  productId: z.string().min(5),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive(),
  comment: z.string().max(70).optional().nullable(),
});

export type InventoryInputType = z.infer<typeof inventoryInputSchema>;

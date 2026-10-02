import z from "zod";
import { inventoryInputSchema } from "@/schemas/inventory";
import z from "zod";

export type InventoryInput = z.infer<typeof inventoryInputSchema>;

export type InventoryInput = z.infer<typeof inventoryInputSchema>;

export const inventoryInputSchema = z.object({
  productId: z.string().min(5),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive(),
  comment: z.string().max(70).optional(),
});

import z from "zod";

export const inventoryInputSchema = z.object({
  productId: z.string().min(5),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().positive(),
  comment: z.string().max(70).optional(),
});

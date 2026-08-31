import { z } from "zod";

// API create Zod->Type
export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  quantity: z.number(),
});

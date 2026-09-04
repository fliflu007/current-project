import { inventoryInputSchema } from "@/schemas/inventory";
import z from "zod";

export type InventoryInput = z.infer<typeof inventoryInputSchema>;

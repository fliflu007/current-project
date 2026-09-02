import { products } from "@/db/schema";
import { CreateProductSchema } from "@/schemas/product";
import { patchProductSchema } from "@/schemas/product";
import z from "zod";

// DB OUT
// type shape Exact DB representation
export type ProductDB = typeof products.$inferSelect;

// DB insert
// type shape before DB insertion
export type ProductInsert = typeof products.$inferInsert;

// POST input
// Type shape validated by the Zod input schema
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// PATCH input
// Type shape validated by the Zod input schema
export type PatchProductInput = z.infer<typeof patchProductSchema>;

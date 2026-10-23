import { z } from "zod";
import { products, productImages } from "@/db/schema";

// ** CREATE PRODUCT

// FORM
export const createProductDataSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().max(50, "Maximum 50 characters").optional(),
  // Form value is a string → convert to number
  quantity: z.coerce.number().min(0, "Stock cannot be negative"),
});

export type CreateProductData = z.infer<typeof createProductDataSchema>;

export type SelectedImage = {
  file: File;
  previewUrl: string;
  isMain: boolean;
};

// API CREATE
export const imageDataSchema = z.array(
  z.object({
    key: z.string(),
    isMain: z.boolean(),
  }),
);

// API create Zod -> Type
export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  quantity: z.number().min(0),
  images: z
    .array(
      z.object({
        url: z.string(),
        publicId: z.string(),
        isMain: z.boolean(),
      }),
    )
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images allowed"),
});

// DB OUT
// Exact DB representation
export type ProductDB = typeof products.$inferSelect;

// DB insert
// Type shape before DB insertion
export type ProductInsert = typeof products.$inferInsert;

// POST input
// Type shape validated by the Zod input schema
export type CreateProductInput = z.infer<typeof CreateProductSchema>;

// GET service output
// DB product transformed for application use (quantity: string -> number)
export type Product = Omit<ProductDB, "quantity"> & {
  quantity: number;
};

export type ProductImageDB = typeof productImages.$inferSelect;

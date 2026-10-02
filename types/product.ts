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

// GET service output
// DB product transformed for application use (quantity: string -> number)
export type Product = Omit<ProductDB, "quantity"> & {
  quantity: number;
};

import { patchExistingImagesSchema } from "@/schemas/product";
import { patchNewImagesSchema } from "@/schemas/product";

export type PatchProductinfos = z.infer<typeof patchProductSchema>;
export type ExistingImageInput = z.infer<typeof patchExistingImagesSchema>;
export type NewImageInput = z.infer<typeof patchNewImagesSchema>;
export type NewImageWithFile = NewImageInput[number] & {
  file: File;
};

// PATCH input
// Type shape validated by the Zod input schema
export type PatchProductServiceInput = {
  productId: string;
  productData?: PatchProductData;
  existingImages?: ExistingImageInput;
  newImages?: NewImageWithFile[];
};

export type NormalizedImages = (
  | {
      status: "new";
      publicId: null;
      isPrimary: boolean;
      file: File;
    }
  | {
      status: "existing";
      publicId: string;
      isPrimary: boolean;
      file: null;
    }
)[];

import { z } from "zod";
import { products } from "@/db/schema";

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

// API CREATE :
export const imageDataSchema = z.array(
  z.object({
    key: z.string(),
    isMain: z.boolean(),
  }),
);

// API create Zod->Type
export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  quantity: z.number().min(0),
  images: z
    .array(
      z.object({ url: z.string(), publicId: z.string(), isMain: z.boolean() }),
    )
    .min(1, "At least one image is required")
    .max(3, "Maximum 3 images allowed"),
});

// .partial() makes all fields optional for PATCH
// export const patchProductSchema = CreateProductSchema.partial();

//////////   PATCH
const editProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string(),
});

export const patchProductSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().optional(),
  })
  .strict();

export const patchNewImagesSchema = z.array(
  z
    .object({
      key: z.string().optional(),
      isPrimary: z.boolean().optional(),
    })
    .refine(
      (image) =>
        (image.key === undefined && image.isPrimary === undefined) ||
        (image.key !== undefined && image.isPrimary !== undefined),
      {
        message:
          "key and isPrimary must either both be provided or both be omitted",
      },
    ),
);

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

export type PatchProductinfos = z.infer<typeof patchProductSchema>;
export type ExistingImageInput = z.infer<typeof patchExistingImagesSchema>;
export type NewImageInput = z.infer<typeof patchNewImagesSchema>;
export type NewImageWithFile = NewImageInput[number] & {
  file: File;
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

// PATCH input
// Type shape validated by the Zod input schema
export type PatchProductServiceInput = {
  productId: string;
  productData?: PatchProductData;
  existingImages?: ExistingImageInput;
  newImages?: NewImageWithFile[];
};

import { z } from "zod";

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

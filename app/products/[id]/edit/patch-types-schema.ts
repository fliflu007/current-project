import z from "zod";

////////////////// API OUT FOR PATCH//////////////////////////////

// TYPE FULL PRODUCT WITH IAMGE
export type ProductByIdResponse = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  images: {
    url: string;
    publicId: string;
    isPrimary: boolean;
  }[];
};

// PATCH FRONTEND IMAGE STATE
export type ProductImage =
  | {
      type: "existing";
      url: string;
      publicId: string;
      isPrimary: boolean;
    }
  | {
      type: "new";
      file: File;
      previewUrl: string;
      isPrimary: boolean;
    };

// PATCH FRONTEND DATA FORM
export const patchProductDataSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().max(50, "Maximum 50 characters").optional(),
});

export type PatchProductData = z.infer<typeof patchProductDataSchema>;

export const patchProductDataApiSchema = patchProductDataSchema.partial();

export type PatchProductDataApi = z.infer<typeof patchProductDataApiSchema>;

// BACKEND  PATCH DATA IN

export const existingImageInputSchema = z.object({
  publicId: z.string().min(3),
  isPrimary: z.boolean(),
});

export type ExistingImageInput = z.infer<typeof existingImageInputSchema>;

export const existingImagesSchema = z.array(existingImageInputSchema);

export const newImageSchema = z.object({
  key: z.string().regex(/^image_\d+$/, {
    message: "Key must follow the format image_0, image_1, etc.",
  }),
  isPrimary: z.boolean(),
});
export const newImagesSchema = z.array(newImageSchema);

export type NewImagesType = z.infer<typeof newImagesSchema>;

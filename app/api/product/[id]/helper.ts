import type { ExistingImageInput } from "@/app/products/[id]/edit/patch-types-schema";

type ProductImageDB = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: Date;
};

export function getImagesToRemove(
  imagesInDB: ProductImageDB[],
  existingImages: ExistingImageInput[],
) {
  return imagesInDB.filter(
    (dbImage) =>
      !existingImages.some((image) => image.publicId === dbImage.publicId),
  );
}

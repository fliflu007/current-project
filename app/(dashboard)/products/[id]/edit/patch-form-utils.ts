import { ProductImage } from "./patch-types-schema";

type ImageToNormalize = {
  url: string;
  publicId: string;
  isPrimary: boolean;
}[];

export function normalizeProductImages(
  images: ImageToNormalize,
): ProductImage[] {
  const normalizedImages = images.map((image) => {
    return { ...image, type: "existing" as const };
  });
  return normalizedImages;
}

// Prepares the current product images for a PATCH request.
// Separates existing images from new images, creates JSON metadata
// for both groups, and appends new image files to FormData using
// matching keys.
// Existing images are identified by their publicId and primary status.
// New images are linked to their actual File objects through generated keys.
// @param images - The current product image state from the frontend.
// @returns FormData containing existingImages, newImages, and new image files.

export function preparePatchFormData(images: ProductImage[]) {
  const formData = new FormData();
  const existingImages = images
    .filter((image) => image.type === "existing")
    .map((image) => ({ publicId: image.publicId, isPrimary: image.isPrimary }));
  const newImages = images
    .filter((image) => image.type === "new")
    .map((image, index) => {
      const key = `image_${index}`;
      formData.append(key, image.file);
      return { key, isPrimary: image.isPrimary };
    });
  formData.append("existingImages", JSON.stringify(existingImages));
  formData.append("newImages", JSON.stringify(newImages));
  return formData;
}

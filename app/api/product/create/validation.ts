import { z } from "zod";

import { ValidationError } from "@/lib/errors/errors";
import { imageDataSchema } from "@/schemas/product";
import { validateImageFile } from "@/app/validation/product-image";

import { MAX_PRODUCT_IMAGES } from "@/constants/products";

export function validateProductImages(formData: FormData) {
  // 1. Get image structure
  const rawImageData = formData.get("imagesData");
  // return : string | File | null

  if (typeof rawImageData !== "string") {
    throw new ValidationError("Invalid image data");
  }

  // 2. Parse JSON
  // declared out of try block
  let parsedImageData: unknown;

  try {
    parsedImageData = JSON.parse(rawImageData);
    console.log("PARSED IMAGE DATA:", parsedImageData);
  } catch {
    console.log("JSON PARSE FAILED");
    throw new ValidationError("Invalid image data");
  }

  // try {
  //   let parsedImageData = JSON.parse(rawImageData);
  // } catch {
  //   throw new ValidationError("Invalid image data");
  // }

  // 3. Validate image structure
  const imageData = imageDataSchema.parse(parsedImageData);

  // 4. Product image rules
  if (imageData.length === 0) {
    throw new ValidationError("At least one image is required");
  }

  if (imageData.length > MAX_PRODUCT_IMAGES) {
    throw new ValidationError(
      `Maximum of ${MAX_PRODUCT_IMAGES} images allowed`,
    );
  }

  const mainCount = imageData.filter((image) => image.isMain).length;

  if (mainCount !== 1) {
    throw new ValidationError("Exactly one image must be the main image");
  }

  // 5. Verify each key points to an actual File
  const images = imageData.map((image) => {
    const file = formData.get(image.key);

    if (!(file instanceof File)) {
      throw new ValidationError(`Missing image file: ${image.key}`);
    }

    // 6. Validate the actual file
    validateImageFile(file);

    return {
      file,
      isMain: image.isMain,
    };
  });

  return images;
}

import { ValidationError } from "@/lib/errors/errors";
import { patchProductDataApiSchema } from "@/app/products/[id]/edit/patch-types-schema";

import {
  existingImagesSchema,
  newImagesSchema,
  type NewImagesType,
  type ExistingImageInput,
} from "@/app/products/[id]/edit/patch-types-schema";

import { MAX_PRODUCT_IMAGES } from "@/constants/products";
import { validateImageFile } from "@/app/validation/product-image";
import { validateExistingImagesBelongToProduct } from "./existing-images-validation";
import z from "zod";

// VALIDATION FLOW
export async function validatePatchRequest(formdata: FormData, id: unknown) {
  // read 3 formdata fields.
  const productId = z
    .string()
    .uuid({ message: "Invalid product ID" })
    .parse(id);
  const dataRaw = formdata.get("data");
  const existingImagesRaw = formdata.get("existingImages");
  const newImagesRaw = formdata.get("newImages");

  ////////// STRUCTURAL VALIDATION //////////
  // Check which fields are present and whether their
  // combination is allowed by the API contract.

  // 1. Detect which parts were supplied
  // if data empty object or array or string then Has = true
  const hasData = dataRaw !== null;
  const hasExistingImages = existingImagesRaw !== null;
  const hasNewImages = newImagesRaw !== null;

  // 2. Check the overall request
  if (!hasData && !hasExistingImages && !hasNewImages) {
    throw new ValidationError("Nothing to update");
  }
  // Both image metadata fields must be supplied together.
  if (hasExistingImages !== hasNewImages) {
    throw new ValidationError("Both image fields are required");
  }

  ////////// INDIVIDUAL INPUT VALIDATION //////////
  // define if accurate data Validate optinal pass throw .
  const validatedData = hasData ? validatePatchData(dataRaw) : undefined;

  const validatedExistingImages = hasExistingImages
    ? validateExistingImages(existingImagesRaw)
    : undefined;

  const validatedNewImages = hasNewImages
    ? validateNewImages(newImagesRaw)
    : undefined;

  ////////// CROSS-FIELD VALIDATION //////////
  // Reject the empty-update case ({} + [] + []) using operation flags

  // 1. Determine whether both image arrays were supplied
  // and successfully validated.
  const hasImageFields =
    validatedExistingImages !== undefined && validatedNewImages !== undefined;

  // 2. Determine whether product data contains fields to update.
  const hasDataUpdate =
    validatedData !== undefined && Object.keys(validatedData).length > 0;

  // 3. Determine whether an image update was requested.
  // An empty existing array AND an empty new array mean
  // no image changes.
  const hasImageUpdate =
    hasImageFields &&
    (validatedExistingImages.length > 0 || validatedNewImages.length > 0);

  // 4. Reject the request if neither data nor images will change.
  if (!hasDataUpdate && !hasImageUpdate) {
    throw new ValidationError("Nothing to update");
  }

  // LIST OF VALIDATION
  let newImagesWfiles: {
    key: string;
    isPrimary: boolean;
    file: File;
  }[] = [];
  // validate combination with key and file format
  if (validatedNewImages && validatedExistingImages) {
    newImagesWfiles = validateNewImageFiles(validatedNewImages, formdata);

    // one image is primary only from all : IsPrimary (only one)
    validateisPrimary(validatedExistingImages, validatedNewImages);

    // existing image are in DB  (Accurate)

    // MAx and Min Image respected
    validateImageQuantity(validatedExistingImages, validatedNewImages);

    validateExistingImagesBelongToProduct(productId, validatedExistingImages);
  }

  // RETURNING clean data
  return {
    productId,
    data: validatedData,
    existingImages: validatedExistingImages,
    newImagesWFiles: newImagesWfiles,
  };
}

function validateImageQuantity(
  existingImages: ExistingImageInput[],
  newImages: NewImagesType,
) {
  const imageCount = existingImages.length + newImages.length;
  if (imageCount > MAX_PRODUCT_IMAGES || imageCount < 1) {
    throw new ValidationError("quantity of images incorrect");
  }
}

function validateisPrimary(
  existingImages: ExistingImageInput[],
  newImages: NewImagesType,
) {
  // verification that total cumulated of isPrimary = 1

  let countIsPrimary = 0;
  for (const image of existingImages) {
    if (image.isPrimary) {
      countIsPrimary++;
    }
  }
  for (const image of newImages) {
    if (image.isPrimary) {
      countIsPrimary++;
    }
  }
  if (countIsPrimary !== 1) {
    throw new ValidationError("Exactly one image must be primary");
  }
}

// 1. Parse and validate product data
function validatePatchData(dataRaw: (string | File) | null) {
  if (typeof dataRaw !== "string") {
    throw new ValidationError("Missing or invalid data");
  }
  let data: unknown;

  try {
    data = JSON.parse(dataRaw);
  } catch {
    throw new ValidationError("Invalid JSON in form data");
  }
  const validatedData = patchProductDataApiSchema.parse(data);
  return validatedData;
}

// 2. EXISTING IMAGE VALIDATION
function validateExistingImages(existingImagesRaw: unknown) {
  if (typeof existingImagesRaw !== "string") {
    throw new ValidationError("Missing or invalid data");
  }

  let existingImages: unknown;
  try {
    existingImages = JSON.parse(existingImagesRaw);
  } catch {
    throw new ValidationError("Invalid JSON in form data");
  }

  const validatedExistingImages = existingImagesSchema.parse(existingImages);
  return validatedExistingImages;
}

// 3. NEW IMAGE VALIDATION
function validateNewImages(newImagesRaw: unknown) {
  if (typeof newImagesRaw !== "string") {
    throw new ValidationError("Missing or invalid data");
  }

  let newImages: unknown;

  try {
    newImages = JSON.parse(newImagesRaw);
  } catch {
    throw new ValidationError("Invalid JSON in form data");
  }

  const validatedNewImages = newImagesSchema.parse(newImages);
  return validatedNewImages;
}

function validateNewImageFiles(newImages: NewImagesType, formdata: FormData) {
  let newImagesWFiles: {
    key: string;
    isPrimary: boolean;
    file: File;
  }[] = [];

  for (const image of newImages) {
    const file = formdata.get(image.key);

    if (!(file instanceof File)) {
      throw new ValidationError(`Missing image file for key: ${image.key}`);
    }
    validateImageFile(file);

    newImagesWFiles = [
      ...newImagesWFiles,
      { key: image.key, isPrimary: image.isPrimary, file: file },
    ];
  }
  return newImagesWFiles;
}

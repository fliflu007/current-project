import { validationError } from "@/lib/api/response";
import { patchNewImagesSchema } from "@/schemas/product";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/products";
import { ValidationError } from "@/lib/errors/errors";
import { NormalizedImages } from "@/schemas/product";

import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ExistingImageSchema = z
  .object({
    publicId: z.string().min(3).optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine(
    (image) =>
      (image.publicId === undefined && image.isPrimary === undefined) ||
      (image.publicId !== undefined && image.isPrimary !== undefined),
    {
      message:
        "publicId and isPrimary must either both be provided or both be omitted",
    },
  );

const ExistingImagesSchema = z.array(ExistingImageSchema);

export function validateProductImages(
  formdata: FormData,
): NormalizedImages | Response | null {
  // Conform both image JSon data

  const existingImagesRaw = formdata.get("existingImages");
  const newImagesRaw = formdata.get("newImages");

  // Condition both IMAGEexist and ImageNew should Exist at a whole or NONE
  if (existingImagesRaw === null && newImagesRaw === null) {
    return null;
  } else if (existingImagesRaw === null || newImagesRaw === null) {
    //return 400 response
    return validationError("Error Request Formate Missing ImageData");
  }

  // Validation Schema :

  // Error on DirectString / JsonPArse will Erroring
  if (typeof existingImagesRaw !== "string") {
    return validationError("Invalid existing image data");
  }
  let existingImages;

  try {
    existingImages = JSON.parse(existingImagesRaw);
  } catch {
    return validationError("Invalid existing image data");
  }

  // Validation of existingImages[]
  const resExistingImages = ExistingImagesSchema.safeParse(existingImages);

  if (!resExistingImages.success) {
    return validationError("Error Existing Image DataFormat");
  }
  const cleanExistingImages = resExistingImages.data;
  // --empty still here

  ///  End of  ExistingImage Treatement

  // newimages[] VALIDATION
  //
  if (typeof newImagesRaw !== "string") {
    return validationError("Invalid existing image data");
  }

  // BIG Null Condition if that is the case then SEE LATER

  let newImages;

  try {
    newImages = JSON.parse(newImagesRaw);
  } catch {
    return validationError("Invalid new image data");
  }

  const resNewImages = patchNewImagesSchema.safeParse(newImages);

  if (!resNewImages.success) {
    return validationError("Error Validation of NewImageData");
  }

  const cleanNewImages = resNewImages.data;
  // VERIFY That EACH data has key assign file
  for (const data of resNewImages.data) {
    if (data.key === undefined) {
      break;
    }

    const file = formdata.get(data.key);

    if (!(file instanceof File)) {
      return validationError("Missing image file");
    }
    // FILE VALIDATION :
    if (!file.type.startsWith("image/")) {
      return validationError("File must be an image");
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return validationError("Invalid image format");
    }
    if (file.size > MAX_FILE_SIZE) {
      return validationError("Image is too large");
    }
  }

  // MAX of total of 5 Image TOTAL image

  if (cleanExistingImages.length + cleanNewImages.length > 5) {
    return validationError("maximum of 5 Images");
  }

  // Return null if both ImageData are empty
  const hasExistingImage = cleanExistingImages.some(
    (image) => image.publicId !== undefined || image.isPrimary !== undefined,
  );

  const hasNewImages = cleanNewImages.length > 0;

  if (!hasExistingImage && !hasNewImages) {
    return null;
  }

  ////////// test ISPrimery true unique
  const primaryCount =
    cleanExistingImages.filter((item) => item.isPrimary === true).length +
    cleanNewImages.filter((item) => item.isPrimary === true).length;

  if (primaryCount !== 1) {
    return validationError("IsPrimary should be true once.");
  }

  // creation of a Imagefile:

  const existedImagesFormated: NormalizedImages = cleanExistingImages
    .filter((item) => item.publicId !== undefined)
    .map((item) => {
      return {
        publicId: item.publicId!,
        file: null,
        isPrimary: item.isPrimary!,
        status: "existing",
      };
    });

  const newImagesFormatted: NormalizedImages =
    cleanNewImages.length === 1 && cleanNewImages[0].key === undefined
      ? []
      : cleanNewImages.map((item) => ({
          publicId: null,
          file: formdata.get(item.key!) as File,
          isPrimary: item.isPrimary!,
          status: "new",
        }));

  return [...newImagesFormatted, ...existedImagesFormated];

  // image that should ismain should be 1 exactly.
}

// Validates the physical image file itself.
// Called by Create/Patch request validation after extracting the File from FormData.
export function validateImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new ValidationError("Invalid image format");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new ValidationError("Image is too large");
  }
}

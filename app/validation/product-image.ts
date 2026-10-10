import { validationError } from "@/lib/api/response";

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/constants/products";
import { ValidationError } from "@/lib/errors/errors";

import z from "zod";

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

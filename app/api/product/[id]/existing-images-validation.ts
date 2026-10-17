import { ValidationError } from "@/lib/errors/errors";
import { type ExistingImageInput } from "@/app/products/[id]/edit/patch-types-schema";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productImages } from "@/db/schema";

export async function validateExistingImagesBelongToProduct(
  productId: string,
  existingImages: ExistingImageInput[],
) {
  // No existing images to check. SELF CONTAIN
  if (existingImages.length === 0) {
    return;
  }

  // Get all image publicIds belonging to this product.
  const rows = await db
    .select({
      publicId: productImages.publicId,
    })
    .from(productImages)
    .where(
      and(
        eq(productImages.productId, productId),
        inArray(
          productImages.publicId,
          existingImages.map((image) => image.publicId),
        ),
      ),
    );

  // Extract the publicIds returned by the database.
  const existingPublicIds = new Set(rows.map((row) => row.publicId));

  // Every submitted image must belong to this product.
  for (const image of existingImages) {
    if (!existingPublicIds.has(image.publicId)) {
      throw new ValidationError(
        "An existing image does not belong to this product",
      );
    }
  }
}

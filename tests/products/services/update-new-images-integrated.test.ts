import { afterAll, expect, it } from "vitest";
import { updateNewImages } from "@/services/products.service";
import { db } from "@/db";
import { productImages } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as imageService from "@/services/images";
import type { NormalizedImages } from "@/types/product";

// Use a REAL product that already exists in your database.
// Replace this with one of your existing product IDs.
const productId = "6a68ccc8-eded-406f-ba7f-3233d02ef904";

let uploadedPublicId: string | null = null;

it("really uploads a new image to Cloudinary and saves it in the database", async () => {
  // A tiny valid PNG image, created directly in code.
  const pngBytes = Uint8Array.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0,
    0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120,
    156, 99, 248, 207, 192, 240, 31, 0, 5, 0, 1, 255, 137, 153, 61, 29, 0, 0, 0,
    0, 73, 69, 78, 68, 174, 66, 96, 130,
  ]);

  const file = new File([pngBytes], "integration-test.png", {
    type: "image/png",
  });

  const normalizedImages: NormalizedImages = [
    {
      status: "new",
      publicId: null,
      isPrimary: true,
      file,
    },
  ];

  // THIS IS REAL.
  await updateNewImages(productId, normalizedImages);

  // Find the image we just inserted.
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));

  const testImage = images.find((image) => image.publicId !== undefined);

  expect(testImage).toBeDefined();
  expect(testImage?.productId).toBe(productId);
  expect(testImage?.url).toContain("http");
  expect(testImage?.publicId).toBeTruthy();

  uploadedPublicId = testImage?.publicId ?? null;
});

afterAll(async () => {
  // Remove the Cloudinary image.
  if (uploadedPublicId) {
    await imageService.deleteImage(uploadedPublicId);
  }

  // Remove the DB record.
  if (uploadedPublicId) {
    await db
      .delete(productImages)
      .where(eq(productImages.publicId, uploadedPublicId));
  }
});

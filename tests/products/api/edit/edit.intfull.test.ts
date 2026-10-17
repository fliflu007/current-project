import { afterEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db/index";
import { companies, products, productImages } from "@/db/schema";

import { PATCH } from "@/app/api/product/[id]/route";
import {
  uploadImageToCloudinary,
  deleteImage,
} from "@/lib/cloudinary/operations";

// Adjust these paths to match your actual project.

const TEST_TIMEOUT = 30_000;

const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j2ioAAAAASUVORK5CYII=";

const createdProductIds = new Set<string>();
const createdCloudinaryIds = new Set<string>();

function createTestFile(name = "test.png"): File {
  return new File([Buffer.from(PNG_BASE64, "base64")], name, {
    type: "image/png",
  });
}

function createPatchRequest(
  productId: string,
  options: {
    data: Record<string, unknown>;
    existingImages: {
      publicId: string;
      isPrimary: boolean;
    }[];
    newImages: {
      key: string;
      isPrimary: boolean;
    }[];
    files?: Record<string, File>;
  },
): NextRequest {
  const formData = new FormData();

  formData.append("data", JSON.stringify(options.data));
  formData.append("existingImages", JSON.stringify(options.existingImages));
  formData.append("newImages", JSON.stringify(options.newImages));

  for (const [key, file] of Object.entries(options.files ?? {})) {
    formData.append(key, file);
  }

  // Important: construct a NextRequest, not a standard Request.
  return new NextRequest(`http://localhost/api/product/${productId}`, {
    method: "PATCH",
    body: formData,
  });
}

async function createTestProduct() {
  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .limit(1);

  if (!company) {
    throw new Error(
      "No company exists in the test database. Create one first.",
    );
  }

  const [product] = await db
    .insert(products)
    .values({
      companyId: company.id,
      name: `PATCH integration ${crypto.randomUUID()}`,
      description: "Original description",
      quantity: "10",
    })
    .returning();

  if (!product) {
    throw new Error("Failed to create the test product.");
  }

  createdProductIds.add(product.id);

  return product;
}

async function uploadTestImage(name: string) {
  const uploaded = await uploadImageToCloudinary(createTestFile(name));

  createdCloudinaryIds.add(uploaded.publicId);

  return {
    url: uploaded.url,
    publicId: uploaded.publicId,
  };
}

async function insertTestImage(
  productId: string,
  image: {
    url: string;
    publicId: string;
  },
  isPrimary: boolean,
) {
  await db.insert(productImages).values({
    productId,
    url: image.url,
    publicId: image.publicId,
    isPrimary,
  });
}

afterEach(async () => {
  // Collect image IDs still present in the database and remove
  // test image records and products.
  for (const productId of createdProductIds) {
    const images = await db
      .select({ publicId: productImages.publicId })
      .from(productImages)
      .where(eq(productImages.productId, productId));

    for (const image of images) {
      createdCloudinaryIds.add(image.publicId);
    }

    await db
      .delete(productImages)
      .where(eq(productImages.productId, productId));

    await db.delete(products).where(eq(products.id, productId));
  }

  createdProductIds.clear();

  // Clean up Cloudinary assets. An asset may already have been
  // deleted by the PATCH route, so cleanup errors are ignored.
  for (const publicId of createdCloudinaryIds) {
    try {
      await deleteImage(publicId);
    } catch {
      // Best-effort cleanup.
    }
  }

  createdCloudinaryIds.clear();
}, TEST_TIMEOUT);

describe("PATCH product — real integration tests", () => {
  it(
    "updates product data, replaces an image, and makes the new image primary",
    async () => {
      const product = await createTestProduct();

      // Upload the original image and insert its database record.
      const originalImage = await uploadTestImage("original.png");

      await insertTestImage(product.id, originalImage, true);

      const request = createPatchRequest(product.id, {
        data: {
          name: `${product.name} updated`,
          description: "Updated by integration test",
        },
        existingImages: [],
        newImages: [
          {
            key: "image_0",
            isPrimary: true,
          },
        ],
        files: {
          image_0: createTestFile("replacement.png"),
        },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: product.id }),
      });

      expect(response.status).toBe(200);

      // Verify the actual product row.
      const [updatedProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, product.id));

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct!.name).toBe(`${product.name} updated`);
      expect(updatedProduct!.description).toBe("Updated by integration test");

      // Verify the final image records.
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id));

      expect(images).toHaveLength(1);
      expect(images[0]!.publicId).not.toBe(originalImage.publicId);
      expect(images[0]!.isPrimary).toBe(true);

      expect(
        images.some((image) => image.publicId === originalImage.publicId),
      ).toBe(false);
    },
    TEST_TIMEOUT,
  );

  it(
    "switches primary between two existing images without replacing them",
    async () => {
      const product = await createTestProduct();

      // Upload two images to Cloudinary.
      const imageA = await uploadTestImage("primary-A.png");
      const imageB = await uploadTestImage("primary-B.png");

      // Initial database state: A is primary, B is not.
      await insertTestImage(product.id, imageA, true);
      await insertTestImage(product.id, imageB, false);

      const before = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id));

      expect(before).toHaveLength(2);

      // Retain both images and change only the primary selection.
      const request = createPatchRequest(product.id, {
        data: {},
        existingImages: [
          {
            publicId: imageA.publicId,
            isPrimary: false,
          },
          {
            publicId: imageB.publicId,
            isPrimary: true,
          },
        ],
        newImages: [],
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: product.id }),
      });

      expect(response.status).toBe(200);

      // Read the final state directly from PostgreSQL.
      const after = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id));

      expect(after).toHaveLength(2);

      const savedA = after.find((image) => image.publicId === imageA.publicId);

      const savedB = after.find((image) => image.publicId === imageB.publicId);

      expect(savedA).toBeDefined();
      expect(savedB).toBeDefined();

      expect(savedA!.isPrimary).toBe(false);
      expect(savedB!.isPrimary).toBe(true);

      // Both original image records must remain.
      expect(after.map((image) => image.publicId).sort()).toEqual(
        [imageA.publicId, imageB.publicId].sort(),
      );

      // Exactly one image should be primary.
      expect(after.filter((image) => image.isPrimary)).toHaveLength(1);
    },
    TEST_TIMEOUT,
  );
});

import { afterAll, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { products, productImages } from "@/db/schema";
import { POST } from "@/app/api/product/create/route";

vi.mock("@/lib/cloudinary/operations", () => ({
  uploadImageToCloudinary: vi.fn().mockResolvedValue({
    url: "https://test-cloudinary.com/test-image.jpg",
    publicId: "test-public-id",
  }),
}));

const testCompanyId = "2cffcdb1-ffe0-43d5-8068-d9183d1bc977";

let createdProductId: string | undefined;

function createFormData() {
  const formData = new FormData();

  formData.append(
    "data",
    JSON.stringify({
      name: "Integration Test Product",
      description: "Created by integration test",
      quantity: 10,
    }),
  );

  formData.append(
    "imagesData",
    JSON.stringify([
      {
        key: "key0",
        isMain: true,
      },
    ]),
  );

  const image = new File(["fake image content"], "test-image.jpg", {
    type: "image/jpeg",
  });

  formData.append("key0", image);

  return formData;
}

describe("POST /api/product/create - integration", () => {
  afterAll(async () => {
    if (!createdProductId) {
      return;
    }

    await db
      .delete(productImages)
      .where(eq(productImages.productId, createdProductId));

    await db.delete(products).where(eq(products.id, createdProductId));
  });

  it("creates a product and saves it to the real database", async () => {
    const formData = createFormData();

    const request = new Request("http://localhost:3000/api/product/create", {
      method: "POST",
      body: formData,
    });

    const response = await POST(request);

    const body = await response.json();

    console.log("\n========== INTEGRATION DEBUG ==========");

    console.log("STATUS:", response.status);

    console.log("BODY:", JSON.stringify(body, null, 2));

    console.log("=======================================\n");

    expect(response.status).toBe(201);

    expect(body.error).toBeNull();

    expect(body.data).toBeDefined();

    const productId: string = body.data.product.id;

    expect(productId).toBeDefined();

    createdProductId = productId;

    // ------------------------------------------------
    // Verify product in real database
    // ------------------------------------------------

    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    expect(productResult).toHaveLength(1);

    const product = productResult[0];

    expect(product.name).toBe("Integration Test Product");

    expect(product.description).toBe("Created by integration test");

    expect(product.companyId).toBe(testCompanyId);

    expect(product.quantity).toBe("10");

    // ------------------------------------------------
    // Verify product image in real database
    // ------------------------------------------------

    const imageResult = await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId));

    expect(imageResult).toHaveLength(1);

    const image = imageResult[0];

    expect(image.url).toBe("https://test-cloudinary.com/test-image.jpg");

    expect(image.publicId).toBe("test-public-id");

    expect(image.isPrimary).toBe(true);
  });
});

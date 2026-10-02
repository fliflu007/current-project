import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/product/[id]/route";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as imageService from "@/services/images";

describe("PATCH /api/product/[id]", () => {
  const testProductIds: string[] = [];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    for (const id of testProductIds) {
      await db.delete(products).where(eq(products.id, id));
    }
  });

  async function createTestProduct() {
    const existingProduct = await db.select().from(products).limit(1);

    expect(existingProduct.length).toBeGreaterThan(0);

    const [product] = await db
      .insert(products)
      .values({
        companyId: existingProduct[0].companyId,
        name: "PATCH TEST PRODUCT",
        description: "Original description",
        quantity: "10",
      })
      .returning();

    testProductIds.push(product.id);

    return product;
  }

  async function patchProduct(id: string, productData: object) {
    const formData = new FormData();

    formData.append("product", JSON.stringify(productData));
    formData.append("existingImages", "[]");
    formData.append("newImages", "[]");

    const request = new Request(`http://localhost/api/product/${id}`, {
      method: "PATCH",
      body: formData,
    });

    return PATCH(request, {
      params: Promise.resolve({ id }),
    });
  }

  it("updates product name and description", async () => {
    const product = await createTestProduct();

    const response = await patchProduct(product.id, {
      name: "Updated product",
      description: "Updated description",
    });

    expect(response.status).toBe(200);

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, product.id));

    expect(updatedProduct.name).toBe("Updated product");
    expect(updatedProduct.description).toBe("Updated description");
    expect(updatedProduct.quantity).toBe("10");
  });

  it("updates name only", async () => {
    const product = await createTestProduct();

    const response = await patchProduct(product.id, {
      name: "Name only update",
    });

    expect(response.status).toBe(200);

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, product.id));

    expect(updatedProduct.name).toBe("Name only update");
    expect(updatedProduct.description).toBe("Original description");
    expect(updatedProduct.quantity).toBe("10");
  });

  it("updates description only", async () => {
    const product = await createTestProduct();

    const response = await patchProduct(product.id, {
      description: "Description only update",
    });

    expect(response.status).toBe(200);

    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, product.id));

    expect(updatedProduct.name).toBe("PATCH TEST PRODUCT");
    expect(updatedProduct.description).toBe("Description only update");
    expect(updatedProduct.quantity).toBe("10");
  });

  it("updates product without changing images", async () => {
    const product = await createTestProduct();

    const addImageSpy = vi.spyOn(imageService, "addImage");
    const deleteImageSpy = vi.spyOn(imageService, "deleteImage");
    const setPrimaryImageSpy = vi.spyOn(imageService, "setPrimaryImage");

    const response = await patchProduct(product.id, {
      name: "Product without image update",
    });

    expect(response.status).toBe(200);

    expect(addImageSpy).not.toHaveBeenCalled();
    expect(deleteImageSpy).not.toHaveBeenCalled();
    expect(setPrimaryImageSpy).not.toHaveBeenCalled();
  });

  it("rejects invalid product data", async () => {
    const product = await createTestProduct();

    const response = await patchProduct(product.id, {
      name: "x",
    });

    expect(response.status).toBe(400);
  });

  it("rejects invalid existing image data", async () => {
    const product = await createTestProduct();

    const formData = new FormData();

    formData.append(
      "product",
      JSON.stringify({
        name: "Valid product",
      }),
    );

    formData.append(
      "existingImages",
      JSON.stringify([
        {
          publicId: "valid-public-id",
        },
      ]),
    );

    formData.append("newImages", "[]");

    const request = new Request(`http://localhost/api/product/${product.id}`, {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: product.id }),
    });

    expect(response.status).toBe(400);
  });

  it("rejects invalid existing image isPrimary", async () => {
    const product = await createTestProduct();

    const formData = new FormData();

    formData.append(
      "product",
      JSON.stringify({
        name: "Valid product",
      }),
    );

    formData.append(
      "existingImages",
      JSON.stringify([
        {
          publicId: "valid-public-id",
          isPrimary: "true",
        },
      ]),
    );

    formData.append("newImages", "[]");

    const request = new Request(`http://localhost/api/product/${product.id}`, {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: product.id }),
    });

    expect(response.status).toBe(400);
  });

  it("rejects existing image when publicId and isPrimary are incomplete", async () => {
    const product = await createTestProduct();

    const formData = new FormData();

    formData.append(
      "product",
      JSON.stringify({
        name: "Valid product",
      }),
    );

    formData.append(
      "existingImages",
      JSON.stringify([
        {
          isPrimary: true,
        },
      ]),
    );

    formData.append("newImages", "[]");

    const request = new Request(`http://localhost/api/product/${product.id}`, {
      method: "PATCH",
      body: formData,
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: product.id }),
    });

    expect(response.status).toBe(400);
  });
});

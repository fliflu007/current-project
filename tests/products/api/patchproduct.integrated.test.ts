import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";

import { PATCH } from "@/app/api/product/[id]/route";
import { db } from "@/db";
import { products } from "@/db/schema";

describe("PATCH /api/product/[id] - Integration", () => {
  let productId: string;

  const companyId = "7c02bbc9-8053-459e-9d09-90cb9927c78d";

  beforeEach(async () => {
    const [product] = await db
      .insert(products)
      .values({
        companyId,
        name: "Original Product",
        description: "Original description",
        quantity: "5",
      })
      .returning();

    productId = product.id;
  });

  afterEach(async () => {
    await db.delete(products).where(eq(products.id, productId));
  });

  it("should update an existing product", async () => {
    const request = new Request(
      `http://localhost:3000/api/product/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Updated Product",
          description: "Updated description",
          quantity: 10,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: productId,
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.error).toBeNull();

    expect(data.data).toMatchObject({
      id: productId,
      companyId,
      name: "Updated Product",
      description: "Updated description",
      quantity: 10,
    });

    // Verify the real database was updated
    const [updatedProduct] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    expect(updatedProduct.name).toBe("Updated Product");
    expect(updatedProduct.description).toBe("Updated description");
    expect(Number(updatedProduct.quantity)).toBe(10);
  });

  it("should return 404 when product does not exist", async () => {
    const nonExistingId = "00000000-0000-0000-0000-000000000000";

    const request = new Request(
      `http://localhost:3000/api/product/${nonExistingId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Updated Product",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: nonExistingId,
      }),
    });

    expect(response.status).toBe(404);

    const data = await response.json();

    expect(data).toEqual({
      data: null,
      error: {
        code: "NOT_FOUND",
        message: "Product not found",
      },
    });
  });

  it("should return 400 when validation fails", async () => {
    const request = new Request(
      `http://localhost:3000/api/product/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: "not-a-number",
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: productId,
      }),
    });

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data.data).toBeNull();
    expect(data.error).toBeDefined();
  });
});

import { GET } from "@/app/api/product/[id]/route";

import { db } from "@/db";
import { products } from "@/db/schema";

import { eq } from "drizzle-orm";

import { describe, it, expect } from "vitest";

describe("GET /api/product/:id - integration", () => {
  it("creates a product and successfully gets it by ID", async () => {
    let createdProductId: string | undefined;

    try {
      // ARRANGE
      const [createdProduct] = await db
        .insert(products)
        .values({
          name: "get by id integration test",
          description: "created for GET by ID test",
          quantity: "99",
          companyId: "7c02bbc9-8053-459e-9d09-90cb9927c78d",
        })
        .returning();

      createdProductId = createdProduct.id;

      // ACT
      const response = await GET(new Request("https://localhost"), {
        params: Promise.resolve({
          id: createdProductId,
        }),
      });

      const body = await response.json();

      // ASSERT
      expect(response.status).toBe(200);
      expect(body.error).toBeNull();

      expect(body.data.id).toBe(createdProductId);
      expect(body.data.name).toBe("get by id integration test");
      expect(body.data.description).toBe("created for GET by ID test");

      // Verify numeric conversion
      expect(body.data.quantity).toBe(99);
      expect(typeof body.data.quantity).toBe("number");
    } finally {
      // CLEANUP
      if (createdProductId) {
        await db.delete(products).where(eq(products.id, createdProductId));
      }
    }
  });

  it("returns 404 when the product does not exist", async () => {
    // ARRANGE
    const nonExistentProductId = "00000000-0000-0000-0000-000000000000";

    // ACT
    const response = await GET(new Request("https://localhost"), {
      params: Promise.resolve({
        id: nonExistentProductId,
      }),
    });

    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(404);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

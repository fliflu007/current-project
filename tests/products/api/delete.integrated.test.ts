import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { eq } from "drizzle-orm";

import { DELETE } from "@/app/api/product/[id]/route";
import { db } from "@/db";
import { products } from "@/db/schema";

describe("DELETE /api/product/[id] - Integration", () => {
  let productId: string;

  const companyId = "7c02bbc9-8053-459e-9d09-90cb9927c78d";

  beforeEach(async () => {
    const [product] = await db
      .insert(products)
      .values({
        companyId,
        name: "Product to Delete",
        description: "Product description",
        quantity: "10",
      })
      .returning();

    productId = product.id;
  });

  afterEach(async () => {
    await db.delete(products).where(eq(products.id, productId));
  });

  it("should delete an existing product", async () => {
    const request = new Request(
      `http://localhost:3000/api/product/${productId}`,
      {
        method: "DELETE",
      },
    );

    const response = await DELETE(request, {
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
      name: "Product to Delete",
      description: "Product description",
      quantity: 10,
    });

    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));

    expect(result).toHaveLength(0);
  });
});

// Create Successfully
// 201
// row inserted

// TODO : Product inserted witht he right company
// TODO : verify product is assigned to authenticated user's company
// TODO : get companyId from real profile/auth system

// Return quantity is OK
// test that because of tne Numeric convertion ->string-> num

import { POST } from "@/app/api/product/route";

import { db } from "@/db";
import { products } from "@/db/schema";

import { eq } from "drizzle-orm";

import { it, expect } from "vitest";

// 1-

it("creates a product and inserts the row into the database", async () => {
  let createdProductId: string | undefined;

  try {
    // ARRANGE
    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "integration test product",
        description: "created by integration test",
        quantity: 99,
      }),
    });

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(201);
    expect(body.data).toBeDefined();
    expect(body.error).toBeNull();

    // Save ID for cleanup
    createdProductId = body.data.id;
  } finally {
    // CLEANUP
    if (createdProductId) {
      await db.delete(products).where(eq(products.id, createdProductId));
    }
  }
});

it("returns quantity correctly as a number", async () => {
  let createdProductId: string | undefined;

  try {
    // ARRANGE
    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "quantity integration test",
        description: "testing numeric conversion",
        quantity: 99,
      }),
    });

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(201);
    expect(body.data.quantity).toBe(99);
    expect(typeof body.data.quantity).toBe("number");

    createdProductId = body.data.id;
  } finally {
    // CLEANUP
    if (createdProductId) {
      await db.delete(products).where(eq(products.id, createdProductId));
    }
  }
});

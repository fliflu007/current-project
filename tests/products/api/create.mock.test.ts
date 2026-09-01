import { createProduct } from "@/services/products.service";

import { POST } from "@/app/api/product/route";

import { describe, it, expect, vi } from "vitest";
// Valid Request -> 201

vi.mock("@/services/products.service", () => ({
  createProduct: vi.fn(),
}));

describe("POST /api/product", () => {
  // first test
  it("create a product successfuly", async () => {
    // ARRANGE
    // create the post request :
    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "shoes XXL",
        description: "very uncomfortable",
        quantity: 99,
      }),
    });
    // prepare mock substitution

    const mockProduct = {
      id: "test-product-id",
      companyId: "test-company-id",
      createdAt: new Date(),
      name: "shoes XXL",
      description: "very uncomfortable",
      quantity: 99,
    };

    const createProductMock = vi.mocked(createProduct);
    createProductMock.mockResolvedValue(mockProduct);

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSET

    expect(response.status).toBe(201);
    expect(body.data).toEqual({
      ...mockProduct,
      createdAt: mockProduct.createdAt.toISOString(),
    });
    expect(body.error).toBeNull();
    expect(createProductMock).toHaveBeenCalledWith(
      "7c02bbc9-8053-459e-9d09-90cb9927c78d",
      {
        name: "shoes XXL",
        description: "very uncomfortable",
        quantity: 99,
      },
    );
  });
  // Missing Requested field -> validation error
  // missing name :

  it("return 400 when name field is missing,", async () => {
    // ARRANGE

    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "very unconformtable",
        quantity: 99,
      }),
    });

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(400);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when quantity is invalid", async () => {
    // ARRANGE
    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "shoes XXL",
        description: "very uncomfortable",
        quantity: "99",
      }),
    });

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(400);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 500 when service throws an unknown error", async () => {
    // ARRANGE
    const request = new Request("https://localhost/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "shoes XXL",
        description: "very uncomfortable",
        quantity: 99,
      }),
    });

    const createProductMock = vi.mocked(createProduct);

    createProductMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    // ACT
    const response = await POST(request);
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(500);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

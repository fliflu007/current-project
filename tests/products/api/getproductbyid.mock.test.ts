import { GET } from "@/app/api/product/[id]/route";
import { getProductById } from "@/services/products.service";

import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/products.service", () => ({
  getProductById: vi.fn(),
}));

describe("GET /api/product/:id", () => {
  //
  // GET ONE - MOCK TEST
  //
  // Service returns product
  // → 200
  // → data: Product
  // → error: null
  //
  // Service returns null
  // → 404
  // → data: null
  // → error.code: "NOT_FOUND"
  //
  // Service throws unexpected error
  // → 500
  // → data: null
  // → error.code: "INTERNAL_SERVER_ERROR"
  //

  it("returns 200 and the product when the service finds it", async () => {
    // ARRANGE

    const mockProduct = {
      id: "test-product-id",
      companyId: "test-company-id",
      createdAt: new Date(),
      name: "shoes XXL",
      description: "very uncomfortable",
      quantity: 99,
    };

    const getProductByIdMock = vi.mocked(getProductById);

    getProductByIdMock.mockResolvedValue(mockProduct);

    // ACT

    const response = await GET(new Request("https://localhost"), {
      params: Promise.resolve({
        id: "test-product-id",
      }),
    });

    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();

    expect(body.data).toEqual({
      ...mockProduct,
      createdAt: mockProduct.createdAt.toISOString(),
    });

    expect(getProductByIdMock).toHaveBeenCalledWith("test-product-id");
  });

  it("returns 404 when the service returns null", async () => {
    // ARRANGE

    const getProductByIdMock = vi.mocked(getProductById);

    getProductByIdMock.mockResolvedValue(null);

    // ACT

    const response = await GET(new Request("https://localhost"), {
      params: Promise.resolve({
        id: "non-existent-product-id",
      }),
    });

    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(404);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("NOT_FOUND");

    expect(getProductByIdMock).toHaveBeenCalledWith("non-existent-product-id");
  });

  it("returns 500 when the service throws an unexpected error", async () => {
    // ARRANGE

    const getProductByIdMock = vi.mocked(getProductById);

    getProductByIdMock.mockRejectedValue(
      new Error("Database connection failed"),
    );

    // ACT

    const response = await GET(new Request("https://localhost"), {
      params: Promise.resolve({
        id: "test-product-id",
      }),
    });

    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(500);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

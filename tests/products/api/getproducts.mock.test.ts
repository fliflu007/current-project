import { GET } from "@/app/api/product/route";
import { getProducts } from "@/services/products.service";

import { describe, it, expect, vi } from "vitest";

vi.mock("@/services/products.service", () => ({
  getProducts: vi.fn(),
}));

describe("GET /api/product", () => {
  it("returns 200 and products when products exist", async () => {
    // ARRANGE

    const mockProducts = [
      {
        id: "test-product-id",
        companyId: "test-company-id",
        createdAt: new Date(),
        name: "shoes XXL",
        description: "very uncomfortable",
        quantity: 99,
      },
    ];

    const getProductsMock = vi.mocked(getProducts);
    getProductsMock.mockResolvedValue(mockProducts);

    // ACT

    const response = await GET();
    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data).toEqual([
      {
        ...mockProducts[0],
        createdAt: mockProducts[0].createdAt.toISOString(),
      },
    ]);
  });

  it("returns 200 and an empty array when no products exist", async () => {
    // ARRANGE

    const getProductsMock = vi.mocked(getProducts);
    getProductsMock.mockResolvedValue([]);

    // ACT

    const response = await GET();
    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.error).toBeNull();
  });

  it("returns 500 when the service throws an unknown error", async () => {
    // ARRANGE

    const getProductsMock = vi.mocked(getProducts);
    getProductsMock.mockRejectedValue(new Error("Database connection failed"));

    // ACT

    const response = await GET();
    const body = await response.json();

    // ASSERT

    expect(response.status).toBe(500);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

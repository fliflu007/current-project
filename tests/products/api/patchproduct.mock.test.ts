import { describe, it, vi, expect } from "vitest";
import { patchProduct } from "@/services/products.service";
import { PATCH } from "@/app/api/product/[id]/route";

vi.mock("@/services/products.service", () => ({
  patchProduct: vi.fn(),
}));

describe("Patchproduct Mocktest", () => {
  it("should return 200 when product is successfully updated", async () => {
    const createdAt = new Date("2026-09-02T00:00:00.000Z");

    vi.mocked(patchProduct).mockResolvedValue({
      id: "product-123",
      companyId: "company-123",
      createdAt,
      name: "Updated Product",
      description: "Updated description",
      quantity: 10,
    });

    const request = new Request(
      "http://localhost:3000/api/product/product-123",
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
        id: "product-123",
      }),
    });

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toEqual({
      data: {
        id: "product-123",
        companyId: "company-123",
        createdAt: createdAt.toISOString(),
        name: "Updated Product",
        description: "Updated description",
        quantity: 10,
      },
      error: null,
    });

    expect(patchProduct).toHaveBeenCalledWith("product-123", {
      name: "Updated Product",
      description: "Updated description",
      quantity: 10,
    });
  });

  it("should return 404 when product does not exist", async () => {
    // test here
  });

  it("should return 400 when validation fails", async () => {
    // test here
  });

  it("should return 500 when an unexpected error occurs", async () => {
    // test here
  });
});

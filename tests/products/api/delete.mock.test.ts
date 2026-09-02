import { it, vi, expect } from "vitest";
import { deleteProduct } from "@/services/products.service";
import { DELETE } from "@/app/api/product/[id]/route";
vi.mock("@/services/products.service", () => ({
  deleteProduct: vi.fn(),
}));

it("should return 200 when product is successfully deleted", async () => {
  const deletedProduct = {
    id: "product-123",
    companyId: "7c02bbc9-8053-459e-9d09-90cb9927c78d",
    createdAt: new Date("2026-09-02T00:00:00.000Z"),
    name: "Product to Delete",
    description: "Product description",
    quantity: 10,
  };

  vi.mocked(deleteProduct).mockResolvedValue(deletedProduct);

  const request = new Request("http://localhost:3000/api/product/product-123", {
    method: "DELETE",
  });

  const response = await DELETE(request, {
    params: Promise.resolve({
      id: "product-123",
    }),
  });

  expect(response.status).toBe(200);

  const data = await response.json();

  expect(data).toEqual({
    data: {
      id: "product-123",
      companyId: "7c02bbc9-8053-459e-9d09-90cb9927c78d",
      createdAt: "2026-09-02T00:00:00.000Z",
      name: "Product to Delete",
      description: "Product description",
      quantity: 10,
    },
    error: null,
  });

  expect(deleteProduct).toHaveBeenCalledWith("product-123");
});

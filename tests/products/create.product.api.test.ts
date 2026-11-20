import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/product/create/route";
import { requireUserId } from "@/lib/auth/require-user";
import { requireUserContext } from "@/lib/auth/require-user-context";
import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";
import { insertProductDb } from "@/services/products.service";
import { db } from "@/db";

// MOCK MODULES

vi.mock("@/services/products.service", () => ({
  insertProductDb: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("@/lib/auth/require-user-context", () => ({
  requireUserContext: vi.fn(),
}));

vi.mock("@/lib/cloudinary/operations", () => ({
  uploadImageToCloudinary: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    transaction: vi.fn(),
  },
}));

// TEST DATA

const productData = {
  name: "Laptop",
  description: "Office laptop",
  quantity: 5,
};

function createRequest(data: unknown = productData, includeImage = true) {
  const formData = new FormData();

  formData.append("data", JSON.stringify(data));

  if (includeImage) {
    const imageFile = new File(["fake image content"], "laptop.jpg", {
      type: "image/jpeg",
    });

    formData.append(
      "imagesData",
      JSON.stringify([{ key: "image-1", isMain: true }]),
    );

    formData.append("image-1", imageFile);
  }

  return new Request("http://localhost/api/product/create", {
    method: "POST",
    body: formData,
  });
}

// MOCK DUPLICATE PRODUCT QUERY

const limitMock = vi.fn();

const whereMock = vi.fn().mockReturnValue({
  limit: limitMock,
});

const fromMock = vi.fn().mockReturnValue({
  where: whereMock,
});

// MOCK TRANSACTION

const returningMock = vi.fn();

const valuesMock = vi.fn().mockReturnValue({
  returning: returningMock,
});

const insertMock = vi.fn().mockReturnValue({
  values: valuesMock,
});

const tx = {
  insert: insertMock,
};

// DEFAULT MOCK CONFIGURATION

function configureSuccessMocks() {
  vi.mocked(requireUserId).mockResolvedValue("test-user-id");

  vi.mocked(requireUserContext).mockResolvedValue({
    companyId: "test-company-id",
    role: "admin",
  });

  vi.mocked(uploadImageToCloudinary).mockResolvedValue({
    url: "https://example.com/laptop.jpg",
    publicId: "test-image-123",
  });

  vi.mocked(insertProductDb).mockResolvedValue({
    id: "test-product-id",
    companyId: "test-company-id",
    name: "Laptop",
    description: "Office laptop",
    quantity: "5",
    createdAt: new Date(),
  });

  vi.mocked(db.select).mockReturnValue({
    from: fromMock,
  } as any);

  limitMock.mockResolvedValue([]);

  returningMock.mockResolvedValue([
    {
      id: "test-image-row-id",
      productId: "test-product-id",
      url: "https://example.com/laptop.jpg",
      publicId: "test-image-123",
      isPrimary: true,
    },
  ]);

  vi.mocked(db.transaction).mockImplementation(async (callback: any) =>
    callback(tx),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  configureSuccessMocks();
});

// API TESTS

describe("Create Product API", () => {
  it("creates a product successfully and returns 201", async () => {
    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.error).toBeNull();
    expect(body.data.product.id).toBe("test-product-id");
    expect(body.data.product.companyId).toBe("test-company-id");

    expect(insertProductDb).toHaveBeenCalledWith(
      productData,
      "test-company-id",
    );

    expect(uploadImageToCloudinary).toHaveBeenCalledTimes(1);
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });

  it("rejects unauthenticated users with 401 UNAUTHORIZED", async () => {
    vi.mocked(requireUserId).mockResolvedValue(null as any);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("UNAUTHORIZED");

    expect(insertProductDb).not.toHaveBeenCalled();
  });

  it("rejects staff users with 403 FORBIDDEN", async () => {
    vi.mocked(requireUserContext).mockResolvedValue({
      companyId: "test-company-id",
      role: "staff",
    });

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("FORBIDDEN");

    expect(insertProductDb).not.toHaveBeenCalled();
  });

  it("rejects invalid product data with 400 VALIDATION_ERROR", async () => {
    const response = await POST(
      createRequest({
        name: "Lp",
        description: "Office laptop",
        quantity: 5,
      }),
    );

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");

    expect(insertProductDb).not.toHaveBeenCalled();
  });

  it("rejects duplicate product names with 409 CONFLICT", async () => {
    limitMock.mockResolvedValue([{ id: "existing-product-id" }]);

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("CONFLICT");

    expect(insertProductDb).not.toHaveBeenCalled();
    expect(uploadImageToCloudinary).not.toHaveBeenCalled();
  });

  it("rejects missing image data with 400 VALIDATION_ERROR", async () => {
    const response = await POST(createRequest(productData, false));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");

    expect(insertProductDb).not.toHaveBeenCalled();
    expect(uploadImageToCloudinary).not.toHaveBeenCalled();
  });

  it("returns 500 INTERNAL_SERVER_ERROR when product insertion fails unexpectedly", async () => {
    vi.mocked(insertProductDb).mockRejectedValue(new Error("Database failure"));

    const response = await POST(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/product/create/route";

import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";
import { getCompanyId, insertProductDb } from "@/services/products.service";

import { db } from "@/db";

///////////// MOCK MODULES ///////////////////

vi.mock("@/lib/cloudinary/operations", () => ({
  uploadImageToCloudinary: vi.fn(),
}));

vi.mock("@/services/products.service", () => ({
  getCompanyId: vi.fn(),
  insertProductDb: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    transaction: vi.fn(),
  },
}));

///////////// DEFAULT MOCK BEHAVIOR ///////////////////

vi.mocked(getCompanyId).mockResolvedValue("company-123");

vi.mocked(uploadImageToCloudinary).mockResolvedValue({
  url: "https://fake-image.com/test.png",
  publicId: "test-image-123",
});

vi.mocked(insertProductDb).mockResolvedValue({
  id: "product-123",
  name: "Test Product",
  description: "Test description",
  quantity: "50",
  companyId: "company-123",
  createdAt: new Date(),
});

process.env.TEST_USER_ID = "user-123";

///////////// HELPERS ///////////////////

function createTransactionMock() {
  const tx = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([
          {
            id: "image-123",
            productId: "product-123",
            url: "https://fake-image.com/test.png",
            publicId: "test-image-123",
            isPrimary: true,
          },
        ]),
      })),
    })),
  };

  vi.mocked(db.transaction).mockImplementation(async (callback) => {
    return callback(tx as any);
  });
}

function createRequest({
  productData = {
    name: "Test Product",
    description: "Test description",
    quantity: 50,
  },
  images = [
    {
      key: "key0",
      isMain: true,
    },
  ],
  files = [
    {
      key: "key0",
      file: new File(["fake image"], "test.png", {
        type: "image/png",
      }),
    },
  ],
} = {}) {
  const formData = new FormData();

  formData.append("data", JSON.stringify(productData));

  formData.append("imagesData", JSON.stringify(images));

  for (const item of files) {
    formData.append(item.key, item.file);
  }

  return new Request("http://localhost/api/product/create", {
    method: "POST",
    body: formData,
  });
}

///////////// TESTS ///////////////////

describe("POST /api/product/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(getCompanyId).mockResolvedValue("company-123");

    vi.mocked(uploadImageToCloudinary).mockResolvedValue({
      url: "https://fake-image.com/test.png",
      publicId: "test-image-123",
    });

    vi.mocked(insertProductDb).mockResolvedValue({
      id: "product-123",
      name: "Test Product",
      description: "Test description",
      quantity: "50",
      companyId: "company-123",
      createdAt: new Date(),
    });

    createTransactionMock();
  });

  it("creates a product successfully", async () => {
    const file = new File(["fake image"], "test.png", {
      type: "image/png",
    });

    const request = createRequest({
      files: [{ key: "key0", file }],
    });

    const response = await POST(request);

    expect(response.status).toBe(201);

    const body = await response.json();

    expect(body.error).toBeNull();
    expect(body.data.product.id).toBe("product-123");

    expect(getCompanyId).toHaveBeenCalledWith("user-123");

    expect(uploadImageToCloudinary).toHaveBeenCalledWith(expect.any(File));

    expect(insertProductDb).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Product",
        quantity: 50,
      }),
      "company-123",
    );

    expect(db.transaction).toHaveBeenCalled();
  });

  it("returns 400 when product data is invalid", async () => {
    const request = createRequest({
      productData: {
        name: "A",
        description: "Test description",
        quantity: 50,
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.data).toBeNull();
    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when no images are provided", async () => {
    const request = createRequest({
      images: [],
      files: [],
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when too many images are provided", async () => {
    const images = [
      { key: "key0", isMain: true },
      { key: "key1", isMain: false },
      { key: "key2", isMain: false },
      { key: "key3", isMain: false },
    ];

    const files = images.map((image) => ({
      key: image.key,
      file: new File(["fake image"], `${image.key}.png`, {
        type: "image/png",
      }),
    }));

    const request = createRequest({
      images,
      files,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("returns 400 when image type is invalid", async () => {
    const file = new File(["fake file"], "test.txt", {
      type: "text/plain",
    });

    const request = createRequest({
      files: [{ key: "key0", file }],
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when image is too large", async () => {
    const largeContent = new Uint8Array(5 * 1024 * 1024 + 1);

    const file = new File([largeContent], "large.png", {
      type: "image/png",
    });

    const request = createRequest({
      files: [{ key: "key0", file }],
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when no main image is provided", async () => {
    const images = [
      {
        key: "key0",
        isMain: false,
      },
    ];

    const files = [
      {
        key: "key0",
        file: new File(["fake image"], "test.png", {
          type: "image/png",
        }),
      },
    ];

    const request = createRequest({
      images,
      files,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when multiple main images are provided", async () => {
    const images = [
      {
        key: "key0",
        isMain: true,
      },
      {
        key: "key1",
        isMain: true,
      },
    ];

    const files = images.map((image) => ({
      key: image.key,
      file: new File(["fake image"], `${image.key}.png`, {
        type: "image/png",
      }),
    }));

    const request = createRequest({
      images,
      files,
    });

    const response = await POST(request);

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 500 when Cloudinary upload fails", async () => {
    vi.mocked(uploadImageToCloudinary).mockRejectedValueOnce(
      new Error("Cloudinary failed"),
    );

    const request = createRequest();

    const response = await POST(request);

    expect(response.status).toBe(500);

    const body = await response.json();

    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("returns 500 when product database insertion fails", async () => {
    vi.mocked(insertProductDb).mockRejectedValueOnce(
      new Error("Database failed"),
    );

    const request = createRequest();

    const response = await POST(request);

    expect(response.status).toBe(500);

    const body = await response.json();

    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  it("returns 500 when company lookup fails", async () => {
    vi.mocked(getCompanyId).mockRejectedValueOnce(new Error("Database failed"));

    const request = createRequest();

    const response = await POST(request);

    expect(response.status).toBe(500);

    const body = await response.json();

    expect(body.data).toBeNull();
    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });
});

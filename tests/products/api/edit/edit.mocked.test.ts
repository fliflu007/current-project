import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { PATCH } from "@/app/api/product/[id]/route";
import { ValidationError } from "@/lib/errors/errors";
import { validatePatchRequest } from "@/app/api/product/[id]/patch-validation";

import {
  addImagesToDB,
  deleteImageDB,
  getProductImageData,
  setPrimaryImageByPublicID,
  updateProductDetails,
} from "@/services/products.service";

import {
  deleteImage,
  uploadImageToCloudinary,
} from "@/lib/cloudinary/operations";

// Mock the database/service dependencies.
vi.mock("@/services/products.service", () => ({
  addImagesToDB: vi.fn(),
  deleteImageDB: vi.fn(),
  deleteProduct: vi.fn(),
  getProductById: vi.fn(),
  getProductImageData: vi.fn(),
  setPrimaryImageByPublicID: vi.fn(),
  updateProductDetails: vi.fn(),
}));

// Mock Cloudinary so tests never upload or delete real assets.
vi.mock("@/lib/cloudinary/operations", () => ({
  deleteImage: vi.fn(),
  uploadImageToCloudinary: vi.fn(),
}));

// Mock request validation so these tests focus on route behavior.
// Validation itself is already covered by your separate test suite.
vi.mock("@/app/api/product/[id]/patch-validation", () => ({
  validatePatchRequest: vi.fn(),
}));

const PRODUCT_ID = "11111111-1111-4111-8111-111111111111";

type ExistingImage = {
  publicId: string;
  isPrimary: boolean;
};

type DatabaseImage = {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  isPrimary: boolean;
  createdAt: Date;
};

const imageA: DatabaseImage = {
  id: "image-record-a",
  productId: PRODUCT_ID,
  url: "https://example.com/a.png",
  publicId: "cloud-a",
  isPrimary: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

const imageB: DatabaseImage = {
  id: "image-record-b",
  productId: PRODUCT_ID,
  url: "https://example.com/b.png",
  publicId: "cloud-b",
  isPrimary: false,
  createdAt: new Date("2026-01-02T00:00:00Z"),
};

type CleanRequest = Awaited<ReturnType<typeof validatePatchRequest>>;

function makeCleanRequest(overrides: Partial<CleanRequest> = {}): CleanRequest {
  return {
    productId: PRODUCT_ID,
    data: { name: "Updated product" },
    existingImages: undefined,
    newImagesWFiles: [],
    ...overrides,
  } as CleanRequest;
}

function makeRequest(): NextRequest {
  const formData = new FormData();
  formData.append("data", JSON.stringify({ name: "Updated product" }));

  return new NextRequest(`http://localhost/api/product/${PRODUCT_ID}`, {
    method: "PATCH",
    body: formData,
  });
}

function makeContext() {
  return {
    params: Promise.resolve({ id: PRODUCT_ID }),
  };
}

describe("PATCH /api/product/[id]", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(getProductImageData).mockResolvedValue([]);
    vi.mocked(addImagesToDB).mockResolvedValue(undefined);
    vi.mocked(deleteImageDB).mockResolvedValue(undefined);
    vi.mocked(setPrimaryImageByPublicID).mockResolvedValue({
      success: true,
    });
    vi.mocked(updateProductDetails).mockResolvedValue({
      id: PRODUCT_ID,
      companyId: "test-company",
      createdAt: new Date(),
      name: "Updated product",
      description: null,
      quantity: "0",
    });
    type DeleteImageResult = {
      success: boolean;
    };

    vi.mocked(validatePatchRequest).mockResolvedValue(makeCleanRequest());
  });

  it("updates product data", async () => {
    vi.mocked(validatePatchRequest).mockResolvedValue(
      makeCleanRequest({
        data: { name: "Updated product" },
      }),
    );

    const response = await PATCH(makeRequest(), makeContext());

    expect(response.status).toBe(200);
    expect(await response.json()).toBe("OK");

    expect(updateProductDetails).toHaveBeenCalledWith(PRODUCT_ID, {
      name: "Updated product",
    });

    expect(uploadImageToCloudinary).not.toHaveBeenCalled();
    expect(deleteImageDB).not.toHaveBeenCalled();
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("removes database and Cloudinary images not retained", async () => {
    vi.mocked(getProductImageData).mockResolvedValue([imageA, imageB]);

    vi.mocked(validatePatchRequest).mockResolvedValue(
      makeCleanRequest({
        data: undefined,
        existingImages: [{ publicId: "cloud-a", isPrimary: true }],
      }),
    );

    const response = await PATCH(makeRequest(), makeContext());

    expect(response.status).toBe(200);

    expect(deleteImageDB).toHaveBeenCalledTimes(1);
    expect(deleteImageDB).toHaveBeenCalledWith("cloud-b");

    expect(deleteImage).toHaveBeenCalledTimes(1);
    expect(deleteImage).toHaveBeenCalledWith("cloud-b");

    expect(deleteImageDB).not.toHaveBeenCalledWith("cloud-a");
    expect(deleteImage).not.toHaveBeenCalledWith("cloud-a");
  });

  it("uploads new images, inserts their records, and sets the new primary", async () => {
    const file = new File(["test image"], "new.png", {
      type: "image/png",
    });

    vi.mocked(validatePatchRequest).mockResolvedValue(
      makeCleanRequest({
        data: undefined,
        existingImages: [],
        newImagesWFiles: [
          {
            key: "image_0",
            isPrimary: true,
            file,
          },
        ],
      }),
    );

    vi.mocked(uploadImageToCloudinary).mockResolvedValue({
      url: "https://example.com/new.png",
      publicId: "cloud-new",
    });

    const response = await PATCH(makeRequest(), makeContext());

    expect(response.status).toBe(200);

    expect(uploadImageToCloudinary).toHaveBeenCalledWith(file);

    expect(addImagesToDB).toHaveBeenCalledWith(
      [
        {
          url: "https://example.com/new.png",
          publicId: "cloud-new",
          isPrimary: true,
        },
      ],
      PRODUCT_ID,
    );

    expect(setPrimaryImageByPublicID).toHaveBeenCalledWith(
      "cloud-new",
      PRODUCT_ID,
    );
  });

  it("sets the primary image to a retained existing image", async () => {
    vi.mocked(getProductImageData).mockResolvedValue([imageA, imageB]);

    vi.mocked(validatePatchRequest).mockResolvedValue(
      makeCleanRequest({
        data: undefined,
        existingImages: [
          { publicId: "cloud-a", isPrimary: true },
          { publicId: "cloud-b", isPrimary: false },
        ],
      }),
    );

    const response = await PATCH(makeRequest(), makeContext());

    expect(response.status).toBe(200);

    expect(setPrimaryImageByPublicID).toHaveBeenCalledWith(
      "cloud-a",
      PRODUCT_ID,
    );

    expect(deleteImageDB).not.toHaveBeenCalled();
    expect(deleteImage).not.toHaveBeenCalled();
  });

  it("returns 400 when validation fails", async () => {
    vi.mocked(validatePatchRequest).mockRejectedValue(
      new ValidationError("Nothing to update"),
    );

    const response = await PATCH(makeRequest(), makeContext());

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Nothing to update",
      },
    });

    expect(getProductImageData).not.toHaveBeenCalled();
    expect(updateProductDetails).not.toHaveBeenCalled();
  });

  it("propagates an unexpected service error", async () => {
    vi.mocked(updateProductDetails).mockRejectedValue(
      new Error("Database unavailable"),
    );

    await expect(PATCH(makeRequest(), makeContext())).rejects.toThrow(
      "Database unavailable",
    );
  });
});

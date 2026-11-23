import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { NextRequest } from "next/server";

import { PATCH } from "@/app/api/product/[id]/route";

import { requireUserId } from "@/lib/auth/require-user";
import { requireUserContext } from "@/lib/auth/require-user-context";

import {
  getProductForCompany,
  getProductImageData,
  updateProductDetails,
  addImagesToDB,
  setPrimaryImageByPublicID,
  deleteImageDB,
} from "@/services/products.service";

import {
  uploadImageToCloudinary,
  deleteImage,
} from "@/lib/cloudinary/operations";

import { NotFoundError, ValidationError } from "@/lib/api/errors";

import { validatePatchRequest } from "@/app/api/product/[id]/patch-validation";

// ============================================
// 1. MOCK MODULES
// ============================================

vi.mock("@/lib/auth/require-user", () => ({
  requireUserId: vi.fn(),
}));

vi.mock("@/lib/auth/require-user-context", () => ({
  requireUserContext: vi.fn(),
}));

vi.mock("@/services/products.service", () => ({
  getProductForCompany: vi.fn(),
  getProductImageData: vi.fn(),
  updateProductDetails: vi.fn(),
  addImagesToDB: vi.fn(),
  setPrimaryImageByPublicID: vi.fn(),
  deleteImageDB: vi.fn(),
  getProductById: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock("@/lib/cloudinary/operations", () => ({
  uploadImageToCloudinary: vi.fn(),
  deleteImage: vi.fn(),
}));

vi.mock("@/app/api/product/[id]/patch-validation", () => ({
  validatePatchRequest: vi.fn(),
}));

// ============================================
// 2. TEST DATA
// ============================================

const productId = "a81044b7-3a0b-4ee6-aec2-ff1f5593faab";

const userId = "user-123";
const companyId = "company-123";

// Get the REAL validation function.
// The route tests use a mocked version.
let realValidatePatchRequest: typeof validatePatchRequest;

beforeAll(async () => {
  const actual = await vi.importActual<
    typeof import("@/app/api/product/[id]/patch-validation")
  >("@/app/api/product/[id]/patch-validation");

  realValidatePatchRequest = actual.validatePatchRequest;
});

function createRequest() {
  const formData = new FormData();

  formData.append("data", JSON.stringify({ name: "Office Laptop" }));

  return new NextRequest(`http://localhost/api/product/${productId}`, {
    method: "PATCH",
    body: formData,
  });
}

function createParams() {
  return {
    params: Promise.resolve({ id: productId }),
  };
}

const validCleanRequest = {
  productId,
  data: { name: "Office Laptop" },
  existingImages: undefined,
  newImagesWFiles: [],
} as Awaited<ReturnType<typeof validatePatchRequest>>;

// ============================================
// 3. DEFAULT MOCK BEHAVIOUR
// ============================================

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(requireUserId).mockResolvedValue(userId);

  vi.mocked(requireUserContext).mockResolvedValue({
    companyId,
    role: "admin",
  });

  vi.mocked(getProductForCompany).mockResolvedValue({} as never);

  vi.mocked(getProductImageData).mockResolvedValue([]);

  vi.mocked(updateProductDetails).mockResolvedValue({} as never);

  vi.mocked(addImagesToDB).mockResolvedValue(undefined);

  vi.mocked(setPrimaryImageByPublicID).mockResolvedValue({
    success: true,
  });

  vi.mocked(deleteImageDB).mockResolvedValue(undefined);

  vi.mocked(deleteImage).mockResolvedValue({
    deleted: true,
  });

  vi.mocked(uploadImageToCloudinary).mockResolvedValue({
    url: "https://cloudinary.com/image.png",
    publicId: "products/new-image",
  });

  vi.mocked(validatePatchRequest).mockResolvedValue(validCleanRequest);
});

// ============================================
// 4. PATCH VALIDATION TESTS
// ============================================

describe("validatePatchRequest", () => {
  // --------------------------------
  // VALID REQUESTS
  // --------------------------------

  it("should accept a PATCH containing only one new image", async () => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({}));
    formData.append("existingImages", JSON.stringify([]));

    formData.append(
      "newImages",
      JSON.stringify([
        {
          key: "image_0",
          isPrimary: true,
        },
      ]),
    );

    formData.append(
      "image_0",
      new File(["fake image"], "test.png", {
        type: "image/png",
      }),
    );

    await expect(
      realValidatePatchRequest(formData, productId),
    ).resolves.toBeDefined();
  });

  it("should accept a valid name update", async () => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({ name: "Office Laptop" }));

    const result = await realValidatePatchRequest(formData, productId);

    expect(result.productId).toBe(productId);
    expect(result.data).toEqual({ name: "Office Laptop" });
  });

  it("should accept a valid description update", async () => {
    const formData = new FormData();

    formData.append(
      "data",
      JSON.stringify({ description: "Office equipment" }),
    );

    const result = await realValidatePatchRequest(formData, productId);

    expect(result.data).toEqual({
      description: "Office equipment",
    });
  });

  // --------------------------------
  // INVALID REQUESTS
  // --------------------------------

  it("should reject a request with no fields", async () => {
    const formData = new FormData();

    await expect(realValidatePatchRequest(formData, productId)).rejects.toThrow(
      "Nothing to update",
    );
  });

  it("should reject an invalid product ID", async () => {
    const formData = new FormData();

    await expect(
      realValidatePatchRequest(formData, "invalid-id"),
    ).rejects.toThrow("Invalid product ID");
  });

  it("should reject invalid JSON", async () => {
    const formData = new FormData();

    formData.append("data", "{invalid json");

    await expect(realValidatePatchRequest(formData, productId)).rejects.toThrow(
      "Invalid JSON in form data",
    );
  });

  it("should reject a name shorter than 3 characters", async () => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({ name: "AB" }));

    await expect(
      realValidatePatchRequest(formData, productId),
    ).rejects.toThrow();
  });

  it("should reject an empty update object", async () => {
    const formData = new FormData();

    formData.append("data", JSON.stringify({}));

    await expect(realValidatePatchRequest(formData, productId)).rejects.toThrow(
      "Nothing to update",
    );
  });

  // --------------------------------
  // IMAGE FIELD REQUIREMENTS
  // --------------------------------

  it("should reject a request with only existingImages", async () => {
    const formData = new FormData();

    formData.append("existingImages", "[]");

    await expect(realValidatePatchRequest(formData, productId)).rejects.toThrow(
      "Both image fields are required",
    );
  });

  it("should reject a request with only newImages", async () => {
    const formData = new FormData();

    formData.append("newImages", "[]");

    await expect(realValidatePatchRequest(formData, productId)).rejects.toThrow(
      "Both image fields are required",
    );
  });

  it("should reject invalid existing image metadata", async () => {
    const formData = new FormData();

    formData.append(
      "existingImages",
      JSON.stringify([{ publicId: "ab", isPrimary: true }]),
    );

    formData.append("newImages", "[]");

    await expect(
      realValidatePatchRequest(formData, productId),
    ).rejects.toThrow();
  });

  it("should reject an invalid new image key", async () => {
    const formData = new FormData();

    formData.append("existingImages", "[]");

    formData.append(
      "newImages",
      JSON.stringify([{ key: "wrong_key", isPrimary: true }]),
    );

    await expect(
      realValidatePatchRequest(formData, productId),
    ).rejects.toThrow();
  });

  it("should reject an image update without a primary image", async () => {
    const formData = new FormData();

    formData.append("existingImages", "[]");

    formData.append(
      "newImages",
      JSON.stringify([{ key: "image_0", isPrimary: false }]),
    );

    formData.append(
      "image_0",
      new File(["test image"], "test.png", { type: "image/png" }),
    );

    await expect(
      realValidatePatchRequest(formData, productId),
    ).rejects.toThrow();
  });
});

// ============================================
// 5. PATCH ROUTE TESTS
// ============================================

describe("PATCH /api/product/[id]", () => {
  // ------------------------------------------
  // AUTHENTICATION
  // ------------------------------------------

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(requireUserId).mockResolvedValue(null);

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(401);

    const body = await response.json();

    expect(body.error.code).toBe("UNAUTHORIZED");

    expect(requireUserContext).not.toHaveBeenCalled();
    expect(getProductForCompany).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // AUTHORIZATION
  // ------------------------------------------

  it("should return 403 when user is not admin", async () => {
    vi.mocked(requireUserContext).mockResolvedValue({
      companyId,
      role: "staff",
    });

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(403);

    const body = await response.json();

    expect(body.error.code).toBe("FORBIDDEN");

    expect(getProductForCompany).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // TENANT ISOLATION
  // ------------------------------------------

  it("should return 404 when product belongs to another company", async () => {
    vi.mocked(requireUserContext).mockResolvedValue({
      companyId: "another-company",
      role: "admin",
    });

    vi.mocked(getProductForCompany).mockRejectedValue(
      new NotFoundError("Product not found"),
    );

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(404);

    const body = await response.json();

    expect(body.error.code).toBe("NOT_FOUND");

    expect(getProductForCompany).toHaveBeenCalledWith(
      productId,
      "another-company",
    );

    expect(updateProductDetails).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // RESOURCE ACCESS
  // ------------------------------------------

  it("should return 404 when product does not exist", async () => {
    vi.mocked(getProductForCompany).mockRejectedValue(
      new NotFoundError("Product not found"),
    );

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(404);

    const body = await response.json();

    expect(body.error).toEqual({
      code: "NOT_FOUND",
      message: "Product not found",
    });

    expect(updateProductDetails).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // VALIDATION
  // ------------------------------------------

  it("should return 400 when validation fails", async () => {
    vi.mocked(validatePatchRequest).mockRejectedValue(
      new ValidationError("Nothing to update"),
    );

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(400);

    const body = await response.json();

    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Nothing to update");

    expect(updateProductDetails).not.toHaveBeenCalled();
  });

  // ------------------------------------------
  // BUSINESS RULES: ADD NEW IMAGE
  // ------------------------------------------

  it("should upload and add a new primary image", async () => {
    const file = new File(["fake image"], "test.png", {
      type: "image/png",
    });

    vi.mocked(validatePatchRequest).mockResolvedValue({
      productId,
      data: undefined,
      existingImages: [],
      newImagesWFiles: [
        {
          key: "image_0",
          isPrimary: true,
          file,
        },
      ],
    } as Awaited<ReturnType<typeof validatePatchRequest>>);

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(200);

    expect(uploadImageToCloudinary).toHaveBeenCalledWith(file);

    expect(addImagesToDB).toHaveBeenCalledWith(
      [
        {
          url: "https://cloudinary.com/image.png",
          publicId: "products/new-image",
          isPrimary: false,
        },
      ],
      productId,
    );

    expect(setPrimaryImageByPublicID).toHaveBeenCalledWith(
      "products/new-image",
      productId,
    );
  });

  // ------------------------------------------
  // BUSINESS RULES: REMOVE OLD IMAGE
  // ------------------------------------------

  it("should remove images no longer included in the request", async () => {
    vi.mocked(validatePatchRequest).mockResolvedValue({
      productId,
      data: undefined,
      existingImages: [
        {
          publicId: "products/keep-image",
          isPrimary: true,
        },
      ],
      newImagesWFiles: [],
    } as Awaited<ReturnType<typeof validatePatchRequest>>);

    vi.mocked(getProductImageData).mockResolvedValue([
      {
        id: "image-1",
        productId,
        url: "https://cloudinary.com/keep.png",
        publicId: "products/keep-image",
        isPrimary: true,
        createdAt: new Date(),
      },
      {
        id: "image-2",
        productId,
        url: "https://cloudinary.com/remove.png",
        publicId: "products/remove-image",
        isPrimary: false,
        createdAt: new Date(),
      },
    ]);

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(200);

    expect(setPrimaryImageByPublicID).toHaveBeenCalledWith(
      "products/keep-image",
      productId,
    );

    expect(deleteImageDB).toHaveBeenCalledWith("products/remove-image");

    expect(deleteImage).toHaveBeenCalledWith("products/remove-image");
  });

  // ------------------------------------------
  // DATABASE SUCCESS
  // ------------------------------------------

  it("should successfully update product details", async () => {
    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(200);

    expect(updateProductDetails).toHaveBeenCalledWith(productId, {
      name: "Office Laptop",
    });

    expect(addImagesToDB).toHaveBeenCalledWith([], productId);

    const body = await response.json();

    expect(body).toBe("OK");
  });

  // ------------------------------------------
  // DATABASE FAILURE
  // ------------------------------------------

  it("should return 500 when database update fails", async () => {
    vi.mocked(updateProductDetails).mockRejectedValue(
      new Error("Database connection failed"),
    );

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(500);

    const body = await response.json();

    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");
  });

  // ------------------------------------------
  // CLOUDINARY FAILURE
  // ------------------------------------------

  it("should return 500 when Cloudinary upload fails", async () => {
    const file = new File(["fake image"], "test.png", {
      type: "image/png",
    });

    vi.mocked(validatePatchRequest).mockResolvedValue({
      productId,
      data: undefined,
      existingImages: [],
      newImagesWFiles: [
        {
          key: "image_0",
          isPrimary: true,
          file,
        },
      ],
    } as Awaited<ReturnType<typeof validatePatchRequest>>);

    vi.mocked(uploadImageToCloudinary).mockRejectedValue(
      new Error("Cloudinary unavailable"),
    );

    const response = await PATCH(createRequest(), createParams());

    expect(response.status).toBe(500);

    const body = await response.json();

    expect(body.error.code).toBe("INTERNAL_SERVER_ERROR");

    expect(addImagesToDB).not.toHaveBeenCalled();
  });
});

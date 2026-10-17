import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database ownership check.
vi.mock("@/app/api/product/[id]/existing-images-validation", () => ({
  validateExistingImagesBelongToProduct: vi.fn().mockResolvedValue(undefined),
}));

import { validatePatchRequest } from "@/app/api/product/[id]/patch-validation";
import { validateExistingImagesBelongToProduct } from "@/app/api/product/[id]/existing-images-validation";

const PRODUCT_ID = "550e8400-e29b-41d4-a716-446655440000";

function createFormData({
  data,
  existingImages,
  newImages,
  files = {},
}: {
  data?: unknown;
  existingImages?: unknown;
  newImages?: unknown;
  files?: Record<string, File>;
} = {}) {
  const formData = new FormData();

  if (data !== undefined) {
    formData.append("data", JSON.stringify(data));
  }

  if (existingImages !== undefined) {
    formData.append("existingImages", JSON.stringify(existingImages));
  }

  if (newImages !== undefined) {
    formData.append("newImages", JSON.stringify(newImages));
  }

  for (const [key, file] of Object.entries(files)) {
    formData.append(key, file);
  }

  return formData;
}

function createImageFile(name = "test.png", type = "image/png", size = 100) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validatePatchRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid product ID", async () => {
    const formData = createFormData({
      data: { name: "Valid product" },
    });

    await expect(validatePatchRequest(formData, "not-a-uuid")).rejects.toThrow(
      "Invalid product ID",
    );
  });

  it("rejects a request with no fields", async () => {
    const formData = createFormData();

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Nothing to update",
    );
  });

  it("rejects a request containing only existingImages", async () => {
    const formData = createFormData({
      existingImages: [{ publicId: "products/image-1", isPrimary: true }],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Both image fields are required",
    );
  });

  it("rejects a request containing only newImages", async () => {
    const formData = createFormData({
      newImages: [{ key: "image_0", isPrimary: true }],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Both image fields are required",
    );
  });

  it("rejects a name shorter than 3 characters", async () => {
    const formData = createFormData({
      data: { name: "AB" },
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow();
  });

  it("rejects malformed JSON", async () => {
    const formData = new FormData();
    formData.append("data", "{invalid json");

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Invalid JSON in form data",
    );
  });

  it("rejects an invalid new-image metadata key", async () => {
    const formData = createFormData({
      existingImages: [],
      newImages: [{ key: "wrong-key", isPrimary: true }],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow();
  });

  it("rejects an invalid image file type", async () => {
    const formData = createFormData({
      existingImages: [],
      newImages: [{ key: "image_0", isPrimary: true }],
      files: {
        image_0: createImageFile("test.txt", "text/plain"),
      },
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Invalid image format",
    );
  });

  it("rejects a missing image file", async () => {
    const formData = createFormData({
      existingImages: [],
      newImages: [{ key: "image_0", isPrimary: true }],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Missing image file for key: image_0",
    );
  });

  it("rejects two primary images", async () => {
    const formData = createFormData({
      existingImages: [{ publicId: "products/image-1", isPrimary: true }],
      newImages: [{ key: "image_0", isPrimary: true }],
      files: {
        image_0: createImageFile(),
      },
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Exactly one image must be primary",
    );
  });

  it("rejects a request with no primary image", async () => {
    const formData = createFormData({
      existingImages: [{ publicId: "products/image-1", isPrimary: false }],
      newImages: [],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Exactly one image must be primary",
    );
  });

  it("rejects ten new images", async () => {
    const newImages = Array.from({ length: 10 }, (_, index) => ({
      key: `image_${index}`,
      isPrimary: index === 0,
    }));

    const files = Object.fromEntries(
      newImages.map(({ key }) => [key, createImageFile()]),
    );

    const formData = createFormData({
      existingImages: [],
      newImages,
      files,
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "quantity of images incorrect",
    );
  });

  it("rejects two empty image arrays without product data", async () => {
    const formData = createFormData({
      existingImages: [],
      newImages: [],
    });

    await expect(validatePatchRequest(formData, PRODUCT_ID)).rejects.toThrow(
      "Nothing to update",
    );
  });

  it("accepts a data-only update", async () => {
    const formData = createFormData({
      data: { name: "Valid product" },
    });

    const result = await validatePatchRequest(formData, PRODUCT_ID);

    expect(result.productId).toBe(PRODUCT_ID);
    expect(result.data).toEqual({ name: "Valid product" });
    expect(result.existingImages).toBeUndefined();
    expect(result.newImagesWFiles).toEqual([]);

    expect(validateExistingImagesBelongToProduct).not.toHaveBeenCalled();
  });

  it("accepts one existing primary image and no new images", async () => {
    const existingImages = [{ publicId: "products/image-1", isPrimary: true }];

    const formData = createFormData({
      existingImages,
      newImages: [],
    });

    const result = await validatePatchRequest(formData, PRODUCT_ID);

    expect(result.existingImages).toEqual(existingImages);
    expect(result.newImagesWFiles).toEqual([]);

    expect(validateExistingImagesBelongToProduct).toHaveBeenCalledWith(
      PRODUCT_ID,
      existingImages,
    );
  });

  it("accepts one new primary image and no existing images", async () => {
    const formData = createFormData({
      existingImages: [],
      newImages: [{ key: "image_0", isPrimary: true }],
      files: {
        image_0: createImageFile(),
      },
    });

    const result = await validatePatchRequest(formData, PRODUCT_ID);

    expect(result.existingImages).toEqual([]);
    expect(result.newImagesWFiles).toHaveLength(1);
    expect(result.newImagesWFiles[0].key).toBe("image_0");
    expect(result.newImagesWFiles[0].isPrimary).toBe(true);

    expect(validateExistingImagesBelongToProduct).toHaveBeenCalledWith(
      PRODUCT_ID,
      [],
    );
  });
});

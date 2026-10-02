import { describe, expect, it } from "vitest";
import { validateProductImages } from "@/app/validation/product-image";

describe("validateProductImages", () => {
  function createFormData(existingImages?: string, newImages?: string) {
    const formData = new FormData();

    if (existingImages !== undefined) {
      formData.append("existingImages", existingImages);
    }

    if (newImages !== undefined) {
      formData.append("newImages", newImages);
    }

    return formData;
  }

  it("returns null when no image data is provided", () => {
    const formData = new FormData();

    const result = validateProductImages(formData);

    expect(result).toBeNull();
  });

  it("returns null when both image arrays are empty", () => {
    const formData = createFormData("[]", "[]");

    const result = validateProductImages(formData);

    expect(result).toBeNull();
  });

  it("accepts a valid existing image", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "product-image-123",
          isPrimary: true,
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).not.toBeNull();
  });

  it("accepts multiple valid existing images", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "product-image-123",
          isPrimary: true,
        },
        {
          publicId: "product-image-456",
          isPrimary: false,
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).not.toBeNull();
  });

  it("rejects existing image with only publicId", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "product-image-123",
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("rejects existing image with only isPrimary", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          isPrimary: true,
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("rejects existing image with invalid publicId", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "x",
          isPrimary: true,
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("rejects existing image with invalid isPrimary", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "product-image-123",
          isPrimary: "true",
        },
      ]),
      "[]",
    );

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("rejects invalid existingImages JSON", () => {
    const formData = createFormData("not-valid-json", "[]");

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("rejects invalid newImages JSON", () => {
    const formData = createFormData("[]", "not-valid-json");

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });

  it("accepts existing and new image data together", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "product-image-123",
          isPrimary: true,
        },
      ]),
      JSON.stringify([
        {
          key: "file0",
          isPrimary: false,
        },
      ]),
    );

    formData.append(
      "file0",
      new File(["test"], "test.png", {
        type: "image/png",
      }),
    );

    const result = validateProductImages(formData);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).not.toBeNull();
  });

  it("accepts exactly 5 images", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "image-1",
          isPrimary: true,
        },
        {
          publicId: "image-2",
          isPrimary: false,
        },
        {
          publicId: "image-3",
          isPrimary: false,
        },
      ]),
      JSON.stringify([
        {
          key: "file0",
          isPrimary: false,
        },
        {
          key: "file1",
          isPrimary: false,
        },
      ]),
    );

    formData.append(
      "file0",
      new File(["test"], "one.png", {
        type: "image/png",
      }),
    );

    formData.append(
      "file1",
      new File(["test"], "two.png", {
        type: "image/png",
      }),
    );

    const result = validateProductImages(formData);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).not.toBeNull();
  });

  it("rejects more than 5 images", () => {
    const formData = createFormData(
      JSON.stringify([
        {
          publicId: "image-1",
          isPrimary: true,
        },
        {
          publicId: "image-2",
          isPrimary: false,
        },
        {
          publicId: "image-3",
          isPrimary: false,
        },
      ]),
      JSON.stringify([
        {
          key: "file0",
          isPrimary: false,
        },
        {
          key: "file1",
          isPrimary: false,
        },
        {
          key: "file2",
          isPrimary: false,
        },
      ]),
    );

    formData.append(
      "file0",
      new File(["test"], "one.png", {
        type: "image/png",
      }),
    );

    formData.append(
      "file1",
      new File(["test"], "two.png", {
        type: "image/png",
      }),
    );

    formData.append(
      "file2",
      new File(["test"], "three.png", {
        type: "image/png",
      }),
    );

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });
});

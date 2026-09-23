import { validateProductImages } from "@/app/validation/product-image";
import { stringify } from "querystring";
import { describe, expect, it } from "vitest";

describe("validateProductImages - image data presence", () => {
  it("returns null when no image data is provided", () => {
    const formData = new FormData();

    const result = validateProductImages(formData);

    expect(result).toBeNull();
  });

  it("returns a Response (Error) when only one image field is provided", () => {
    const formData = new FormData();

    formData.append("existingImages", "[]");

    const result = validateProductImages(formData);

    expect(result).toBeInstanceOf(Response);
  });
});

describe("validation of Existing image Format", () => {
  it("Should return Response 404 on a Existing Image stringtype", () => {
    const formData = new FormData();
    formData.append("existingImages", "string");

    const result = validateProductImages(formData);
    expect(result).toBeInstanceOf(Response);
  });
  it("test Existing Image not right Format data", () => {
    const formData = new FormData();
    const valuetest = { name: "sam", age: 23 };
    const jsonValue = JSON.stringify(valuetest);
    formData.append("existingImages", jsonValue);

    const result = validateProductImages(formData);
    expect(result).toBeInstanceOf(Response);
  });

  ////
  it("test correct data format", () => {
    const formData = new FormData();
    const valuetest = { publicId: "sfsafdsfsfsfs", isPrimary: 23 };
    const jsonValue = JSON.stringify(valuetest);
    formData.append("existingImages", jsonValue);

    const result = validateProductImages(formData);
    expect(result).toBeNull;
  });
});

describe("Existing images format", () => {
  it("accepts an empty array", () => {
    // No existing images to update
    const formData = new FormData();
    const valuetest: [] = [];
    const jsonValue = JSON.stringify(valuetest);
    formData.append("existingImages", jsonValue);

    const result = validateProductImages(formData);
    expect(result).toBeNull;
  });

  it("accepts an empty image object", () => {
    // Existing image object with no fields to update
    const formData = new FormData();

    const jsonValue = JSON.stringify([{}]);
    formData.append("existingImages", jsonValue);

    const result = validateProductImages(formData);
    expect(result).toBeNull;
  });

  it("accepts an image with only publicId", () => {
    // Only publicId is being updated
    const formData = new FormData();
    const valuetest = [{ publicID: "etreter3232" }];
    const jsonValue = JSON.stringify(valuetest);

    formData.append("existingImages", jsonValue);

    const result = validateProductImages(formData);
    expect(result).toBeNull;
  });

  it("reject an image with only isPrimary", () => {
    // Only publicId is being updated
    const formData = new FormData();
    const valuetest = [{ isPrimary: true }];
    const jsonValue = JSON.stringify(valuetest);
    formData.append("existingImages", jsonValue);
    formData.append("newImages", JSON.stringify([]));

    const result = validateProductImages(formData);
    expect(result).toBeInstanceOf(Response);
  });

  it("accepts an image with publicId and isPrimary", () => {
    const formData = new FormData();
    const valuetest = [{ isPrimary: true, publicId: "46546465464" }];
    const jsonValue = JSON.stringify(valuetest);
    formData.append("existingImages", jsonValue);
    formData.append("newImages", JSON.stringify([]));

    const result = validateProductImages(formData);
    expect(result).not.toBeInstanceOf(Response);
  });

  it("rejects an invalid publicId", () => {
    // publicId exists but doesn't satisfy the schema
  });

  it("rejects an invalid isPrimary value", () => {
    // isPrimary exists but isn't boolean
  });
});

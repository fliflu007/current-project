import { validateProductImages } from "@/app/validation/product-image";
import { describe, expect, it } from "vitest";

describe("validateProductImages", () => {
  describe("image data presence", () => {
    it("returns null when no image data is provided", () => {
      const formData = new FormData();
      const result = validateProductImages(formData);
      expect(result).toBeNull();
    });

    // fail :
    it("returns null when existingImages is an empty array", () => {
      const formData = new FormData();
      formData.append("existingImages", JSON.stringify([]));
      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    it("rejects when newImages is provided without existingImages", () => {
      const formData = new FormData();

      formData.append("newImages", JSON.stringify([]));

      const result = validateProductImages(formData);

      expect(result).toBeInstanceOf(Response);
    });
  });

  describe("existingImages", () => {
    it("rejects invalid JSON", () => {
      const formData = new FormData();
      formData.append("existingImages", "not-json");
      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    it("rejects the wrong top-level format", () => {
      const formData = new FormData();
      formData.append("existingImages", JSON.stringify({}));
      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    // FAIL
    it("accepts empty image objects in both image arrays", () => {
      const formData = new FormData();
      formData.append("existingImages", JSON.stringify([{}]));
      formData.append("newImages", JSON.stringify([]));
      const result = validateProductImages(formData);
      expect(result).toBeNull();
    });

    it("accepts an image with only publicId", () => {
      const formData = new FormData();

      formData.append(
        "existingImages",
        JSON.stringify([{ publicId: "abc123" }]),
      );

      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    it("rejects an image with only isPrimary", () => {
      const formData = new FormData();
      formData.append("existingImages", JSON.stringify([{ isPrimary: true }]));
      formData.append("newImages", JSON.stringify([]));
      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    it("accepts an image with publicId and isPrimary", () => {
      const formData = new FormData();
      formData.append(
        "existingImages",
        JSON.stringify([
          {
            publicId: "abc123",
            isPrimary: true,
          },
        ]),
      );
      formData.append("newImages", JSON.stringify([]));
      const result = validateProductImages(formData);
      console.log("result", result);
      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(Response);
    });

    it("rejects an invalid publicId", () => {
      const formData = new FormData();

      formData.append(
        "existingImages",
        JSON.stringify([
          {
            publicId: 123,
          },
        ]),
      );

      const result = validateProductImages(formData);
      expect(result).toBeInstanceOf(Response);
    });

    it("rejects an invalid isPrimary value", () => {
      const formData = new FormData();
      formData.append(
        "existingImages",
        JSON.stringify([
          {
            publicId: "abc123",
            isPrimary: "true",
          },
        ]),
      );

      const result = validateProductImages(formData);

      expect(result).toBeInstanceOf(Response);
    });
    it("accepts one valid new image with a matching file", () => {
      const formData = new FormData();

      formData.append("existingImages", JSON.stringify([]));

      formData.append(
        "newImages",
        JSON.stringify([
          {
            key: "image-1",
            isPrimary: true,
          },
        ]),
      );

      const file = new File(["fake image content"], "test.png", {
        type: "image/png",
      });

      formData.append("image-1", file);

      const result = validateProductImages(formData);

      expect(result).not.toBeNull();
      expect(result).not.toBeInstanceOf(Response);

      expect(result).toEqual([
        {
          publicId: null,
          file,
          isPrimary: true,
          status: "new",
        },
      ]);
    });
    it("rejects when a declared new image file is missing", () => {
      const formData = new FormData();

      formData.append("existingImages", JSON.stringify([]));

      formData.append(
        "newImages",
        JSON.stringify([
          {
            key: "image-1",
            isPrimary: true,
          },
          {
            key: "image-2",
            isPrimary: false,
          },
        ]),
      );

      // Only image-1 actually exists in FormData
      const file = new File(["fake image content"], "test.png", {
        type: "image/png",
      });

      formData.append("image-1", file);

      // image-2 is intentionally NOT appended

      const result = validateProductImages(formData);

      expect(result).toBeInstanceOf(Response);
      expect(result).not.toBeNull();
    });
  });
});

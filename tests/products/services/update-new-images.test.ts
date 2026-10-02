import { afterEach, expect, it, vi } from "vitest";
import { updateNewImages } from "@/services/products.service";
import { NormalizedImages } from "@/types/product";
import { db } from "@/db";
import * as imageService from "@/services/images";

afterEach(() => {
  vi.restoreAllMocks();
});

it("uploads a new image to Cloudinary with the correct file", async () => {
  const file = new File(["test"], "test.jpg", {
    type: "image/jpeg",
  });

  const normalizedImages: NormalizedImages = [
    {
      status: "new",
      publicId: null,
      isPrimary: true,
      file,
    },
  ];

  const addImageMock = vi.spyOn(imageService, "addImage").mockResolvedValue({
    url: "https://example.com/test.jpg",
    publicId: "cloudinary-test-id",
  });

  const dbInsertMock = vi.fn().mockResolvedValue(undefined);

  const dbTransactionMock = vi
    .spyOn(db, "transaction")
    .mockImplementation(async (callback) => {
      const tx = {
        insert: vi.fn().mockReturnValue({
          values: dbInsertMock,
        }),
      };

      return callback(tx as any);
    });

  await updateNewImages("product-123", normalizedImages);

  expect(addImageMock).toHaveBeenCalledTimes(1);
  expect(addImageMock).toHaveBeenCalledWith(file);

  expect(dbTransactionMock).toHaveBeenCalledTimes(1);
});

it("passes the Cloudinary result and productId to the database", async () => {
  const file = new File(["test"], "test.jpg", {
    type: "image/jpeg",
  });

  const normalizedImages: NormalizedImages = [
    {
      status: "new",
      publicId: null,
      isPrimary: true,
      file,
    },
  ];

  vi.spyOn(imageService, "addImage").mockResolvedValue({
    url: "https://example.com/test.jpg",
    publicId: "cloudinary-test-id",
  });

  const valuesMock = vi.fn().mockResolvedValue(undefined);

  vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
    const tx = {
      insert: vi.fn().mockReturnValue({
        values: valuesMock,
      }),
    };

    return callback(tx as any);
  });

  await updateNewImages("product-123", normalizedImages);

  expect(valuesMock).toHaveBeenCalledWith({
    url: "https://example.com/test.jpg",
    publicId: "cloudinary-test-id",
    productId: "product-123",
  });
});

it("uploads and inserts multiple new images", async () => {
  const fileA = new File(["a"], "a.jpg", {
    type: "image/jpeg",
  });

  const fileB = new File(["b"], "b.jpg", {
    type: "image/jpeg",
  });

  const normalizedImages: NormalizedImages = [
    {
      status: "new",
      publicId: null,
      isPrimary: true,
      file: fileA,
    },
    {
      status: "new",
      publicId: null,
      isPrimary: false,
      file: fileB,
    },
  ];

  const addImageMock = vi
    .spyOn(imageService, "addImage")
    .mockResolvedValueOnce({
      url: "https://example.com/a.jpg",
      publicId: "cloudinary-a",
    })
    .mockResolvedValueOnce({
      url: "https://example.com/b.jpg",
      publicId: "cloudinary-b",
    });

  const valuesMock = vi.fn().mockResolvedValue(undefined);

  vi.spyOn(db, "transaction").mockImplementation(async (callback) => {
    const tx = {
      insert: vi.fn().mockReturnValue({
        values: valuesMock,
      }),
    };

    return callback(tx as any);
  });

  await updateNewImages("product-123", normalizedImages);

  expect(addImageMock).toHaveBeenCalledTimes(2);
  expect(addImageMock).toHaveBeenNthCalledWith(1, fileA);
  expect(addImageMock).toHaveBeenNthCalledWith(2, fileB);

  expect(valuesMock).toHaveBeenCalledTimes(2);
});

it("does nothing when there are no new images", async () => {
  const normalizedImages: NormalizedImages = [
    {
      status: "existing",
      publicId: "existing-image",
      isPrimary: true,
      file: null,
    },
  ];

  const addImageMock = vi.spyOn(imageService, "addImage");

  await updateNewImages("product-123", normalizedImages);

  expect(addImageMock).not.toHaveBeenCalled();
});

it("stops and does not insert into the database when Cloudinary fails", async () => {
  const file = new File(["test"], "test.jpg", {
    type: "image/jpeg",
  });

  const normalizedImages: NormalizedImages = [
    {
      status: "new",
      publicId: null,
      isPrimary: true,
      file,
    },
  ];

  vi.spyOn(imageService, "addImage").mockRejectedValue(
    new Error("Cloudinary upload failed"),
  );

  const transactionMock = vi.spyOn(db, "transaction");

  await expect(
    updateNewImages("product-123", normalizedImages),
  ).rejects.toThrow("Cloudinary upload failed");

  expect(transactionMock).not.toHaveBeenCalled();
});

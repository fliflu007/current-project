import { afterEach, expect, it, vi } from "vitest";
import { updateExistingImages } from "@/services/products.service";
import { NormalizedImages } from "@/types/product";
import { db } from "@/db";
import * as imageService from "@/services/images";

afterEach(() => {
  vi.restoreAllMocks();
});

it("succeeds when sending an already existing image", async () => {
  const test: NormalizedImages = [
    {
      status: "existing",
      publicId: "hth1kg1xuwtfa9nyc7ot",
      isPrimary: true,
      file: null,
    },
  ];

  const result = await updateExistingImages(
    "6a68ccc8-eded-406f-ba7f-3233d02ef904",
    test,
  );

  expect(result).toEqual([]);
});

it("throws an error when sending a non-existing image", async () => {
  const test: NormalizedImages = [
    {
      status: "existing",
      publicId: "hth1kg1xu",
      isPrimary: true,
      file: null,
    },
  ];

  await expect(
    updateExistingImages("6a68ccc8-eded-406f-ba7f-3233d02ef904", test),
  ).rejects.toThrow(
    "The existing image provided was not found in the database",
  );
});

it("checks if images missing from incoming images go to the erase list", async () => {
  const dbImageList = [
    {
      id: "image-a-id",
      productId: "product-1",
      url: "https://example.com/a.jpg",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      createdAt: new Date(),
    },
    {
      id: "image-b-id",
      productId: "product-1",
      url: "https://example.com/b.jpg",
      publicId: "bbbbbbbbbbbbbbbbbbbbbb",
      isPrimary: false,
      createdAt: new Date(),
    },
    {
      id: "image-c-id",
      productId: "product-1",
      url: "https://example.com/c.jpg",
      publicId: "cccccccccccccccccccccc",
      isPrimary: false,
      createdAt: new Date(),
    },
  ];

  const testAC: NormalizedImages = [
    {
      status: "existing",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      file: null,
    },
    {
      status: "existing",
      publicId: "cccccccccccccccccccccc",
      isPrimary: false,
      file: null,
    },
  ];

  const whereMock = vi.fn().mockResolvedValue(dbImageList);

  const fromMock = vi.fn().mockReturnValue({
    where: whereMock,
  });

  vi.spyOn(db, "select").mockReturnValue({
    from: fromMock,
  } as any);

  vi.spyOn(imageService, "deleteImage").mockResolvedValue({
    deleted: true,
  });

  const result = await updateExistingImages("product-1", testAC);

  expect(result).toEqual([
    {
      id: "image-b-id",
      productId: "product-1",
      url: "https://example.com/b.jpg",
      publicId: "bbbbbbbbbbbbbbbbbbbbbb",
      isPrimary: false,
      createdAt: expect.any(Date),
    },
  ]);
});

it("throws when Cloudinary deletion fails and does not delete DB records", async () => {
  const dbImageList = [
    {
      id: "image-a-id",
      productId: "product-1",
      url: "https://example.com/a.jpg",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      createdAt: new Date(),
    },
    {
      id: "image-b-id",
      productId: "product-1",
      url: "https://example.com/b.jpg",
      publicId: "bbbbbbbbbbbbbbbbbbbbbb",
      isPrimary: false,
      createdAt: new Date(),
    },
  ];

  const normalizedImages: NormalizedImages = [
    {
      status: "existing",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      file: null,
    },
  ];

  const whereMock = vi.fn().mockResolvedValue(dbImageList);

  const fromMock = vi.fn().mockReturnValue({
    where: whereMock,
  });

  vi.spyOn(db, "select").mockReturnValue({
    from: fromMock,
  } as any);

  vi.spyOn(imageService, "deleteImage").mockResolvedValue({
    deleted: false,
  });

  const dbDeleteMock = vi.spyOn(db, "delete");

  await expect(
    updateExistingImages("product-1", normalizedImages),
  ).rejects.toThrow("Failed to delete image from Cloudinary");

  expect(dbDeleteMock).not.toHaveBeenCalled();
});

it("deletes multiple images from Cloudinary and then removes them from DB", async () => {
  const dbImageList = [
    {
      id: "image-a-id",
      productId: "product-1",
      url: "https://example.com/a.jpg",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      createdAt: new Date(),
    },
    {
      id: "image-b-id",
      productId: "product-1",
      url: "https://example.com/b.jpg",
      publicId: "bbbbbbbbbbbbbbbbbbbbbb",
      isPrimary: false,
      createdAt: new Date(),
    },
    {
      id: "image-c-id",
      productId: "product-1",
      url: "https://example.com/c.jpg",
      publicId: "cccccccccccccccccccccc",
      isPrimary: false,
      createdAt: new Date(),
    },
  ];

  const normalizedImages: NormalizedImages = [
    {
      status: "existing",
      publicId: "aaaaaaaaaaaaaaaaaaaaaa",
      isPrimary: true,
      file: null,
    },
  ];

  const whereMock = vi.fn().mockResolvedValue(dbImageList);

  const fromMock = vi.fn().mockReturnValue({
    where: whereMock,
  });

  vi.spyOn(db, "select").mockReturnValue({
    from: fromMock,
  } as any);

  const deleteImageMock = vi
    .spyOn(imageService, "deleteImage")
    .mockResolvedValue({
      deleted: true,
    });

  const dbDeleteWhereMock = vi.fn().mockResolvedValue(undefined);

  const dbDeleteMock = vi.spyOn(db, "delete").mockReturnValue({
    where: dbDeleteWhereMock,
  } as any);

  const result = await updateExistingImages("product-1", normalizedImages);

  expect(result).toEqual([dbImageList[1], dbImageList[2]]);

  expect(deleteImageMock).toHaveBeenCalledTimes(2);
  expect(deleteImageMock).toHaveBeenCalledWith("bbbbbbbbbbbbbbbbbbbbbb");
  expect(deleteImageMock).toHaveBeenCalledWith("cccccccccccccccccccccc");

  expect(dbDeleteMock).toHaveBeenCalledTimes(1);
});

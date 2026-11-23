import { describe, it, expect, vi, beforeEach } from "vitest";

// ==================================================
// 1. MOCKS
// ==================================================

const validProductId = "550e8400-e29b-41d4-a716-446655440000";

const mocks = vi.hoisted(() => ({
  requireUserId: vi.fn(),
  requireUserContext: vi.fn(),
  deleteImage: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/lib/auth/require-user", () => ({
  requireUserId: mocks.requireUserId,
}));

vi.mock("@/lib/auth/require-user-context", () => ({
  requireUserContext: mocks.requireUserContext,
}));

vi.mock("@/lib/cloudinary/operations", () => ({
  deleteImage: mocks.deleteImage,
}));

vi.mock("@/db", () => ({
  db: {
    transaction: mocks.transaction,
  },
}));

import { deleteByIdAction } from "@/app/(dashboard)/products/actions/action";

// ==================================================
// 2. DATABASE MOCK
// ==================================================

type TransactionMockOptions = {
  productsFound?: { id: string }[];
  images?: { publicId: string }[];
  deletedProducts?: { id: string }[];
};

function createTransactionMock({
  productsFound = [],
  images = [],
  deletedProducts = [],
}: TransactionMockOptions = {}) {
  let deleteCall = 0;

  const tx = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(productsFound),
      }),
    }),

    delete: vi.fn(() => {
      const currentDelete = deleteCall++;

      return {
        where: vi.fn().mockReturnValue({
          returning: vi
            .fn()
            .mockResolvedValue(
              currentDelete === 0
                ? images
                : currentDelete === 2
                  ? deletedProducts
                  : [],
            ),
        }),
      };
    }),
  };

  mocks.transaction.mockImplementation(async (callback) => {
    return callback(tx);
  });

  return tx;
}

// ==================================================
// 3. TESTS
// ==================================================

describe("deleteByIdAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ----------------------------------------------
  // VALIDATION
  // ----------------------------------------------

  it("should return { success: false, error: 'Invalid product ID' } when product ID is not a valid UUID", async () => {
    const result = await deleteByIdAction("invalid-id");

    expect(result).toEqual({
      success: false,
      error: "Invalid product ID",
    });

    expect(mocks.requireUserId).not.toHaveBeenCalled();
    expect(mocks.requireUserContext).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  // ----------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------

  it("should return { success: false, error: 'authentification error' } when user is not authenticated", async () => {
    mocks.requireUserId.mockResolvedValue(null);

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: false,
      error: "authentification error",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  // ----------------------------------------------
  // AUTHORIZATION
  // ----------------------------------------------

  it("should return { success: false, error: 'not admin, can not delete product' } when user is not an admin", async () => {
    mocks.requireUserId.mockResolvedValue("user-123");

    mocks.requireUserContext.mockResolvedValue({
      role: "staff",
      companyId: "company-123",
    });

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: false,
      error: "not admin, can not delete product",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  // ----------------------------------------------
  // PRODUCT NOT FOUND / WRONG COMPANY
  // ----------------------------------------------

  it("should return { success: false, error: 'Error deleting product' } when product does not exist or belongs to another company", async () => {
    mocks.requireUserId.mockResolvedValue("user-123");

    mocks.requireUserContext.mockResolvedValue({
      role: "admin",
      companyId: "company-123",
    });

    const tx = createTransactionMock({
      productsFound: [],
    });

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: false,
      error: "Error deleting product",
    });

    expect(tx.select).toHaveBeenCalledOnce();
    expect(tx.delete).not.toHaveBeenCalled();
  });

  // ----------------------------------------------
  // SUCCESSFUL DELETION
  // ----------------------------------------------

  it("should return { success: true } when admin successfully deletes a product, its images and inventory movements", async () => {
    mocks.requireUserId.mockResolvedValue("user-123");

    mocks.requireUserContext.mockResolvedValue({
      role: "admin",
      companyId: "company-123",
    });

    const tx = createTransactionMock({
      productsFound: [{ id: validProductId }],
      images: [
        { publicId: "products/image-1" },
        { publicId: "products/image-2" },
      ],
      deletedProducts: [{ id: validProductId }],
    });

    mocks.deleteImage.mockResolvedValue(undefined);

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: true,
    });

    // Product lookup
    expect(tx.select).toHaveBeenCalledOnce();

    // Delete images, movements and product
    expect(tx.delete).toHaveBeenCalledTimes(3);

    // Cloudinary cleanup
    expect(mocks.deleteImage).toHaveBeenCalledTimes(2);

    expect(mocks.deleteImage).toHaveBeenNthCalledWith(1, "products/image-1");

    expect(mocks.deleteImage).toHaveBeenNthCalledWith(2, "products/image-2");

    // Database transaction
    expect(mocks.transaction).toHaveBeenCalledOnce();
  });

  // ----------------------------------------------
  // DATABASE FAILURE
  // ----------------------------------------------

  it("should return { success: false, error: 'Error deleting product' } when database transaction fails", async () => {
    mocks.requireUserId.mockResolvedValue("user-123");

    mocks.requireUserContext.mockResolvedValue({
      role: "admin",
      companyId: "company-123",
    });

    mocks.transaction.mockRejectedValue(
      new Error("Database connection failed"),
    );

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: false,
      error: "Error deleting product",
    });

    expect(mocks.transaction).toHaveBeenCalledOnce();
    expect(mocks.deleteImage).not.toHaveBeenCalled();
  });

  // ----------------------------------------------
  // UNEXPECTED AUTHENTICATION CONTEXT ERROR
  // ----------------------------------------------

  it("should return { success: false, error: 'Error deleting product' } when requireUserContext throws an error", async () => {
    mocks.requireUserId.mockResolvedValue("user-123");

    mocks.requireUserContext.mockRejectedValue(
      new Error("Unable to retrieve user context"),
    );

    const result = await deleteByIdAction(validProductId);

    expect(result).toEqual({
      success: false,
      error: "Error deleting product",
    });

    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

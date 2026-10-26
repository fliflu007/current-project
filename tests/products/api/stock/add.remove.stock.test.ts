// BRinging the API route point

// Loading data to the request

// wow need to skip auth (( I Can perhaps provide a existing user for test only))

// also i can bring data of an existin product.

// test success

// test validation error

// test missing
import { beforeEach, describe, expect, it, vi } from "vitest";

const userIdTest = "3c818426-bdd0-4e89-a3a9-b83cd07ffe55";
const productIdTest = "2808673e-4a12-4144-8093-6628173394b2";

// Setup intercept import  1. Register a mock for this module
vi.mock("@/lib/auth/require-user", () => ({
  //create fake function  export it as requireUserId
  requireUserId: vi.fn(),
}));

// 2. Import the mocked function
import { requireUserId } from "@/lib/auth/require-user";

import { POST } from "@/app/api/stock/route";

// 3. Get a convenient reference so you can configure it
const mockRequireUserId = vi.mocked(requireUserId);

// setup Clearance of Mock history at each IT trigger
beforeEach(() => {
  // history clearance at each it
  vi.clearAllMocks();
  // DEFAULT VALUE OF MOCK RETURNED
  mockRequireUserId.mockResolvedValue(userIdTest);
});

describe("POST /api/stock", () => {
  it("returns 401 when the user is not authenticated", async () => {
    // SETUP OR RETURN MOCK
    mockRequireUserId.mockResolvedValue(null);

    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).not.toBeNull();
    expect(mockRequireUserId).toHaveBeenCalledOnce();
    console.log("body", body);
  });

  it("returns 400 when empty json sent", async () => {
    // setup return of mock

    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).not.toBeNull();
    expect(mockRequireUserId).toHaveBeenCalledOnce();
    console.log("body", body);
  });
  it("invalide Json failure", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{rf invalide",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error.message).toBe("Invalid JSON body");
    expect(mockRequireUserId).not.toHaveBeenCalledOnce();
    console.log("body", body);
  });

  const validStockData = {
    productId: "11111111-1111-4111-8111-111111111111",
    type: "IN",
    quantity: 5,
  };

  // 1. Missing required fields
  it("returns 400 when required fields are missing", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).not.toBeNull();
    expect(mockRequireUserId).toHaveBeenCalledOnce();
  });

  // 2. Invalid stock type
  it("returns 400 when stock type is invalid", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validStockData,
        type: "OTHER",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).not.toBeNull();
  });

  // 3. Invalid quantity
  it("returns 400 when quantity is negative", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validStockData,
        quantity: -1,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).not.toBeNull();
  });
  it("returns 404 when product does not exist", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "11111111-1111-4111-8111-111111111111",
        quantity: 5,
        reason: "Restock",
        type: "IN",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
  it("successfully adds stock to a product", async () => {
    const request = new Request("http://localhost:3000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: productIdTest, // Your existing product UUID
        quantity: 5,
        reason: "Test restock",
        type: "IN",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(body.data).not.toBeNull();
    expect(body.data.transaction).not.toBeNull();
    expect(body.data.product).not.toBeNull();
  });
});

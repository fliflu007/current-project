import { GET } from "@/app/api/product/route";

import { describe, it, expect } from "vitest";

describe("GET /api/product - integration", () => {
  it("returns 200 and an array of products", async () => {
    // ACT
    const response = await GET();
    const body = await response.json();

    // ASSERT
    expect(response.status).toBe(200);
    expect(body.error).toBeNull();
    expect(Array.isArray(body.data)).toBe(true);
  });
});

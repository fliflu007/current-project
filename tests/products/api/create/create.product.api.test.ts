// | Automated Test                 | Expected Behaviour | Result |
// | ------------------------------ | ------------------ | ------ |
// | Valid product data             | Accept validation  | passed |
// | Name shorter than 3 characters | Reject validation  | passed |
// | Name longer than 25 characters | Reject validation  | passed |
// | Negative quantity              | Reject validation  | passed |
// | Missing required name          | Reject validation  | passed |

import { describe, expect, it } from "vitest";
import { createProductDataSchema } from "@/schemas/product";

describe("Create Product BackEnd test", () => {
  it("accept valide Product data", () => {
    const data = {
      name: "Laptop",
      description: "Office laptop",
      quantity: 5,
    };
    expect(createProductDataSchema.safeParse(data).success).toBe(true);
  });

  it("Name shorter than 3 characters", () => {
    const data = {
      name: "Lp",
      description: "Office laptop",
      quantity: 5,
    };
    expect(createProductDataSchema.safeParse(data).success).toBe(false);
  });

  it("refuse if Name longer than 25 characters", () => {
    let data = {
      name: "Lpaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      description: "Office laptop",
      quantity: 5,
    };

    expect(createProductDataSchema.safeParse(data).success).toBe(false);
  });
  it("refuse if quantity negative", () => {
    let data = {
      name: "Laptop",
      description: "Office laptop",
      quantity: -5,
    };

    expect(createProductDataSchema.safeParse(data).success).toBe(false);
  });
  it("refuse if name is missing", () => {
    let data = {
      description: "Office laptop",
      quantity: 5,
    };

    expect(createProductDataSchema.safeParse(data).success).toBe(false);
  });
});

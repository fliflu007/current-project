import { test, expect } from "@playwright/test";

const imagePath = "tests/e2e/image/image.sample.png";

test.describe("Create Product", () => {
  test("opens the create product page", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    await expect(
      page.getByText("CREATE PRODUCT", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Create Product" }),
    ).toBeVisible();
  });

  test("shows validation error for a name shorter than 3 characters", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/products/new");

    await page.getByLabel("Product name").fill("AB");

    await expect(
      page.getByText("Name must be at least 3 characters"),
    ).toBeVisible();
  });

  test("does not submit without an image", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    await page.getByLabel("Product name").fill("No Image Product");
    await page.getByLabel("Initial Stock").fill("10");

    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(
      page.getByText("Requires at least one image..."),
    ).toBeVisible();
  });

  test("creates a product successfully", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    const productName = `E2E Product ${Date.now()}`;

    await page.getByLabel("Product name").fill(productName);
    await page.getByLabel("Initial Stock").fill("10");

    await page.getByLabel("Product image").setInputFiles(imagePath);

    await page.getByRole("button", { name: "Create Product" }).click();
    // get the inside text of Toast
    await expect(page.getByText("Product created successfully")).toBeVisible();
  });

  test("shows an error when creating a duplicate product", async ({ page }) => {
    const productName = `Duplicate Product ${Date.now()}`;

    // First creation
    await page.goto("http://localhost:3000/products/new");

    await page.getByLabel("Product name").fill(productName);
    await page.getByLabel("Initial Stock").fill("10");

    await page.getByLabel("Product image").setInputFiles(imagePath);

    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(page.getByText("Product created successfully")).toBeVisible();

    // Second creation with the same name
    await page.goto("http://localhost:3000/products/new");

    await page.getByLabel("Product name").fill(productName);
    await page.getByLabel("Initial Stock").fill("5");

    await page.getByLabel("Product image").setInputFiles(imagePath);

    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(
      page.getByText("A product with this name already exists."),
    ).toBeVisible();
  });

  test("shows an error for an invalid image", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    await page.getByLabel("Product name").fill("Invalid Image Product");

    await page.getByLabel("Product image").setInputFiles({
      name: "test.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("This is not an image"),
    });

    await expect(
      page.getByText(
        "One of th image you tried to add has a size or format issue !!",
      ),
    ).toBeVisible();
  });
});

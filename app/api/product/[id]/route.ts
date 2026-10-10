import z from "zod";

import { ValidationError } from "@/lib/errors/errors";

import {
  getProductById,
  getProductImageData,
  updateExistingImages,
  updateNewImages,
  updateProductDetails,
} from "@/services/products.service";
import {
  newImagesSchema,
  patchProductDataSchema,
} from "@/app/products/[id]/edit/patch-types-schema";
export const patchProductDataApiSchema = patchProductDataSchema.partial();

import { existingImagesSchema } from "@/app/products/[id]/edit/patch-types-schema";

import { deleteProduct } from "@/services/products.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get product ID
    const { id } = await params;

    // Call service
    const productData = await getProductById(id);

    // Product not found
    if (productData === null) {
      return Response.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
          },
        },
        { status: 404 },
      );
    }

    // get all image Data
    const productImages = await getProductImageData(id);
    console.log("images", productImages);

    const product = { ...productData, images: productImages };

    // Product found
    return Response.json(
      {
        data: product,
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    // Unexpected error
    return Response.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await deleteProduct(id);
    if (result !== null) {
      return Response.json({ data: result, error: null }, { status: 200 });
    }
    return Response.json(
      {
        data: null,
        error: { code: "NOT_FOUND", message: "product does not exist" },
      },
      { status: 404 },
    );
  } catch (error) {
    return Response.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "something went wrong",
        },
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { validationError } from "@/lib/api/response";
import { validateImageFile } from "@/app/validation/product-image";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const formData = await request.formData();

    const dataRaw = formData.get("data");
    const existingImagesRaw = formData.get("existingImages");
    const newImagesRaw = formData.get("newImages");

    if (
      typeof dataRaw !== "string" ||
      typeof existingImagesRaw !== "string" ||
      typeof newImagesRaw !== "string"
    ) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Missing or invalid form data",
          },
        },
        { status: 400 },
      );
    }

    let data;
    let existingImages;
    let newImages;

    try {
      data = JSON.parse(dataRaw);
      existingImages = JSON.parse(existingImagesRaw);
      newImages = JSON.parse(newImagesRaw);
    } catch {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid JSON in form data",
          },
        },
        { status: 400 },
      );
    }

    // Basic receiver only: validate the data with Zod next.
    // BASIC VALIDATION :
    const validatedData = patchProductDataApiSchema.parse(data);
    const validatedExistingImages = existingImagesSchema.parse(existingImages);
    const validatedNewImages = newImagesSchema.parse(newImages);

    // VAlidation Key->image corresponding. + File Format
    for (const image of validatedNewImages) {
      const file = formData.get(image.key);

      if (!(file instanceof File)) {
        return validationError(`Missing image file for key: ${image.key}`);
      }

      validateImageFile(file);
    }

    /// FINAL VALIDATION :

    //     Unexpected files: reject uploaded file parts that aren't referenced by validatedNewImages.

    // Image business rules: enforce your maximum image count and primary-image rules.

    // Existing image ownership: verify that each publicId really belongs to this product before changing or

    //Validation File

    // Then authorize the user, validate image files,

    // and call your product update service.

    return NextResponse.json({
      data: {
        id,
        received: true,
        product: data,
        existingImages,
        newImages,
      },
      error: null,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return validationError(error.message);
    }
    if (error instanceof z.ZodError) {
      return validationError("Invalid existing image data");
    }

    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process request",
        },
      },
      { status: 500 },
    );
  }
}

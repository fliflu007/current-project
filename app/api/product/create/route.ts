import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { createProduct, getCompanyId } from "@/services/products.service";
import { ValidationError, ConflictError } from "@/lib/errors/errors";
import { createProductDataSchema } from "@/schemas/product";
import z from "zod";
import { validateProductImages } from "./validation";
import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";

import { insertProductDb } from "@/services/products.service";
import { db } from "@/db";
import { productImages } from "@/db/schema";

type NormalizedImage = {
  file: File;
  isMain: boolean;
  url?: string;
  publicId?: string;
};

export async function POST(request: Request) {
  try {
    const userId = process.env.TEST_USER_ID;
    if (!userId) {
      throw new Error("TEST_USER_ID is not configured");
    }

    const formData = await request.formData();

    // Validate product data
    const rawProductData = formData.get("data");

    //********* DATA validation
    //string | File | null
    if (typeof rawProductData !== "string") {
      throw new ValidationError("Invalid product data");
    }
    const productData = JSON.parse(rawProductData);
    const productDataValidated = createProductDataSchema.parse(productData);

    // ****** VALIDATE IMAGE METADATA + FILE INTEGRITY
    const validatedImageData = validateProductImages(formData);

    const companyId = await getCompanyId(userId);

    // *******  UPLOAD IMAGE TO CLOUDINARY
    const uploadedImages: {
      isMain: boolean;
      url: string;
      publicId: string;
    }[] = [];

    for (const image of validatedImageData) {
      const res = await uploadImageToCloudinary(image.file);

      uploadedImages.push({
        isMain: image.isMain,
        url: res.url,
        publicId: res.publicId,
      });
    }

    const productDataDB = await insertProductDb(
      productDataValidated,
      companyId,
    );

    // INSERT IMAGES IN DB
    const result = await db.transaction(async (tx) => {
      const insertedImages = [];

      for (const image of uploadedImages) {
        const [insertedImage] = await tx
          .insert(productImages)
          .values({
            productId: productDataDB.id,
            url: image.url,
            publicId: image.publicId,
            isPrimary: image.isMain,
          })
          .returning();

        insertedImages.push(insertedImage);
      }

      return insertedImages;
    });
    return NextResponse.json(
      {
        data: {
          product: productDataDB,
        },
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message,
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof ConflictError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "CONFLICT",
            message: error.message,
          },
        },
        { status: 409 },
      );
    }

    console.error("CREATE PRODUCT ERROR:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server error",
        },
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { products } from "@/db/schema";
import { ValidationError, ConflictError } from "@/lib/api/errors";
import { createProductDataSchema } from "@/schemas/product";
import z from "zod";
import { validateProductImages } from "./validation";
import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";
import { insertProductDb } from "@/services/products.service";
import { db } from "@/db";
import { productImages } from "@/db/schema";
import {
  conflictResponse,
  forbiddenResponse,
  profileNotFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api/response";
import { and, eq } from "drizzle-orm";
import { requireUserContext } from "@/lib/auth/require-user-context";

export async function POST(request: Request) {
  let companyId: string;

  try {
    // AUTHENTICATION
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    // AUTHORIZATION
    const userContext = await requireUserContext(userId);

    if (!userContext) {
      return profileNotFoundResponse();
    }
    if (userContext.role !== "admin") {
      return forbiddenResponse();
    }

    companyId = userContext.companyId;

    const formData = await request.formData();

    // Validate product data
    const rawProductData = formData.get("data");

    //********* DATA validation
    //string | File | null
    if (typeof rawProductData !== "string") {
      return validationErrorResponse("Invalid product data");
    }

    const productData = JSON.parse(rawProductData);

    const resultData = createProductDataSchema.safeParse(productData);

    if (!resultData.success) {
      return validationErrorResponse(
        resultData.error.issues.map((issue) => issue.message).join(", "),
      );
    }
    const productDataValidated = resultData.data;

    /// Check if Duplicated Product Name

    const existingProduct = await db
      .select({ id: products.id })
      .from(products)
      .where(
        and(
          eq(products.companyId, companyId),
          eq(products.name, productDataValidated.name),
        ),
      )
      .limit(1);

    if (existingProduct.length > 0) {
      throw new ConflictError("Product name already exists");
    }

    // ****** VALIDATE IMAGE METADATA + FILE INTEGRITY
    const validatedImageData = validateProductImages(formData);

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

    // CREATE IMAGES IN DB
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
      return conflictResponse(error.message);
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

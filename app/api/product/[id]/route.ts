import z from "zod";
import { NextRequest, NextResponse } from "next/server";
import { NotFoundError, ValidationError } from "@/lib/api/errors";
import { validatePatchRequest } from "./patch-validation";
import {
  deleteImageDB,
  getProductById,
  getProductForCompany,
  getProductImageData,
  setPrimaryImageByPublicID,
} from "@/services/products.service";
import { addImagesToDB } from "@/services/products.service";

import { deleteProduct } from "@/services/products.service";
import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";
import { deleteImage } from "@/lib/cloudinary/operations";
import { updateProductDetails } from "@/services/products.service";
import { getImagesToRemove } from "./helper";
import {
  forbiddenResponse,
  internalServerErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
} from "@/lib/api/response";
import { requireUserId } from "@/lib/auth/require-user";
import { requireUserContext } from "@/lib/auth/require-user-context";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // ADD authentification here
  const user = await requireUserId();

  if (!user) {
    return unauthorizedResponse();
  }

  const { companyId } = await requireUserContext(user);

  try {
    // Get product ID
    const { id } = await params;

    // Call service
    const productData = await getProductById(id, companyId);

    // Product not found
    if (productData === null) {
      return notFoundResponse("product not found ");
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

// Authentication — requireUserId()
// Authorization — admin-only check
// Tenant isolation — getProductForCompany()
// Validation — validatePatchRequest()
// Resource access — retrieve existing images
// Business rules — determine which images to add, keep and remove
// Cloudinary — upload new images
// Database — update product and image records
// Cloudinary — delete removed images
// Error handling — 400, 403, 404, 500, etc.

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const userId = await requireUserId();

    if (!userId) {
      return unauthorizedResponse();
    }

    const { companyId, role } = await requireUserContext(userId);

    if (role != "admin") {
      return forbiddenResponse();
    }

    // TENANT CHECK this throw an error if fail we do not need return
    await getProductForCompany(id, companyId);

    const formdata = await request.formData();
    const cleanRequest = await validatePatchRequest(formdata, id);

    const imagesInDB = await getProductImageData(id);

    // Undefined here is not filed AT first So no Operation on them
    let imagesToRemove: {
      id: string;
      productId: string;
      url: string;
      publicId: string;
      isPrimary: boolean;
      createdAt: Date;
    }[] = [];

    const existingImages = cleanRequest.existingImages;
    if (existingImages) {
      imagesToRemove = getImagesToRemove(imagesInDB, existingImages);
    }

    const imagesToAdd = cleanRequest.newImagesWFiles;

    // 2. Upload new images to Cloudinary
    const newImageCloudData: {
      url: string;
      publicId: string;
      isPrimary: boolean;
    }[] = [];

    for (const image of imagesToAdd) {
      const result = await uploadImageToCloudinary(image.file);
      newImageCloudData.push({ ...result, isPrimary: image.isPrimary });
    }
    /////////////////////////////////////
    /////// 3. DATABASE TRANSACTION /////
    /////////////////////////////////////

    /////  A → UPDATE DATA
    if (cleanRequest.data && Object.keys(cleanRequest.data).length > 0) {
      await updateProductDetails(id, cleanRequest.data);
    }
    // ADD NEW IMAGE TO DB
    await addImagesToDB(
      newImageCloudData.map((image) => ({
        ...image,
        isPrimary: false,
      })),
      id,
    );

    // SET PRIMARY ////////
    // find it:
    const existingPrimary = cleanRequest.existingImages?.find(
      (image) => image.isPrimary,
    );
    // Find the selected primary image among newly uploaded images
    const newPrimary = newImageCloudData.find((image) => image.isPrimary);
    // Set it
    if (existingPrimary) {
      await setPrimaryImageByPublicID(existingPrimary.publicId, id);
    } else if (newPrimary) {
      await setPrimaryImageByPublicID(newPrimary?.publicId, id);
    }

    // remove unwanted existing image records DB
    if (imagesToRemove.length > 0) {
      for (const currentImage of imagesToRemove) {
        await deleteImageDB(currentImage.publicId);
      }
    }

    ///////////////////////////////////////
    ///////////////////////////////////////
    ///////////////////////////////////////

    // 4. Remove old images from Cloudinary
    for (const images of imagesToRemove) {
      await deleteImage(images.publicId);
    }

    // Temporary response: validation passed, no update performed.
    return NextResponse.json("OK");
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: error.message ?? "Validation Error",
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof NotFoundError) {
      return notFoundResponse("Product not found");
    }
    if (error instanceof z.ZodError) {
      const message = error.issues[0]?.message;

      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: message ?? "Invalid input",
          },
        },
        { status: 400 },
      );
    }
    // Unexpected errors: database, Cloudinary, etc.
    console.error("PATCH product error:", error);

    return internalServerErrorResponse();
  }
}

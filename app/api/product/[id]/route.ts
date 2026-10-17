import z from "zod";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@/lib/errors/errors";
import { validatePatchRequest } from "./patch-validation";

import {
  deleteImageDB,
  getProductById,
  getProductImageData,
  setPrimaryImageByPublicID,
} from "@/services/products.service";
import { addImagesToDB } from "@/services/products.service";

import { deleteProduct } from "@/services/products.service";
import { uploadImageToCloudinary } from "@/lib/cloudinary/operations";
import { deleteImage } from "@/lib/cloudinary/operations";

import { updateProductDetails } from "@/services/products.service";

import { getImagesToRemove } from "./helper";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // auth
  try {
    const { id } = await params;

    const formdata = await request.formData();

    const cleanRequest = await validatePatchRequest(formdata, id);

    /// OPERATION //
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

    // C remove unwanted existing image records DB
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
    throw error;
  }
}

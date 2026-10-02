import { patchProductSchema } from "@/schemas/product";
import {
  getProductById,
  updateExistingImages,
  updateNewImages,
  updateProductDetails,
} from "@/services/products.service";

import { deleteProduct } from "@/services/products.service";

import { PatchProductinfos } from "@/types/product";

import { validateProductImages } from "@/app/validation/product-image";
import { validationError } from "@/lib/api/response";
import { ValidationError } from "@/lib/errors/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get product ID
    const { id } = await params;

    // Call service
    const data = await getProductById(id);

    // Product not found
    if (data === null) {
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

    // Product found
    return Response.json(
      {
        data,
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

///// PATCH function

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    let productInfos: PatchProductinfos | null = null;

    // 1 ---- get productID from Param
    const { id } = await params;

    // ============================================================
    // 3. READ FORMDATA
    // ============================================================

    const formData = await request.formData();

    const productRaw = formData.get("product");

    // ============================================================
    // 4. VALIDATE PRODUCT DATA
    // ============================================================

    if (productRaw !== null) {
      let productRawParsed = JSON.parse(productRaw as string);

      const ProductRawZodded = patchProductSchema.safeParse(productRawParsed);

      if (!ProductRawZodded.success) {
        return Response.json(
          {
            data: null,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid product data",
              details: ProductRawZodded.error.flatten(),
            },
          },
          { status: 400 },
        );
      }

      productInfos = ProductRawZodded.data;
    }

    // MOVE VALIDAITON
    const normalisedImages = validateProductImages(formData);

    // Error return from Validation
    if (normalisedImages instanceof Response) {
      return normalisedImages;
    }

    // 3 Type : UPDATE DATAdetail only / PROCESS Image Exist  / PORCESS IMAGE ARE NEW / FINAL UPDATE isMain

    // A UPDATE PRODUCT DETAIL
    if (productInfos) {
      await updateProductDetails(id, productInfos);
    }

    /// B PROCESS ExISTING IMAGES
    if (normalisedImages) {
      // return erased List[]
      await updateExistingImages(id, normalisedImages);
    }
    /// C -Process NEw Images
    if (normalisedImages) {
      await updateNewImages(id, normalisedImages);
    }
    return Response.json({
      data: { success: true },
      error: null,
    });
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
    } else {
      return Response.json(
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

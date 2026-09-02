import { patchProductSchema } from "@/schemas/product";
import { getProductById } from "@/services/products.service";
import { patchProduct } from "@/services/products.service";
import { ZodError } from "zod";
import { deleteProduct } from "@/services/products.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authentication
    // TODO

    // Authorization
    // TODO

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
  // 1. TODO :Check authentication

  // 2. TODO : Check authorization

  // 3. Get product ID from URL
  const { id } = await params;

  // 4. Get JSON body
  try {
    const body = await request.json();

    const cleanData = patchProductSchema.parse(body);
    // 6. Call service
    //    → updateProduct(id, cleanData)
    const serviceResult = await patchProduct(id, cleanData);

    if (serviceResult === null) {
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
    return Response.json(
      {
        data: serviceResult,
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    // if error type then 400
    if (error instanceof ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid product data",
            detail: error.flatten(),
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
            message: "Something went wrong",
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

  // authentification
  // authorisation

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

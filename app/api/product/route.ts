import { CreateProductSchema } from "@/schemas/product";

import z from "zod";

import { getProducts } from "@/services/products.service";
import { requireUserId } from "@/lib/auth/require-user";
import { createProduct } from "@/services/products.service";
import { forbiddenResponse, unauthorizedResponse } from "@/lib/api/response";
import { requireUserContext } from "@/lib/auth/require-user-context";

export async function POST(request: Request) {
  // Get UserID
  try {
    const userId = await requireUserId();
    if (!userId) {
      return unauthorizedResponse();
    }

    const { role, companyId } = await requireUserContext(userId);

    if (role != "admin") {
      return forbiddenResponse();
    }

    const body = await request.json();

    const data = CreateProductSchema.parse(body);

    const product = await createProduct(companyId, data);

    //success
    return Response.json({ data: product, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "invalide request data",
          },
        },
        { status: 400 },
      );
    }
    // All other errors
    console.error(error);

    return Response.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "internal server error",
        },
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // TODO: authenticate user
    // TODO: get profile
    // TODO: authorize user
    // TODO: filter products by user's company
    //
    const userId = await requireUserId();
    if (!userId) {
      return Response.json(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be logged in to view products",
          },
        },
        { status: 401 },
      );
    }

    const data = await getProducts(userId);

    return Response.json(
      {
        data,
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
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
//

import { CreateProductSchema } from "@/schemas/product";

import { ZodError } from "zod";
import z from "zod";

import { getProducts } from "@/services/products.service";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { getCompanyId } from "@/services/products.service";
import { createProduct } from "@/services/products.service";

export async function POST(request: Request) {
  // Get UserID
  try {
    const user = await requireUser();
    if (user instanceof Response) {
      return user;
    }

    const body = await request.json();

    const data = CreateProductSchema.parse(body);

    const companyId = await getCompanyId(user.id);

    const product = await createProduct(companyId, data);

    //success
    return Response.json({ data: product, error: null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "invalide request data" },
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

    const data = await getProducts();

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

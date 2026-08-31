import { CreateProductSchema } from "@/schemas/product";
import { createProduct } from "@/services/products.service";
import { ZodError } from "zod";

// TEMPORARY PLAYGROUND ONLY
const profile = {
  id: "test-user-id",
  companyId: "test-company-id",
  role: "admin",
};

// provided from a existing ID company in DB
const companyID = "7c02bbc9-8053-459e-9d09-90cb9927c78d";

export async function POST(request: Request) {
  try {
    // authenticate
    /// if fail reject id 401 UNAUTHORIZED

    // get profil if issue likely 404/500 depending
    const profil = profile;
    // (check role)
    if (profil.role === "view") {
      return Response.json(
        {
          data: null,
          error: {
            code: "FORBIDDEN",
            message: "Viewer users cannot create products",
          },
        },
        { status: 403 },
      );
    }
    // Parse body
    const body = await request.json();

    const data = CreateProductSchema.parse(body);

    // call service
    console.log("about to trigger services");
    const newProduct = await createProduct(companyID, data);

    return Response.json(
      {
        data: newProduct,
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "invalid product data",
            detail: error.flatten().fieldErrors,
          },
        },
        { status: 400 },
      );
    }
    console.error(error);
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

import { getProductById } from "@/services/products.service";

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

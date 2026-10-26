import { requireUserId } from "@/lib/auth/require-user";
import {
  getCompanyId,
  getProductForCompany,
} from "@/services/products.service";
import { NextResponse } from "next/server";
import z, { ZodError } from "zod";
import { NotFoundError } from "@/lib/errors/errors";
import { addToInventory } from "@/services/inventory.service";
import { updateProductQuantity } from "@/services/inventory.service";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // AUTHENTIFICATION
    const userId = await requireUserId();
    if (!userId) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "authentification error",
            message: "user not authentified",
          },
        },
        { status: 401 },
      );
    }

    // Validation ID
    const validedId = z.string().uuid().parse(data.id);

    // VALIDATION QUANTITY
    let validatedQuantity = z.coerce.number().positive().parse(data.quantity);

    // VALIDATION REASON
    const validatedReason = z.string().nullable().optional().parse(data.reason);

    const validatedType = z.enum(["IN", "OUT"]).parse(data.type);

    /// user i get id
    const companyId = await getCompanyId(userId);

    // Verife is product -> CompanyID .. throw error
    const productDB = await getProductForCompany(validedId, companyId);

    // separate by type:
    const quantityTotal =
      validatedType === "IN"
        ? Number(productDB.quantity) + validatedQuantity
        : Number(productDB.quantity) - validatedQuantity;

    //add inventory row
    const newTransactionData = await addToInventory({
      quantity: validatedQuantity,
      comment: validatedReason,
      type: validatedType,
      productId: validedId,
    });

    /// UPDATE PRODUCT
    const newproductdata = await updateProductQuantity(
      newTransactionData.productId,
      quantityTotal,
    );

    //final success
    return NextResponse.json(
      {
        data: { transaction: newTransactionData, product: newproductdata },
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid JSON body",
          },
        },
        { status: 400 },
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          data: null,
          error: { code: "VALIDATION_ERROR", message: "wrong data format" },
        },
        { status: 400 },
      );
    }
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: error.message,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        data: null,
        error: { code: "Internal_ERROR", message: "Internal server error" },
      },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/auth/require-user";
import { requireUserContext } from "@/lib/auth/require-user-context";
import { getProductByBarcode } from "@/services/products.service";
import {
  unauthorizedResponse,
  forbiddenResponse,
  profileNotFoundResponse,
} from "@/lib/api/response";

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (!userId) return unauthorizedResponse();

  const userContext = await requireUserContext(userId);
  if (!userContext) return profileNotFoundResponse();
  if (userContext.role === "viewer") {
    // viewers can read; allow. Keep as is.
  }

  const { searchParams } = new URL(request.url);
  const barcode = (searchParams.get("barcode") ?? "").trim();
  if (!barcode) {
    return NextResponse.json(
      { data: null, error: { code: "VALIDATION_ERROR", message: "Barcode required" } },
      { status: 400 },
    );
  }

  const product = await getProductByBarcode(barcode, userContext.companyId);
  if (!product) {
    return NextResponse.json(
      { data: null, error: { code: "NOT_FOUND", message: "Product not found" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: { product }, error: null }, { status: 200 });
}

"use server";

import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/db";
import { inventoryMovements, productImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { products } from "@/db/schema";
import { deleteImage } from "@/lib/cloudinary/operations";
import { requireUserContext } from "@/lib/auth/require-user-context";
import z from "zod";

export type DeleteActionResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteByIdAction(
  id: string,
): Promise<DeleteActionResult> {
  try {
    const idSchema = z.string().uuid();

    if (!idSchema.safeParse(id).success) {
      return {
        success: false,
        error: "Invalid product ID",
      };
    }
    const userid = await requireUserId();

    if (!userid) {
      return { success: false, error: "authentification error" };
    }
    const { role, companyId } = await requireUserContext(userid);

    if (role !== "admin") {
      return { success: false, error: "not admin, can not delete product" };
    }

    // transation Tx :

    const publicIds = await db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, id), eq(products.companyId, companyId)));

      if (!product) {
        throw new Error("Product not found or unauthorized");
      }

      const images = await tx
        .delete(productImages)
        .where(eq(productImages.productId, id))
        .returning();

      await tx
        .delete(inventoryMovements)
        .where(eq(inventoryMovements.productId, id));
      const deleted = await tx
        .delete(products)
        .where(and(eq(products.companyId, companyId), eq(products.id, id)))
        .returning();

      if (deleted.length === 0) {
        throw new Error("Product not found or unauthorized");
      }
      return images.map((image) => image.publicId);
    }); // closes transaction

    // cloudiniary
    for (const image of publicIds) {
      const result = await deleteImage(image);
    }

    // Transaction succeeded
    return { success: true };
  } catch (e) {
    console.error("Error occurred:", e);
    return { success: false, error: "Error deleting product" };
  }
}

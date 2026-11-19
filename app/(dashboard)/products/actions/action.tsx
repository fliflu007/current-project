"use server";

import { requireUserId } from "@/lib/auth/require-user";

import { db } from "@/db";
import { inventoryMovements, productImages, profiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { products } from "@/db/schema";
import { deleteImage } from "@/lib/cloudinary/operations";

export async function deleteByIdAction(
  id: string,
): Promise<{ error?: string }> {
  let userid = await requireUserId();

  if (!userid) {
    return { error: "authentification error" };
  }

  // get the company ID
  const result = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userid));
  if (result.length === 0) {
    return { error: "not company assigned to user" };
  }
  // would be for role later
  const role = result[0].role;
  if (role != "admin") {
    return { error: "not allowded" };
  }
  const companyId = result[0].companyId;

  // transation Tx :
  try {
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
    return {};
  } catch (e) {
    console.error("Error occurred:", e);
    return { error: "Error deleting product" };
  }
}

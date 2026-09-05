import { productImages } from "@/db/schema";
import cloudinary from "@/lib/cloudinary/cloudinary";
import { eq } from "drizzle-orm";
import { db } from "@/db";

/**
 * Deletes an image from Cloudinary.
 */
export async function deleteImage(
  publicId: string,
): Promise<DeleteImageResult> {
  const result = await cloudinary.uploader.destroy(publicId);

  return { deleted: result.result === "ok" };
}

export async function addImage(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await new Promise<CloudinaryUploadResult>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) {
            console.log("CLOUDINARY ERROR:", error);
            reject(error);
          } else if (!result) {
            reject(new Error("Cloudinary returned no result"));
          } else {
            resolve(result);
          }
        },
      );

      uploadStream.end(buffer);
    },
  );
  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

export async function setPrimaryImage(imageId: string) {
  const result = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));
  if (!result.length) {
    return null;
  }
  const imageraw = result[0];
  const productId = imageraw.productId;

  await db.transaction(async (tx) => {
    await tx
      .update(productImages)
      .set({ isPrimary: false })
      .where(eq(productImages.productId, productId));

    await tx
      .update(productImages)
      .set({ isPrimary: true })
      .where(eq(productImages.id, imageId));
  });
  return { success: true };
}

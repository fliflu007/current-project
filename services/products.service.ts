import { products } from "@/db/schema";
import { CreateProductInput, NormalizedImages } from "@/schemas/product";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { profiles } from "@/db/schema";
import { productImages, inventoryMovements } from "@/db/schema";
import { PatchProductinfos } from "@/schemas/product";
import { ValidationError } from "@/lib/errors/errors";
import { addImage, deleteImage } from "@/lib/cloudinary/operations";

export async function getCompanyId(userId: string) {
  const result = await db
    .select({ companyId: profiles.companyId })
    .from(profiles)
    .where(eq(profiles.id, userId));

  if (!result[0]) {
    throw new Error("Profile not found");
  }

  return result[0].companyId;
}

export async function createProduct(
  companyId: string,
  data: CreateProductInput,
) {
  // products
  const result = await db
    .insert(products)
    .values({
      ...data,
      companyId,
      quantity: String(data.quantity),
    })
    .returning();
  const productId = result[0].id;

  const test = data.images.map(async (image) => {
    const res2 = await db.insert(productImages).values({
      productId,
      url: image.url,
      publicId: image.publicId,
      isPrimary: image.isMain,
    });
  });

  await Promise.all(test);
  // create inventory line
  await db.insert(inventoryMovements).values({
    productId,
    type: "IN",
    quantity: String(data.quantity),
    comment: "Initial stock",
  });

  return {
    ...result[0],
    quantity: Number(result[0].quantity),
  };
}

export async function getProducts() {
  const data = await db.select().from(products);

  return data.map((product) => ({
    ...product,
    quantity: Number(product.quantity),
  }));
}

export async function getProductById(id: string) {
  const data = await db.select().from(products).where(eq(products.id, id));

  if (!data[0]) {
    return null;
  }

  return {
    ...data[0],
    quantity: Number(data[0].quantity),
  };
}

export async function deleteProduct(id: string) {
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();

  const product = result[0];

  if (!product) return null;

  return {
    ...product,
    quantity: Number(product.quantity),
  };
}

export async function getProductImageData(productId: string) {
  const data = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));

  return data;
}

export async function updateProductDetails(
  productId: string,
  data: PatchProductinfos,
) {
  const [updatedProducts] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, productId))
    .returning();

  if (!updatedProducts) {
    throw new Error("not able to patch product details");
  }

  return updatedProducts;
}

/**
 * Returns a list of existing images that were erased.
 * Returns [] when no existing images were erased.
 */
export async function updateExistingImages(
  productId: string,
  normalisedImages: NormalizedImages,
) {
  // 1. Get all current image records from DB
  const dbImageList = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));
  // OK RETURN WELL

  // check if all existing images inside the normalized image do exist in DB
  for (const item of normalisedImages) {
    if (item.status === "existing") {
      const found = dbImageList.some(
        (dbimage) => dbimage.publicId === item.publicId,
      );
      if (!found) {
        throw new ValidationError(
          "The existing image provided was not found in the database",
        );
      }
    }
  }
  // check every extraline DB out of my list and make a LIST ready for erase
  const toEraseList = dbImageList.filter((dbimage) => {
    return !normalisedImages.some((item) => item.publicId === dbimage.publicId);
  });

  /////// ERASE LIST READY

  // 7. Delete those images from Cloudinary
  for (const imagetoerase of toEraseList) {
    const result = await deleteImage(imagetoerase.publicId);
    if (result.deleted === false) {
      throw new Error("Failed to delete image from Cloudinary");
    }
  }

  // 8. Delete those image records from DB
  if (toEraseList.length > 0) {
    const publicIdsToDelete = toEraseList.map((image) => image.publicId);

    await db
      .delete(productImages)
      .where(inArray(productImages.publicId, publicIdsToDelete));
  }
  return toEraseList;
}

export async function updateNewImages(
  productId: string,
  normalisedImages: NormalizedImages,
) {
  // ADDING CLOUDINARY
  const addedImages: {
    url: string;
    publicId: string;
  }[] = [];

  for (const newimage of normalisedImages) {
    if (newimage.status === "new") {
      const addedImage = await addImage(newimage.file);
      addedImages.push(addedImage);
    }
  }
  if (addedImages.length > 0) {
    const result = await db.transaction(async (tx) => {
      for (const image of addedImages) {
        await tx.insert(productImages).values({
          ...image,
          productId,
        });
      }
    });
  }
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

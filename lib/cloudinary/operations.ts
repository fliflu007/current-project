import cloudinary from "@/lib/cloudinary/cloudinary";

type DeleteImageResult = {
  deleted: boolean;
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

/**
 * Deletes an image from Cloudinary.
 */
export async function deleteImage(
  publicId: string,
): Promise<DeleteImageResult> {
  const result = await cloudinary.uploader.destroy(publicId);

  return { deleted: result.result === "ok" };
}

export async function uploadImageToCloudinary(file: File) {
  // Convert File → ArrayBuffer to access the file's raw bytes
  const arrayBuffer = await file.arrayBuffer();
  // Convert ArrayBuffer → Node.js Buffer for Cloudinary upload
  const buffer = Buffer.from(arrayBuffer);

  // Wrap Cloudinary's callback-based upload in a Promise
  // so we can await the upload result.
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

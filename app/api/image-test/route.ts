import cloudinary from "@/lib/cloudinary/cloudinary";
import z from "zod";

// Cloudinary upload result:
// secure_url → URL used to display/access the image
// public_id  → Cloudinary identifier used to manage/delete the image
// width      → uploaded image width
// height     → uploaded image height
// format     → image format (jpg, png, webp, etc.)

export async function POST(request: Request) {
  console.log("PostImage endpoint hit");
  const formData = await request.formData();

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Cloudinary call
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          console.log("CLOUDINARY ERROR:", error);
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });

  return Response.json({
    result,
  });
}

const DeleteInputSchema = z.object({
  publicId: z.string().min(2),
});

// for test one : kvqm07rfo6hlbz8jwebr
export async function DELETE(request: any) {
  const body = await request.json();

  const { publicId } = DeleteInputSchema.parse(body);

  console.log(publicId);

  // Cloudinary destroy result:
  // "ok" → asset was deleted
  // "not found" → no asset exists with this publicId
  const result = await cloudinary.uploader.destroy(publicId);

  console.log(result);

  return Response.json({
    data: body,
    error: null,
  });
  // normal DB make sure exist

  // code for deletion ?

  /// return error or not according to result ?
}

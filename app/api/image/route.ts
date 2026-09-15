import cloudinary from "@/lib/cloudinary/cloudinary";
import { addImage, deleteImage } from "@/services/images";
import z from "zod";

// Cloudinary upload result:
// secure_url → URL used to display/access the image
// public_id  → Cloudinary identifier used to manage/delete the image
// width      → uploaded image width
// height     → uploaded image height
// format     → image format (jpg, png, webp, etc.)

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          data: null,
          error: {
            code: "FILE_REQUIRED",
            message: "No file provided",
          },
        },
        { status: 400 },
      );
    }

    const result = await addImage(file);

    return Response.json(
      {
        data: result,
        error: null,
      },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      {
        data: null,
        error: {
          code: "IMAGE_UPLOAD_ERROR",
          message: "Could not upload image",
        },
      },
      { status: 500 },
    );
  }
}

const DeleteInputSchema = z.object({
  publicId: z.string().min(2),
});

// for test one : kvqm07rfo6hlbz8jwebr
export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const { publicId } = DeleteInputSchema.parse(body);

    const result = await deleteImage(publicId);

    if (result.deleted) {
      return Response.json({
        data: result,
        error: null,
      });
    }

    return Response.json(
      {
        data: null,
        error: {
          code: "IMAGE_NOT_FOUND",
          message: "Image was not found",
        },
      },
      { status: 404 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid image data",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        data: null,
        error: {
          code: "IMAGE_DELETE_ERROR",
          message: "Could not delete image",
        },
      },
      { status: 500 },
    );
  }
}

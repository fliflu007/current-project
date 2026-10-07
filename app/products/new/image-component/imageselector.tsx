import React from "react";
import { validateImageInput } from "@/app/products/new/image-component/image-utils";
import { normalizeImageInput } from "@/app/products/new/image-component/image-utils";
import { ImageItemType } from "../page";
import { addImagesWithLimit } from "@/app/products/new/image-component/image-utils";
import { Input } from "@/components/ui/input";

export default function ImageSelector({
  images,
  setImages,
  setImageError,
}: {
  images: ImageItemType[];
  setImages: React.Dispatch<React.SetStateAction<ImageItemType[]>>;
  setImageError: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = event.target.files;
    if (!rawFiles) {
      return;
    }
    // ACTION on FILE IN SELECTOR
    // SELECTOR CAN be NULL IF so []
    const files = Array.from(rawFiles);
    const validatedFiles = validateImageInput(files);

    // VALIDATION ERROR

    if (validatedFiles.error || validatedFiles.files === null) {
      setImageError(
        "One of th image you tried to add has a size or format issue !!",
      );
      return;
    }
    setImageError(null);

    const hasExistingImage = Boolean(images && images.length > 0);

    // Normalize files into image state format
    // Create previewUrl and set isMain
    const normalizedImages = normalizeImageInput(
      validatedFiles.files,
      hasExistingImage,
    );

    setImages((prev) => addImagesWithLimit(prev, normalizedImages));
  };

  return (
    <div>
      <Input
        id="image"
        name="image"
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
      />
    </div>
  );
}

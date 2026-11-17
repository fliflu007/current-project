import React from "react";
import { validateImageInput } from "@/app/products/new/utils/image-utils";
import { normalizeImageInput } from "@/app/products/new/utils/image-utils";
import { Input } from "@/components/ui/input";
import { ImageItemType } from "./create-product-form";

export default function ImageSelector({
  images,
  setImages,
  setImageInputErrors,
}: {
  images: ImageItemType[];
  setImages: React.Dispatch<React.SetStateAction<ImageItemType[]>>;
  setImageInputErrors: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFiles = event.target.files;
    if (!rawFiles) {
      return;
    }
    setImageInputErrors([]);
    // ACTION on FILE IN SELECTOR
    // SELECTOR CAN be NULL IF so []
    const files = Array.from(rawFiles);
    if (files.length === 0) return;

    const validatedFiles = validateImageInput(files, images.length);

    // VALIDATION ERROR

    if (!validatedFiles.files) {
      setImageInputErrors([validatedFiles.error]);
      return;
    }

    const hasExistingImage = images.length > 0;

    // Normalize new files into image state format
    // Create previewUrl and set isMain
    const normalizedImages = normalizeImageInput(
      validatedFiles.files,
      hasExistingImage,
    );
    setImages((prev) => [...prev, ...normalizedImages]);
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

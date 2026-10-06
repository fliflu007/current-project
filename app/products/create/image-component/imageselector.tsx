import React from "react";
import { validateImageInput } from "@/app/products/create/image-component/image-utils";
import { normalizeImageInput } from "@/app/products/create/image-component/image-utils";
import { ImageItemType } from "../page";
import { addImages } from "@/app/products/create/image-component/image-utils";

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
    console.log(event.target.files);

    // ACTION on FILE IN SELECTOR
    // SELECTOR CAN be NULL IF so []
    const files = Array.from(event.target.files ?? []);
    const validatedFiles = validateImageInput(files);

    // VALIDATION ERROR

    if (validatedFiles.error || validatedFiles.files === null) {
      setImageError(
        "one of the image you tried to add, has an issue with size or format!!",
      );
      return;
    }
    setImageError(null);

    const hasExistingImage = Boolean(images && images.length > 0);

    const normalizedImages = normalizeImageInput(
      validatedFiles.files,
      hasExistingImage,
    );
    // add imagenormaled to imageSelector
    setImages((prev) => addImages(prev, normalizedImages));
  };

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleChange} />
    </div>
  );
}

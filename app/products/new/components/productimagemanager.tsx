import ImageSelector from "./imageselector";
import { ImageItemType } from "./create-product-form";
import { useState } from "react";

import ImagePreview from "./image-preview";
export default function ProductImageManager({
  images,
  setImages,
}: {
  images: ImageItemType[];
  setImages: React.Dispatch<React.SetStateAction<ImageItemType[]>>;
}) {
  const [imageInputErrors, setImageInputErrors] = useState<string[]>([]);

  function removeImage(previewUrl: string) {
    const imageToRemove = images.find(
      (image) => image.previewUrl === previewUrl,
    );

    const remainingImages = images.filter(
      (image) => image.previewUrl !== previewUrl,
    );

    if (imageToRemove?.isMain && remainingImages.length > 0) {
      remainingImages[0] = {
        ...remainingImages[0],
        isMain: true,
      };
    }

    setImages(remainingImages);
  }
  function setMainImage(previewUrl: string) {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isMain: image.previewUrl === previewUrl,
      })),
    );
  }

  return (
    <div>
      <ImageSelector
        images={images}
        setImages={setImages}
        setImageInputErrors={setImageInputErrors}
      />
      <div>
        {imageInputErrors.map((error, index) => (
          <p key={index} className="text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {images.map((image) => (
          <ImagePreview
            key={image.previewUrl}
            image={image}
            removeImage={() => removeImage(image.previewUrl)}
            setMainImage={() => setMainImage(image.previewUrl)}
          />
        ))}
      </div>
    </div>
  );
}

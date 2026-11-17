import Image from "next/image";
import { X, Star } from "lucide-react";
import { cn } from "cn";
import { ProductImage } from "./patch-types-schema";

export default function ImageItem({
  image,
  removeImage,
  setPrimaryImage,
}: {
  image: ProductImage;
  removeImage: (image: ProductImage) => void;
  setPrimaryImage: (image: ProductImage) => void;
}) {
  return (
    <div>
      <div className="bg-secondary border rounded-md flex items-center justify-between gap-4">
        <div className="imageParent relative h-20 w-20">
          <Image
            src={image.type === "existing" ? image.url : image.previewUrl}
            className="object-cover"
            alt="image"
            fill
          />
        </div>

        <div className="flex flex-col gap-3 p-2">
          <div
            className="flex items-center gap-3"
            onClick={() => {
              removeImage(image);
            }}
          >
            <X className="shrink-0" />
            <p>Remove</p>
          </div>

          <div
            onClick={() => setPrimaryImage(image)}
            className={cn(
              "flex items-center gap-3",
              image.isPrimary && "bg-green-200",
            )}
          >
            <Star
              className={cn(
                "shrink-0",
                image.isPrimary ? "text-green-600" : "text-muted-foreground",
              )}
            />

            <p>{image.isPrimary ? "Main" : "Default"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

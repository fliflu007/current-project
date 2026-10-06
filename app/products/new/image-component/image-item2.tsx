import React from "react";
import { ImageItemType } from "../../create/page";
import Image from "next/image";
import { X, Star } from "lucide-react";
import { cn } from "cn";

export default function ImageItem2({
  image,
  removeImage,
  setMainImage,
}: {
  image: ImageItemType;
  removeImage: (previewUrl: string) => void;
  setMainImage: (previewUrl: string) => void;
}) {
  return (
    <div>
      <div className="bg-secondary border rounded-md flex items-center justify-between gap-4">
        <div className="imageParent relative h-20 w-20">
          <Image
            src={image.previewUrl}
            className="object-cover"
            alt="image"
            fill
          />
        </div>

        <div className="flex flex-col gap-3 p-2">
          <div
            className="flex items-center gap-3"
            onClick={() => {
              removeImage(image.previewUrl);
            }}
          >
            <X className="shrink-0" />
            <p>Remove</p>
          </div>

          <div
            onClick={() => setMainImage(image.previewUrl)}
            className={cn(
              "flex items-center gap-3",
              image.isMain && "bg-green-200",
            )}
          >
            <Star
              className={cn(
                "shrink-0",
                image.isMain ? "text-green-600" : "text-muted-foreground",
              )}
            />

            <p>{image.isMain ? "Main" : "Default"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

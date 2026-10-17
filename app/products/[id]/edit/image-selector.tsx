"use client";

import React, { useState } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateImageInput } from "../../new/image-component/image-utils";
import { validateProductImages } from "@/app/api/product/create/validation";
import { validateImageFile } from "@/app/validation/product-image";
import { ProductImage } from "./patch-types-schema";
import type { Dispatch, SetStateAction } from "react";

import { MAX_PRODUCT_IMAGES } from "@/constants/products";
import { toast } from "sonner";

export default function ImageSelector({
  setImages,
  images,
}: {
  setImages: Dispatch<SetStateAction<ProductImage[]>>;
  images: ProductImage[];
}) {
  const [imageError, setImageError] = useState<null | string>(null);

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);

    const selectedFiles = Array.from(event.target.files ?? []);

    const imageNumberToAdd = MAX_PRODUCT_IMAGES - images.length;

    if (imageNumberToAdd <= 0) {
      toast.error(`Maximum of ${MAX_PRODUCT_IMAGES} only. `);
    }

    if (imageNumberToAdd < 1) {
      return;
    }

    const filesValidated = [];

    // VALIDATION LOOP
    for (const imageFile of selectedFiles) {
      try {
        validateImageFile(imageFile);
        filesValidated.push(imageFile);
        if (filesValidated.length >= imageNumberToAdd) {
          break;
        }
      } catch (error) {
        // this validateImageFile is throwinv validation error..
        setImageError("one image was wrong size or format");
        continue;
      }
    }
    // FORMAT HERE AFTER VALIDATION
    const imageValidateFormated = filesValidated.map((file) => ({
      file: file,
      type: "new" as const,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
    }));
    // CREATE
    setImages((prev) => {
      return [...prev, ...imageValidateFormated]; // formated ];
    });

    validateImageInput;
  }

  return (
    <div>
      <FieldLabel htmlFor="image">Product images</FieldLabel>

      <Input
        onChange={onImageChange}
        id="image"
        name="image"
        type="file"
        accept="image/*"
        multiple
      />

      {imageError && (
        <p id="image-error" className="mt-1 text-sm text-destructive">
          {imageError}
        </p>
      )}
    </div>
  );
}

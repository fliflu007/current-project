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

export default function ImageSelector({
  setImages,
  images,
}: {
  setImages: Dispatch<SetStateAction<ProductImage[]>>;
  images: ProductImage[];
}) {
  const [imageError, setImageError] = useState<null | string>(null);

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    // implement UI input logic

    // implement the isPrimary logic

    // return undefined if files do not exist
    setImageError(null);
    const selectedFiles = Array.from(event.target.files ?? []);

    const imageNumberToAdd = MAX_PRODUCT_IMAGES - images.length;

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

    // converting the FileList from the input into a normal JavaScript array

    /// NEED TO CLEAN UP THIS FUNCTION RE ORGANISE
    validateImageInput;
    // validate image-> show error message if not ok
    // create preview
    // set the image inside the stat
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

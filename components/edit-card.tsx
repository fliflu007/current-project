"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

import { ProductByIdResponse } from "@/app/products/[id]/edit/patch-types-schema";
import {
  PatchProductData,
  patchProductDataSchema,
} from "@/app/products/[id]/edit/patch-types-schema";

import ImageSelector from "@/app/products/[id]/edit/image-selector";
import ImageItem from "@/app/products/[id]/edit/image-item";
import {
  normalizeProductImages,
  preparePatchFormData,
} from "@/app/products/[id]/edit/patch-form-utils";
import { ProductImage } from "@/app/products/[id]/edit/patch-types-schema";
import { useState } from "react";

// COMPONENT
export default function EditCard({
  product,
}: {
  product: ProductByIdResponse;
}) {
  const normalizedImages = normalizeProductImages(product.images);

  const [images, setImages] = useState<ProductImage[]>(normalizedImages);

  const form = useForm<PatchProductData>({
    resolver: zodResolver(patchProductDataSchema),
    mode: "onChange",
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
    },
  });
  async function onSubmit(data: PatchProductData) {
    const formData = preparePatchFormData(images);
    formData.append("data", JSON.stringify(data));

    //

    console.log("patching... ");
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          name: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }
    await fetch(`/api/product/${product.id}/edit`, {
      method: "PATCH",
      body: formData,
    });
  }

  function removeImage(imageToRemove: ProductImage) {
    setImages((prev) => {
      if (prev.length <= 1) return prev;

      const remaining = prev.filter((item) => {
        if (item.type === "existing" && imageToRemove.type === "existing") {
          return item.publicId !== imageToRemove.publicId;
        }

        if (item.type === "new" && imageToRemove.type === "new") {
          return item.previewUrl !== imageToRemove.previewUrl;
        }

        return true;
      });

      if (imageToRemove.isPrimary && remaining.length > 0) {
        return remaining.map((item, index) => ({
          ...item,
          isPrimary: index === 0,
        }));
      }

      return remaining;
    });
  }
  function setPrimaryImage(image: ProductImage) {
    setImages((prev) =>
      prev.map((item) => ({
        ...item,
        isPrimary:
          item.type === "new"
            ? image.type === "new" && item.previewUrl === image.previewUrl
            : image.type === "existing" && item.url === image.url,
      })),
    );
  }

  return (
    <div>
      <Card className="shadow-xl my-3">
        <CardHeader>
          <CardTitle className="text-lg font-bold">EDIT PRODUCT</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Product name</FieldLabel>
                <Input
                  id="name"
                  autoComplete="off"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Details</FieldLabel>
                <Textarea id="description" {...form.register("description")} />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </Field>

              <Field>
                <ImageSelector setImages={setImages} images={images} />
              </Field>
              <Field>
                {images.map((image) => (
                  <ImageItem
                    key={
                      image.type === "existing"
                        ? image.publicId
                        : image.previewUrl
                    }
                    image={image}
                    setPrimaryImage={setPrimaryImage}
                    removeImage={removeImage}
                  />
                ))}
              </Field>

              <Button className="py-5 font-bold" type="submit">
                Save Changes
              </Button>
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => {
                  console.log("button clicked");
                }}
              >
                Reset images
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

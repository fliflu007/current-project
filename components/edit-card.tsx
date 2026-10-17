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

import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import ImageItem from "@/app/products/[id]/edit/image-item";
import {
  normalizeProductImages,
  preparePatchFormData,
} from "@/app/products/[id]/edit/patch-form-utils";
import { ProductImage } from "@/app/products/[id]/edit/patch-types-schema";
import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import { MAX_PRODUCT_IMAGES } from "@/constants/products";

// COMPONENT
export default function EditCard({
  product,
}: {
  product: ProductByIdResponse;
}) {
  const normalizedImages = normalizeProductImages(product.images);

  const [images, setImages] = useState<ProductImage[]>(normalizedImages);
  const [errorApi, setErrorApi] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<PatchProductData>({
    resolver: zodResolver(patchProductDataSchema),
    mode: "onChange",
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
    },
  });

  async function onSubmit(data: PatchProductData) {
    setSubmitting(true);
    setErrorApi(null);

    try {
      const formData = preparePatchFormData(images);
      formData.append("data", JSON.stringify(data));

      console.log([...formData.entries()]);

      const response = await fetch(`/api/product/${product.id}`, {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorApi(result?.error?.message ?? "Failed to update product");
        return;
      }

      toast.success("Product successfully updated");
    } catch (error) {
      console.error("PATCH request failed:", error);
      setErrorApi("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function removeImage(imageToRemove: ProductImage) {
    setImages((prev) => {
      if (prev.length <= 1) {
        toast.error("Product should at least have 1 image");
        return prev;
      }

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
  function resetForm() {
    form.reset({
      name: product.name,
      description: product.description ?? "",
    });

    setImages(normalizeProductImages(product.images));
  }

  return (
    <div>
      <Card className="my-3 border-0 shadow-none ring-0 outline-none sm:border sm:shadow-xl">
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
              <p>{MAX_PRODUCT_IMAGES} images max..</p>
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
              {errorApi && (
                <Alert variant="destructive">
                  <AlertCircle />
                  <AlertTitle>Unable to update product</AlertTitle>
                  <AlertDescription>{errorApi}</AlertDescription>
                </Alert>
              )}
              {submitting && (
                <div className="flex space-x-2 items-center">
                  <LoaderCircle className="animate-spin " />
                  <span> Saving... </span>
                </div>
              )}
              <Button className="py-5 font-bold" type="submit">
                Save Changes
              </Button>
              <Button variant={"secondary"} type="button" onClick={resetForm}>
                Reset Form
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

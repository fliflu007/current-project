"use client";

import z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { MAX_PRODUCT_IMAGES } from "@/constants/products";

import ImageSelector from "./image-component/imageselector";
import ImageItem2 from "./image-component/image-item2";

import { prepareFormData } from "./prepare-form-data";

import { toast } from "sonner";

const createDataFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().max(50, "Maximum 50 characters").optional(),
  quantity: z.coerce.number().min(0),
});
export type CreateDataForm = z.infer<typeof createDataFormSchema>;

// IMAGE STATE FORMAT
// Compatible with ImageInput and ImageItem components
export type ImageItemType = {
  file: File;
  previewUrl: string;
  isMain: boolean;
};

export default function Page() {
  const form = useForm<CreateDataForm>({
    resolver: zodResolver(createDataFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
    },
  });

  const [images, setImages] = useState<ImageItemType[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);

  const removeImage = (previewUrl: string) => {
    if (images.length <= 1) {
      return;
    }

    const imageToRemove = images.find(
      (image) => image.previewUrl === previewUrl,
    );

    const remainingImages = images.filter(
      (image) => image.previewUrl !== previewUrl,
    );

    if (imageToRemove?.isMain) {
      remainingImages[0] = {
        ...remainingImages[0],
        isMain: true,
      };
    }

    setImages(remainingImages);
  };

  const setMainImage = (previewUrl: string) => {
    setImages((current) =>
      current.map((image) => ({
        ...image,
        isMain: image.previewUrl === previewUrl,
      })),
    );
  };

  const onSubmit = async (data: CreateDataForm) => {
    if (images.length === 0) {
      setImageError("Requires at least one image...");
      return;
    }

    const payload = prepareFormData(data, images);
    for (const [key, value] of payload.entries()) {
      console.log(key, value);
    }

    const res = await fetch("/api/product/create", {
      method: "POST",
      body: payload,
    });

    console.log("STATUS:", res.status);

    if (!res.ok) {
      const body = await res.json();

      toast.error(body.error?.message ?? "Something went wrong");

      return;
    }

    toast.success("Product created successfully");

    form.reset();
    setImages([]);
    setImageError(null);
  };
  return (
    <div>
      <div className="flex flex-1 my-10 justify-center">
        <div className="w-136 overflow-visible">
          <Card className="w-full shadow-xl max-w-2xl ">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                CREATE PRODUCT
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Product name</FieldLabel>

                    <Input
                      id="name"
                      autoComplete="off"
                      placeholder="Product name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="detail">Details</FieldLabel>

                    <Textarea
                      id="description"
                      placeholder="Product description"
                      {...form.register("description")}
                    />
                  </Field>
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.description.message}
                    </p>
                  )}
                  <Field>
                    <FieldLabel htmlFor="quantity">Initial Stock</FieldLabel>

                    <Input
                      id="quantity"
                      min={0}
                      type="number"
                      step="1"
                      {...form.register("quantity")}
                    />
                    {form.formState.errors.quantity && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.quantity.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="image">Product image</FieldLabel>
                    <ImageSelector
                      images={images}
                      setImages={setImages}
                      setImageError={setImageError}
                    ></ImageSelector>

                    <p>{MAX_PRODUCT_IMAGES} images max..</p>
                    {imageError && (
                      <p className="text-sm text-destructive">{imageError}</p>
                    )}
                  </Field>

                  <Field>
                    <div className="flex flex-col gap-4">
                      {images.map((image) => (
                        <ImageItem2
                          key={image.previewUrl}
                          image={image}
                          removeImage={removeImage}
                          setMainImage={setMainImage}
                        ></ImageItem2>
                      ))}
                    </div>
                  </Field>

                  <Button className="py-5 font-bold" type="submit">
                    Create Product
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

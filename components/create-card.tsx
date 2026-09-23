"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Star, StarHalf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { cn } from "@/lib/utils";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

const MAX_IMAGES = 3;

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().max(25).optional(),
  // Form value is a string → convert to number
  quantity: z.coerce.number().min(0, "Stock cannot be negative"),
});

type CreateProductForm = z.infer<typeof createProductSchema>;

type SelectedImage = {
  file: File;
  previewUrl: string;
  isMain: boolean;
};

export default function CreateCard() {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [imageError, setImageError] = useState("");

  const form = useForm<CreateProductForm>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      return;
    }
    const filesToAdd = files.slice(0, remainingSlots);
    const newImages = filesToAdd.map((file, index) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isMain: images.length === 0 && index === 0,
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleMain = (previewUrl: string) => {
    setImages((prev) =>
      prev.map((image) => ({
        ...image,
        isMain: image.previewUrl === previewUrl,
      })),
    );
  };

  const handleRemove = (previewUrl: string) => {
    setImages((prev) => prev.filter((item) => item.previewUrl !== previewUrl));
  };

  async function onSubmit(data: CreateProductForm) {
    if (images.length === 0) {
      setImageError("At least one image is required");
      return;
    }
    setImageError("");

    console.log(data);

    ////// CREATE SAVE IMAGES TO CLOUD API

    // Loop through all selected images

    // For each image:
    //   → POST /api/images
    //   → receive { url, publicId }
    //   → collect the result in uploadedImages[]

    let uploadedImages: {
      url: string;
      publicId: string;
      isMain: boolean;
    }[] = [];

    try {
      for (const item of images) {
        const formData = new FormData();
        formData.append("file", item.file);

        const res = await fetch("/api/image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const result = await res.json();

        uploadedImages = [
          ...uploadedImages,
          {
            url: result.data.url,
            publicId: result.data.publicId,
            isMain: item.isMain,
          },
        ];
      }
    } catch (error) {
      console.log(error);
      // Might be a SOONER LATER
    }

    console.log(uploadedImages);

    ////// CREATE UPDATE DB API
    const payload = { ...data, images: uploadedImages };

    const res = await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (!res.ok) {
      // show error with Sonner
      return;
    }

    // show success with Sonner
  }

  return (
    <div>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold">CREATE PRODUCT</CardTitle>
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
                  step="any"
                  placeholder="0"
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

                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                <p>{MAX_IMAGES} images max..</p>
                {imageError && (
                  <p className="text-sm text-destructive">{imageError}</p>
                )}
              </Field>

              <Field>
                <div className="flex flex-col gap-4">
                  {/*<div className="h-20 w-20 bg-green-200">image holder</div> */}
                  {images.map((image) => (
                    <div
                      key={image.previewUrl}
                      className="bg-secondary border rounded-md flex items-center justify-between gap-4"
                    >
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
                            handleRemove(image.previewUrl);
                          }}
                        >
                          <X className="shrink-0" />
                          <p>Remove</p>
                        </div>

                        <div
                          onClick={() => handleMain(image.previewUrl)}
                          className={cn(
                            "flex items-center gap-3",
                            image.isMain && "bg-green-200",
                          )}
                        >
                          <Star
                            className={cn(
                              "shrink-0",
                              image.isMain
                                ? "text-green-600"
                                : "text-muted-foreground",
                            )}
                          />

                          <p>{image.isMain ? "Main" : "Default"}</p>
                        </div>
                      </div>
                    </div>
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
  );
}

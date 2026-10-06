"use client";

import z from "zod";
import ImageForm from "./image-component/imageselector";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Imageitem from "./image-component/image-item";

import { prepareFormData } from "./image-component/image-utils";

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

export default function page() {
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
    if (images.length > 1) {
      setImages((current) =>
        current.filter((image) => image.previewUrl !== previewUrl),
      );
    }
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
    console.log(data);
    // verified if Image Data OK
    console.log("test");

    if (images.length === 0) {
      setImageError("Requires at least one image...");
      return;
    }

    const Payload = prepareFormData(data, images);

    const res = await fetch("/api/product/create", {
      method: "POST",
      body: Payload,
    });

    console.log(res);
  };
  return (
    <div>
      <p>test</p>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="data-form">
          <div className="flex flex-col">
            <label>name:</label>
            <input
              type="text"
              className="border-2 border-amber-100"
              {...form.register("name")}
            ></input>
            {form.formState.errors.name && (
              <p>{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label>description:</label>
            <input
              type="text"
              className="border-2 border-amber-100"
              {...form.register("description")}
            ></input>
            {form.formState.errors.description && (
              <p>{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="flex flex-col">
            <label>quantity:</label>
            <input
              type="number"
              className="border-2 border-amber-100 step=1"
              {...form.register("quantity")}
            ></input>
            {form.formState.errors.quantity && (
              <p>{form.formState.errors.quantity.message}</p>
            )}
          </div>
        </div>
        <div>
          <ImageForm
            images={images}
            setImages={setImages}
            setImageError={setImageError}
          ></ImageForm>
        </div>
        <Button type="submit">Submit</Button>

        {imageError && <p> {imageError} </p>}

        {images.map((image) => (
          <Imageitem
            key={image.previewUrl}
            image={image}
            onRemove={() => removeImage(image.previewUrl)}
            onSetMain={() => setMainImage(image.previewUrl)}
          />
        ))}
      </form>
    </div>
  );
}

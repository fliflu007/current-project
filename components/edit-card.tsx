"use client";
import { cn } from "cn";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { toast } from "sonner";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { X, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { EditCardProps } from "@/app/product/[id]/edit/page";
import { useState } from "react";

import { MAX_PRODUCT_IMAGES } from "@/lib/constants/products";

type ImageItem = {
  url: string;
  isPrimary: boolean;
  id?: string;
  publicId?: string;
  file?: File;
  createdAt?: Date;
};

const editProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string(),
});

type ProductFormData = z.infer<typeof editProductSchema>;

// COMPONENT
export default function EditCard({ product, imagelist }: EditCardProps) {
  const [images, setImages] = useState<ImageItem[]>(imagelist);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(editProductSchema),
    mode: "onChange",
    defaultValues: {
      name: product.name,
      description: product.description ?? "",
    },
  });

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;

    if (!files) return;

    const fileslist = Array.from(event.target.files ?? []);

    if (fileslist.length === 0) return;

    // control Max quantity of image
    if (fileslist.length + imagelist.length > MAX_PRODUCT_IMAGES) {
      toast.error(
        `Above Maximum of ${MAX_PRODUCT_IMAGES}..select less images or remove`,
      );
      return;
    }
    const newImages = fileslist.map((file) => {
      return {
        url: URL.createObjectURL(file),
        isPrimary: false,
        file,
      };
    });

    setImages((prev) => {
      return [...prev, ...newImages];
    });
  }

  // Main handler Click
  function handleMain(url: string) {
    setImages((prev) => {
      return prev.map((item) => {
        return {
          ...item,
          isPrimary: item.url === url ? true : false,
        };
      });
    });
  }

  function handleRemove(imagetoremove: ImageItem) {
    setImages((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      return prev.filter((item) => {
        return item.url !== imagetoremove.url;
      });
    });

    if (imagetoremove.isPrimary)
      setImages((prev) =>
        prev.map((item, index) => {
          return { ...item, isPrimary: index === 0 };
        }),
      );
  }

  async function onSubmit(data: ProductFormData) {
    // CREATION OF FORMDATA
    // Create multipart FormData because the request contains both JSON data and image files.
    const formData = new FormData();

    //product:
    //Product data: convert the form data object to JSON before adding it to FormData.
    formData.append("product", JSON.stringify(data));

    // Existing images that should remain associated with the product.
    const existingImages = images
      .filter((item) => item.publicId)
      .map((item) => {
        return { publicId: item.publicId, isPrimary: item.isPrimary };
      });

    // New images: create metadata linking each new file to its primary status.
    formData.append("existingImages", JSON.stringify(existingImages));

    const newImageList = images.filter((item) => item.file);

    // Add the actual image files using the same keys defined above.
    const newImages = newImageList.map((item, index) => ({
      key: `file${index}`,
      isPrimary: item.isPrimary,
    }));
    // newimage list :
    formData.append("newImages", JSON.stringify(newImages));

    //key : file
    newImageList.forEach((item, index) => {
      formData.append(`file${index}`, item.file!);
    });

    const res = await fetch(`api/product/${product.id}`, {
      method: "PATCH",
      body: formData,
    });
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
                <FieldLabel htmlFor="image">Product image</FieldLabel>
                <Input
                  onChange={onImageChange}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  multiple
                />
              </Field>
              {images.map((item) => (
                <Field key={item.url}>
                  <div className="flex items-center justify-between">
                    <div className="h-20 w-20">
                      <Image src={item.url} alt="" width={80} height={80} />
                    </div>
                    <div className="flex flex-col gap-3 p-2">
                      <div
                        onClick={() => handleRemove(item)}
                        className="flex items-center gap-3"
                      >
                        <X className="shrink-0" />
                        <p>Remove</p>
                      </div>

                      <div
                        onClick={() => handleMain(item.url)}
                        className={cn(
                          "flex items-center gap-3",
                          item.isPrimary && "bg-green-500",
                        )}
                      >
                        <Star className="shrink-0" />
                        <p>Main</p>
                      </div>
                    </div>
                  </div>
                </Field>
              ))}

              <Button className="py-5 font-bold" type="submit">
                Save Changes
              </Button>
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => setImages(imagelist)}
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

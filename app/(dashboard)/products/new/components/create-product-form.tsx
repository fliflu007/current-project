"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { prepareFormData } from "../utils/prepare-form-data";
import { toast } from "sonner";
import ProductImageManager from "./productimagemanager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { createProductDataSchema } from "@/schemas/product";
import { useRouter } from "next/navigation";

export type CreateDataForm = z.infer<typeof createProductDataSchema>;

export type ImageItemType = {
  file: File;
  previewUrl: string;
  isMain: boolean;
};

export default function CreateProductForm() {
  const router = useRouter();

  const form = useForm<CreateDataForm>({
    resolver: zodResolver(createProductDataSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      quantity: 0,
      barcode: "",
    },
  });
  const { isSubmitting } = form.formState;

  //init images state
  const [images, setImages] = useState<ImageItemType[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // reset submit error if images are added after a failed submission
  useEffect(() => {
    if (hasAttemptedSubmit && images.length > 0) {
      setSubmitError(null);
    }
  }, [images, hasAttemptedSubmit]);

  // Handle form submission
  const onSubmit = async (data: CreateDataForm) => {
    setHasAttemptedSubmit(true);

    // Validate Images readyness
    if (images.length === 0) {
      setSubmitError("Requires at least one image...");
      return;
    }

    // prepare the form data for api submission
    const payload = prepareFormData(data, images);

    let res: Response;
    try {
      res = await fetch("/api/product/create", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      setSubmitError(
        "Network error: unable to reach the server. Please check your internet connection and try again.",
      );
      toast.error(
        "Network error: unable to reach the server. Please check your internet connection and try again.",
      );
      return;
    }

    console.log("STATUS:", res.status);

    if (!res.ok) {
      const body = await res.json();

      if (res.status === 409) {
        form.setError("name", {
          type: "server",
          message: "Product with this name already exists.",
        });
        return;
      }
      console.log("error", body.error?.message ?? "Something went wrong");
      toast.error(body.error?.message ?? "Something went wrong");

      return;
    }

    toast.success("Product created successfully");
    const result = await res.json();
    router.push(`/products/${result.data.product.id}`);
  };
  return (
    <div>
      <div className="flex my-10 justify-center">
        <div className="w-full max-w-xl ">
          <Card className=" shadow-xl  w-full ">
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                CREATE PRODUCT
              </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} onChange={() => setSubmitError(null)}>
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
                    <FieldLabel htmlFor="barcode">Barcode (optional)</FieldLabel>
                    <Input
                      id="barcode"
                      autoComplete="off"
                      maxLength={22}
                      {...form.register("barcode")}
                    />
                    {form.formState.errors.barcode && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.barcode.message}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="image">Product image</FieldLabel>
                    <ProductImageManager
                      images={images}
                      setImages={setImages}
                    ></ProductImageManager>
                  </Field>
                  <Field>
                    {submitError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Submission Error</AlertTitle>
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}
                  </Field>
                  <Field></Field>

                  <Button
                    className="py-5 font-bold"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        Creating Product...
                        <LoaderCircle className="animate-spin" />
                      </>
                    ) : (
                      "Create Product"
                    )}
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

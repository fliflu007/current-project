import { Button } from "@/components/ui/button";
import { X, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";

export default function CreateCard() {
  return (
    <div>
      <Card className="shadow-xlS">
        <CardHeader>
          <CardTitle className="text-lg font-bold">CREATE PRODUCT</CardTitle>
        </CardHeader>

        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Product name</FieldLabel>
              <Input id="name" autoComplete="off" placeholder="Product name" />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Details</FieldLabel>
              <Textarea
                id="description"
                name="description"
                placeholder="Product description"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="quantity">Initial Stock</FieldLabel>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                placeholder="0"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="image">Product image</FieldLabel>
              <Input id="image" name="image" type="file" accept="image/*" />
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <div className="h-20 w-20 bg-green-200">image holder</div>

                <div className="flex flex-col gap-3 p-2">
                  <div className="flex items-center gap-3">
                    <X className="shrink-0" />
                    <p>Remove</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Star className="shrink-0" />
                    <p>Main</p>
                  </div>
                </div>
              </div>
            </Field>

            <Button className="py-5 font-bold" type="submit">
              Create Product
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}

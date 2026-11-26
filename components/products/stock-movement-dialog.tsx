"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type FormEvent } from "react";
import { ProductCardType } from "./product-card";
import { AlertDestructive } from "@/components/alert";
import { cn } from "cn";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export function StockMovementDialog({
  product,
  type,
}: {
  product: ProductCardType;
  type: "IN" | "OUT";
}) {
  const router = useRouter();

  console.log("prop:", type);
  const [reason, setReason] = useState<string | null>(null);
  const [errorAPI, setErrorAPI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const textColor = type === "IN" ? "text-green-600" : "text-red-600";

  async function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return; // Prevent double submission
    setIsLoading(true);
    setErrorAPI(null);

    const formData = new FormData(e.currentTarget);
    const quantity = formData.get("quantity");
    const otherReason = formData.get("otherReason");

    const exactReason = otherReason ? otherReason : reason;

    const apiRequest = {
      id: product.id,
      type: type,
      quantity: quantity,
      reason: exactReason,
    };

    console.log("api request :", apiRequest);

    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiRequest),
      });
      const response = await res.json();
      if (!res.ok) {
        const errorObj = response.error ?? "Error while fetching";
        setErrorAPI(
          typeof errorObj === "object" && errorObj !== null
            ? (errorObj as { message?: string }).message ?? "Error while fetching"
            : String(errorObj),
        );
        return;
      }

      if (type === "IN") toast.success(`Stock was successfully added`);
      else {
        toast.success("Stock successfully removed");
      }

      setOpen(false);
      router.refresh();
    } catch (e) {
      setErrorAPI("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              className={cn(
                "w-full",
                type === "IN"
                  ? "bg-green-500 hover:bg-green-600 text-white border-green-500"
                  : "bg-red-500 hover:bg-red-600 text-white border-red-500",
              )}
            >
              {type} {type === "IN" ? "+" : "-"}
            </Button>
          }
        />

        <DialogContent
          className="sm:max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={submitForm}>
            <DialogHeader>
              <DialogTitle className={cn(textColor)}>
                Stock {type === "IN" ? "IN" : "OUT"}
              </DialogTitle>

              <DialogDescription className="font-bold">
                Product name: {product.name}
              </DialogDescription>

              <DialogDescription>
                Current stock: {product.quantity}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              <Field>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  disabled={isLoading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="reason">Reason</FieldLabel>

                <Select
                  value={reason ?? ""}
                  onValueChange={setReason}
                  name="reason"
                  disabled={isLoading}
                >
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="purchase">Purchase</SelectItem>
                    <SelectItem value="restock">Restock</SelectItem>
                    <SelectItem value="return">Customer return</SelectItem>
                    <SelectItem value="correction">Stock correction</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {reason === "Other" && (
                <Field>
                  <FieldLabel htmlFor="otherReason">Other reason</FieldLabel>
                  <Input
                    id="otherReason"
                    name="otherReason"
                    maxLength={20}
                    required
                    disabled={isLoading}
                  />
                </Field>
              )}

              {errorAPI && (
                <AlertDestructive title="Error" errorText={errorAPI} />
              )}
            </FieldGroup>

            <DialogFooter className="mt-4">
              <DialogClose
                render={
                  <Button variant="outline" type="button" disabled={isLoading}>
                    Cancel
                  </Button>
                }
              />
              <Button
                className={cn(
                  type === "IN"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600",
                )}
                type="submit"
                disabled={isLoading}
              >
                Stock {type === "IN" ? "IN" : "OUT"} {isLoading && "..."}
                {isLoading && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
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
import { useState } from "react";

export function ProductStockIn() {
  const [reason, setReason] = useState<string | null>(null);
  return (
    <Dialog>
      <form>
        <DialogTrigger
          render={<Button variant="outline">Open Dialog</Button>}
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-green-600">Stock IN</DialogTitle>
            <DialogDescription className="font-bold">
              Product name : XF49 shoes
            </DialogDescription>
            <DialogDescription className="">
              Current stock : 55
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" step="any" />
            </Field>
            <FieldLabel htmlFor="reason">Reason</FieldLabel>

            <Select value={reason} onValueChange={setReason} name="reason">
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="restock">Restock</SelectItem>
                <SelectItem value="return">Customer return</SelectItem>
                <SelectItem value="correction">Stock correction</SelectItem>
                <SelectItem value="damaged">Damaged</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {reason === "other" && (
              <Field>
                <FieldLabel htmlFor="otherReason">Reason</FieldLabel>
                <Input id="otherReason" name="otherReason" />
              </Field>
            )}
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button className="bg-green-600" type="submit">
              Stock In
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}

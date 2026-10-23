"use client";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { CircleAlert } from "lucide-react";
import { Trash } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type ProductDeleteDialogProps = {
  onConfirm: () => Promise<{ error?: string }>;
};

export default function ProductDeleteDialog({
  onConfirm,
}: ProductDeleteDialogProps) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setError("");
    setPending(true);
    console.log("deletetrigger");
    try {
      const result = await onConfirm();
      if (result.error) {
        console.log("error delelete action :", result?.error);
        throw new Error("deletion issue");
      }

      toast.success("Product deleted successfully");

      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Issue deleting product");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <Trash />
            DELETE
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm border-destructive border">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete product?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        {/* ALERT*/}
        {error && (
          <Alert variant="destructive">
            <CircleAlert />
            <AlertTitle>Failed to delete product</AlertTitle>
            <AlertDescription>
              Something went wrong. Please try again.
            </AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

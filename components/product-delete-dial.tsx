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

type ProductDeleteDialogProps = {
  onConfirm: () => void;
};

export default function ProductDeleteDialog({
  onConfirm,
}: ProductDeleteDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Delete</Button>} />

      <DialogContent className="sm:max-w-sm border-destructive border">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete product?
          </DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

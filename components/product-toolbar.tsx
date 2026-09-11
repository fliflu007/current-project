import { Button } from "@/components/ui/button";
import React from "react";

export default function ProductToolbar() {
  return (
    <div className="container mx-auto flex justify-center">
      <Button variant="ghost" className="border-2 border-secondary">
        + Create Product
      </Button>
    </div>
  );
}

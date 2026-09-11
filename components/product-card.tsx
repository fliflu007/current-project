"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function ProductCard() {
  return (
    <Card className="w-full px-6 sm:flex sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 bg-amber-200" />

        <div>
          <CardTitle className="whitespace-nowrap">
            Product Name: <span>ShoesXL</span>
          </CardTitle>

          <CardDescription>
            Details:
            <br />
            <span>Those Shoes are very good for running and hiking.</span>
          </CardDescription>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="whitespace-nowrap text-sm font-medium">Stock: 55</p>

        <div className="flex flex-col gap-2">
          <Button type="button">IN +</Button>

          <Button type="button" variant="outline">
            OUT -
          </Button>
        </div>
      </div>
    </Card>
  );
}

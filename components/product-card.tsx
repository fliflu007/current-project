"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StockMovementDialog } from "./product-stock-in";

export type ProductCardType = {
  mainImageUrl: string | null;
  id: string;
  companyId: string;
  createdAt: Date;
  name: string;
  description: string | null;
  quantity: string;
};

export default function ProductCard({ product }: { product: ProductCardType }) {
  const router = useRouter();

  function sendToDetails(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    console.log("send to detail");
    router.push(`/products/${product.id}`);
  }

  return (
    <div onClick={sendToDetails}>
      <Card className="w-full px-6 sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            <Image
              src={product.mainImageUrl ?? "/placeholder.png"}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="whitespace-nowrap">
              Product Name: <span>{product.name}</span>
            </CardTitle>

            <CardDescription>
              Details:
              <br />
              <span>{product.description}</span>
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="whitespace-nowrap text-sm font-medium">
            Stock: {product.quantity}
          </p>

          <div className="flex flex-col gap-2">
            <StockMovementDialog
              product={product}
              type="IN"
            ></StockMovementDialog>
            <StockMovementDialog
              product={product}
              type="OUT"
            ></StockMovementDialog>
          </div>
        </div>
      </Card>
    </div>
  );
}

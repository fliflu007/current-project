"use client";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { StockMovementDialog } from "./stock-movement-dialog";

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

    router.push(`/products/${product.id}`);
  }

  return (
    <div onClick={sendToDetails}>
      <Card className="w-full px-6 flex flex-row items-center justify-between">
        <div className="flex flex-col-reverse sm:flex-row items-center gap-4">
          <div className="relative h-24 w-24 sm:h-20 sm:w-20 shrink-0">
            <Image
              src={product.mainImageUrl ?? "/placeholder.png"}
              alt={product.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <div>
            <CardTitle className="flex flex-col gap-1 mb-2">
              <span className="text-xs font-normal text-muted-foreground">
                Product Name:
              </span>
              <span className="text-base font-semibold">{product.name}</span>
            </CardTitle>

            <CardDescription className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Details:
              </span>
              <span className="text-sm font-medium text-foreground">
                {product.description || "No description available."}
              </span>
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-4 ">
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

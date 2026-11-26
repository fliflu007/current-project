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

export default function ProductCard({
  product,
  role,
}: {
  product: ProductCardType;
  role: "admin" | "staff" | "viewer";
}) {
  const router = useRouter();

  function sendToDetails(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    router.push(`/products/${product.id}`);
  }

  return (
    <div onClick={sendToDetails}>
      <Card className="w-full px-3 sm:px-6 py-3 flex flex-col min-[600px]:flex-row items-stretch min-[600px]:items-center justify-between gap-4 rounded-none min-[600px]:rounded-xl shadow-sm bg-gray-50">
        <div className="flex min-w-0 flex-row items-center gap-3 sm:gap-4">
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0">
            <Image
              src={product.mainImageUrl ?? "/placeholder.png"}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <CardTitle className="flex flex-col gap-1 mb-2">
              <span className="text-xs font-normal text-muted-foreground">
                Product Name:
              </span>
              <span className="text-base font-semibold break-words">
                {product.name}
              </span>
            </CardTitle>

            <CardDescription className="flex flex-col gap-1">
              <span className="text-xs font-normal text-muted-foreground">
                Details:
              </span>
              <span className="text-sm font-medium text-foreground break-words">
                {product.description || "No description available."}
              </span>
            </CardDescription>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between min-[600px]:justify-end gap-3 sm:gap-4 shrink-0">
          <p className="whitespace-nowrap text-sm font-medium">
            Stock: {product.quantity}
          </p>

          <div className="flex flex-row min-[600px]:flex-col gap-2">
            {role !== "viewer" && (
              <>
                <StockMovementDialog product={product} type="IN" />
                <StockMovementDialog product={product} type="OUT" />
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

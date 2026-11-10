"use client";
import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useMediaQuery } from "@/hook/use-media-query";
import ProductDetails from "./product-details";
import MovementHistoryTable from "./movement-history-table";

import { ProductDetailUI } from "@/app/products/[id]/type";
import { InventoryMovementDB } from "@/schemas/inventory";

export default function ProductDetailViewer({
  productDetail,
  historicalMovements,
  perpage,
}: {
  productDetail: ProductDetailUI;
  historicalMovements: InventoryMovementDB[];
  perpage: number;
}) {
  const [view, setView] = useState<"detail" | "inventory">("detail");
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div>
      <Tabs className="w-100 block md:hidden">
        <TabsList>
          <TabsTrigger
            onClick={() => {
              setView("detail");
            }}
            value="detail"
          >
            Detail
          </TabsTrigger>
          <TabsTrigger
            onClick={() => {
              setView("inventory");
            }}
            value="inventory"
          >
            Inventory Movement
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="md:flex md:mx-auto md:gap-6 max-w-7xl ">
        <div className={cn(isMobile && view !== "detail" && "hidden")}>
          <ProductDetails productDetail={productDetail} />
        </div>
        <div
          className={cn(
            "md:flex-1",
            isMobile && view !== "inventory" && "hidden",
          )}
        >
          <MovementHistoryTable
            historicalMovements={historicalMovements}
            perpage={perpage}
          />
        </div>
      </div>
    </div>
  );
}

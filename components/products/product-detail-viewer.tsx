"use client";
import { cn } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useMediaQuery } from "@/hook/use-media-query";
import ProductDetails from "./product-details";
import MovementHistoryTable from "./movement-history-table";
import { ProductDetailUI } from "@/app/(dashboard)/products/[id]/type";
import { InventoryMovementDB } from "@/schemas/inventory";

export default function ProductDetailViewer({
  productDetail,
  historicalMovements,
  perpage,
  role,
}: {
  productDetail: ProductDetailUI;
  historicalMovements: InventoryMovementDB[];
  perpage: number;
  role: UserRole;
}) {
  const [view, setView] = useState<"detail" | "inventory">("detail");
  const isMobile = useMediaQuery("(max-width: 767px)");

  return (
    <div className="">
      <Tabs className="w-100 block md:hidden">
        <TabsList>
          <TabsTrigger
            onClick={() => {
              setView("detail");
            }}
            value="detail"
            className="data-active:bg-gray-900 data-active:text-white hover:bg-gray-800 hover:text-white"
          >
            Detail
          </TabsTrigger>
          <TabsTrigger
            onClick={() => {
              setView("inventory");
            }}
            value="inventory"
            className="data-active:bg-gray-900 data-active:text-white hover:bg-gray-800 hover:text-white"
          >
            Inventory Movement
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="md:flex md:mx-auto md:gap-6 max-w-7xl ">
        <div
          className={cn(
            "md:flex-1.5",
            isMobile && view !== "detail" && "hidden",
          )}
        >
          <div className="p-3">
            <ProductDetails productDetail={productDetail} role={role} />
          </div>
        </div>
        <div
          className={cn(
            "md:flex-1",
            isMobile && view !== "inventory" && "hidden",
          )}
        >
          <div className="px-3">
            <MovementHistoryTable
              historicalMovements={historicalMovements}
              perpage={perpage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

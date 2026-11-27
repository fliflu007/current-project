import { Button } from "@/components/ui/button";
import { Plus, Minus, Pencil, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import Image from "next/image";
import ProductDeleteDialog from "./product-delete-dialog";
import { deleteByIdAction } from "@/app/(dashboard)/products/actions/action";
import { ProductDetailUI } from "@/app/(dashboard)/products/[id]/type";
import { StockMovementDialog } from "./stock-movement-dialog";

export default function ProductDetails({
  productDetail,
  role,
}: {
  productDetail: ProductDetailUI;
  role: UserRole;
}) {
  console.log(
    "ProductDetails executed:",
    typeof window === "undefined" ? "SERVER" : "BROWSER",
  );
  return (
    <div className="flex w-full justify-center md:block md:w-full">
      <Card className="w-full max-w-sm md:max-w-lg shadow-md bg-gray-50">
        <CardHeader>
          <CardTitle>
            <div className="font-light"> Product: </div>
            {productDetail.data.name}
          </CardTitle>
          <br></br>
          <CardDescription className="font-bold">
            <div className="font-light"> Details: </div>
            {productDetail.data.description || <p>No description available.</p>}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm font-bold mb-4">
            Current stock : <span>{productDetail.data.quantity}</span>
          </p>
          {role !== "viewer" && (
            <div className="flex justify-center gap-2">
              <div className="flex justify-center gap-2">
                <StockMovementDialog
                  product={{
                    id: productDetail.data.id,
                    name: productDetail.data.name,
                    quantity: productDetail.data.quantity,
                  }}
                  type="IN"
                />
                <StockMovementDialog
                  product={{
                    id: productDetail.data.id,
                    name: productDetail.data.name,
                    quantity: productDetail.data.quantity,
                  }}
                  type="OUT"
                />
              </div>
            </div>
          )}
        </CardContent>
        <div>
          <div className="px-4">
            <Carousel className="w-full">
              <CarouselContent>
                {/*here change the array make it image */}
                {productDetail.images.map((image, index) => (
                  <CarouselItem key={image.id}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="p-2">
                          <div className="relative aspect-square w-full">
                            <Image
                              src={image.url}
                              alt={`Product image ${index + 1}`}
                              fill
                              className="rounded-md object-contain"
                              sizes="(max-width: 640px) 80vw, 300px"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="mt-2 flex justify-center gap-2">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
            <div className="mt-2">
              {role === "admin" && (
                <div>
                  <Link href={`/products/${productDetail.data.id}/edit`}>
                    <Button variant="secondary">
                      <Pencil />
                      Edit
                    </Button>
                  </Link>
                  <ProductDeleteDialog
                    onConfirm={() => deleteByIdAction(productDetail.data.id)}
                  ></ProductDeleteDialog>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

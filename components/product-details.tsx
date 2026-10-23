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
import ProductDeleteDialog from "./product-delete-dial";
import { ProductDetailUI } from "@/app/products/[id]/type";
import { deleteByIdAction } from "@/app/products/[id]/action";

export default function ProductDetails({
  productDetail,
}: {
  productDetail: ProductDetailUI;
}) {
  console.log(
    "ProductDetails executed:",
    typeof window === "undefined" ? "SERVER" : "BROWSER",
  );
  return (
    <div>
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle>Product name : {productDetail.data.name}</CardTitle>
          <CardDescription>
            Details:<br></br>
            {productDetail.data.description}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm font-bold mb-4">
            Current stock : <span>{productDetail.data.quantity}</span>
          </p>
          <div className="flex justify-center gap-2">
            <Button className="bg-green-500">
              <Plus /> Stock IN
            </Button>
            <Button className="bg-red-600">
              <Minus /> Stock OUT
            </Button>
          </div>
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
          </div>
        </div>
      </Card>
    </div>
  );
}

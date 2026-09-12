import { Button } from "@/components/ui/button";
import { Plus, Minus, Pencil, Trash } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
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

export default function ProductDetails() {
  return (
    <div>
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader>
          <CardTitle>Product name : Shoes XL Adidas</CardTitle>
          <CardDescription>
            Details:<br></br>
            Here will be full detail provided per items
          </CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm font-bold mb-4">
            Current stock : <span>25</span>
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
                {Array.from({ length: 5 }).map((_, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Card>
                        <CardContent className="flex aspect-square items-center justify-center p-6">
                          <span className="text-4xl font-semibold">
                            {index + 1}
                          </span>
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
              <Button variant="secondary">
                <Pencil />
                Edit
              </Button>
              <Button variant="destructive">
                <Trash />
                DELETE
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductCardType } from "./product-card";
import FullScreenCarousel from "../fullscreencarousel";

export default function ProductImageGallery({
  product,
}: {
  product: ProductCardType;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const primaryImage = product.images.find((image) => image.isPrimary);

  type ProductImage = {
    url: string;
    isPrimary: boolean;
  };

  /// create array with url and isPrimary
  const images = product.images.map((product) => {
    return { url: product.url, isPrimary: product.isPrimary };
  });

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    setIsOpen(true);
    console.log("Gallery opened:", product.name);
  }

  return (
    <>
      <div
        onClick={handleImageClick}
        className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 cursor-pointer"
      >
        <Image
          src={primaryImage?.url ?? "/placeholder.png"}
          alt={product.name}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {isOpen && (
        <FullScreenCarousel images={images} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}

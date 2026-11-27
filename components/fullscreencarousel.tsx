"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type ProductImage = {
  url: string;
  isPrimary: boolean;
};

export default function FullScreenCarousel({
  images,
  onClose,
}: {
  images: ProductImage[];
  onClose: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  useEffect(() => {
    if (images.length === 0) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrevious();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, images.length]);

  if (images.length === 0) return null;

  const activeImage = images[activeIndex];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();

        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Product image gallery"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-gray-200"
        aria-label="Close gallery"
      >
        <X size={20} strokeWidth={2} />
      </button>

      {/* Main image */}
      <div className="relative h-[65vh] w-full max-w-5xl">
        <Image
          src={activeImage.url}
          alt={`Product image ${activeIndex + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {/* Previous / Next buttons */}
      <div className="mt-5 flex items-center gap-8">
        <button
          type="button"
          onClick={showPrevious}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-gray-200"
          aria-label="Previous image"
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        <span className="min-w-12 text-center text-sm text-white">
          {activeIndex + 1} / {images.length}
        </span>

        <button
          type="button"
          onClick={showNext}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:bg-gray-200"
          aria-label="Next image"
        >
          <ChevronRight size={22} strokeWidth={2} />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="mt-5 flex max-w-full gap-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={image.url}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
              activeIndex === index
                ? "border-white"
                : "border-transparent opacity-60"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.url}
              alt=""
              fill
              sizes="64px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

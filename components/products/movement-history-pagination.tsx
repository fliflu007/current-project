"use client";

import { Button } from "@/components/ui/button";

type PaginationHistoryProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationHistory({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationHistoryProps) {
  if (totalPages <= 1) return null;

  // Show first page, last page and nearby pages
  const visiblePages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);

  const pages = [...visiblePages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "...")[] = [];

  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      items.push("...");
    }

    items.push(page);
  });

  return (
    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>

      {items.map((item, index) =>
        item === "..." ? (
          <span key={`ellipsis-${index}`} className="px-1">
            ...
          </span>
        ) : (
          <Button
            key={item}
            size="sm"
            variant={currentPage === item ? "default" : "outline"}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        size="sm"
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
}

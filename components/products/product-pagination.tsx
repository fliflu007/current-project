import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from "lucide-react";

export default function ProductPagination({
  currentPage,
  lastPage,
}: {
  currentPage: number;
  lastPage: number;
}) {
  // Avoid invalid pagination values
  const totalPages = Math.max(1, lastPage);
  const page = Math.min(Math.max(1, currentPage), totalPages);

  // Show up to 3 consecutive pages around the current page
  let startPage = Math.max(1, page - 1);
  let endPage = Math.min(totalPages, page + 1);

  // Keep 3 visible pages when possible
  if (page === 1) {
    endPage = Math.min(totalPages, 3);
  } else if (page === totalPages) {
    startPage = Math.max(1, totalPages - 2);
  }

  const visiblePages = [];

  for (let i = startPage; i <= endPage; i++) {
    visiblePages.push(i);
  }

  const activeClass = "bg-black text-white hover:bg-black hover:text-white";

  const disabledClass = "pointer-events-none opacity-40";

  return (
    <div className="flex h-14 items-center justify-end">
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          {/* First page */}
          <PaginationItem>
            <PaginationLink
              href="/?page=1"
              aria-label="Go to first page"
              className={page === 1 ? disabledClass : ""}
            >
              <ChevronsLeft className="size-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Previous page */}
          <PaginationItem>
            <PaginationLink
              href={`/?page=${page - 1}`}
              aria-label="Go to previous page"
              className={page === 1 ? disabledClass : ""}
            >
              <ChevronLeft className="size-4" />
            </PaginationLink>
          </PaginationItem>

          {/* First page when hidden */}
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink href="/?page=1">1</PaginationLink>
              </PaginationItem>

              {startPage > 2 && (
                <PaginationItem>
                  <span className="px-2 text-muted-foreground">...</span>
                </PaginationItem>
              )}
            </>
          )}

          {/* Visible pages */}
          {visiblePages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={`/?page=${pageNumber}`}
                isActive={pageNumber === page}
                className={pageNumber === page ? activeClass : ""}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Last page when hidden */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-2 text-muted-foreground">...</span>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink href={`/?page=${totalPages}`}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          {/* Next page */}
          <PaginationItem>
            <PaginationLink
              href={`/?page=${page + 1}`}
              aria-label="Go to next page"
              className={page === totalPages ? disabledClass : ""}
            >
              <ChevronRight className="size-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Last page */}
          <PaginationItem>
            <PaginationLink
              href={`/?page=${totalPages}`}
              aria-label="Go to last page"
              className={page === totalPages ? disabledClass : ""}
            >
              <ChevronsRight className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

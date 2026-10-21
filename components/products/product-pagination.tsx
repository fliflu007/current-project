import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import {
  Search,
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
  console.log("current page :", currentPage);
  console.log("last page", lastPage);
  let activeIndicatorPosition;
  // first value from the left
  let valueFirstIndicator;

  activeIndicatorPosition = 2;
  valueFirstIndicator = currentPage - 1;

  //
  if (currentPage === 1) {
    activeIndicatorPosition = 1;
    valueFirstIndicator = 1;
  } else if (currentPage === lastPage) {
    activeIndicatorPosition = 3;
    valueFirstIndicator = currentPage - 2;
  }
  //

  if (currentPage === 2 && lastPage === 2) {
    valueFirstIndicator = 1;
    activeIndicatorPosition = 2;
  }
  return (
    <div className="flex h-14 items-center justify-end">
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href={`/?page=1`}>
              <ChevronsLeft className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href={`/?page=${currentPage - 1}`}>
              <ChevronLeft className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink
              href={`/?page=${valueFirstIndicator}`}
              isActive={activeIndicatorPosition === 1}
            >
              {valueFirstIndicator}
            </PaginationLink>
          </PaginationItem>

          {lastPage > 1 && (
            <PaginationItem>
              <PaginationLink
                href={`/?page=${valueFirstIndicator + 1}`}
                isActive={activeIndicatorPosition === 2}
              >
                {valueFirstIndicator + 1}
              </PaginationLink>
            </PaginationItem>
          )}
          {lastPage > 2 && (
            <PaginationItem>
              <PaginationLink
                href={`/?page=${valueFirstIndicator + 2}`}
                isActive={activeIndicatorPosition === 3}
              >
                {valueFirstIndicator + 2}
              </PaginationLink>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink href={`/?page=${currentPage + 1}`}>
              <ChevronRight className="size-4" />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href={`/?page=${lastPage}`}>
              <ChevronsRight className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

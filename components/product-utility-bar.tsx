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

type ProductUtilityBarProps = {
  currentPage: number;
  lastPage: number;
};

export default function ProductUtilityBar({
  currentPage,
  lastPage,
}: ProductUtilityBarProps) {
  // 1 - 2 - 3
  let indicatorPosition;
  // first value from the left
  let valueFirstIndicator;

  indicatorPosition = 2;
  valueFirstIndicator = currentPage - 1;
  if (currentPage === 1) {
    indicatorPosition = 1;
    valueFirstIndicator = 1;
  }
  if (currentPage === lastPage) {
    indicatorPosition = 3;
    valueFirstIndicator = currentPage - 3;
  }

  if (currentPage === 2 && lastPage === 2) {
    valueFirstIndicator = 1;
    indicatorPosition = 2;
  }

  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search products..."
          aria-label="Search products"
        />
      </div>

      {/* Pagination */}
      <div className="flex h-14 items-center justify-end">
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            {/* First page */}
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
                isActive={indicatorPosition === 1}
              >
                {valueFirstIndicator}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href={`/?page=${valueFirstIndicator + 1}`}
                isActive={indicatorPosition === 2}
              >
                {valueFirstIndicator + 1}
              </PaginationLink>
            </PaginationItem>

            <PaginationItem>
              <PaginationLink
                href={`/?page=${valueFirstIndicator + 2}`}
                isActive={indicatorPosition === 3}
              >
                {valueFirstIndicator + 2}
              </PaginationLink>
            </PaginationItem>

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
    </div>
  );
}

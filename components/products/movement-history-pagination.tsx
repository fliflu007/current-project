import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeftIcon } from "lucide-react";
import { cn } from "cn";
import { ChevronRightIcon } from "lucide-react";

export function PaginationHistory() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <div className="pl-1.5">
            <ChevronLeftIcon data-icon="inline-start" className="h-4" />
          </div>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" lastPage="99" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function PaginationNext({
  className,
  lastPage = "99",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { lastPage?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{lastPage}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  );
}

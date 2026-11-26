"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { InventoryMovementDB } from "@/schemas/inventory";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { PaginationHistory } from "./movement-history-pagination";

export default function MovementHistoryTable({
  historicalMovements,
  perpage,
  currentPage,
  totalPages,
  totalMovements,
}: {
  historicalMovements: InventoryMovementDB[];
  perpage: number;
  currentPage: number;
  totalPages: number;
  totalMovements: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURL = (page: number, newPerPage: number) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(page));
    params.set("perPage", String(newPerPage));

    router.push(`${pathname}?${params.toString()}`);
  };

  const start = totalMovements === 0 ? 0 : (currentPage - 1) * perpage + 1;

  const end = Math.min(currentPage * perpage, totalMovements);

  return (
    <div className="rounded-xl border bg-card shadow-sm w-full mt-3">
      <div className="font-medium px-5 py-3">Inventory Movements</div>

      <div className="bg-secondary px-5 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-muted-foreground">
            Showing {start}–{end} of {totalMovements}
          </span>

          <Select
            value={String(perpage)}
            onValueChange={(value) => updateURL(1, Number(value))}
          >
            <SelectTrigger className="w-[85px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {[5, 10, 20, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Reason</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {historicalMovements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No inventory movements yet.
              </TableCell>
            </TableRow>
          ) : (
            historicalMovements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="font-medium">
                  {movement.createdAt.toLocaleString()}
                </TableCell>

                <TableCell className="text-center">{movement.type}</TableCell>

                <TableCell className="text-center">
                  {movement.quantity}
                </TableCell>

                <TableCell className="text-center">
                  {movement.comment || "--"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>

        <PaginationHistory
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => updateURL(page, perpage)}
        />
      </div>
    </div>
  );
}

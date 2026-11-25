"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoveUp, MoveDown, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaginationHistory } from "./movement-history-pagination";
import { InventoryMovementDB } from "@/schemas/inventory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { inventoryMovements } from "@/db/schema";
import { db } from "@/db";
import { desc, asc } from "drizzle-orm";
import { useState } from "react";

export default function MovementHistoryTable({
  historicalMovements,
  perpage,
}: {
  historicalMovements: InventoryMovementDB[];
  perpage: number;
}) {
  console.log("historicalMovements:", historicalMovements);
  console.log("perpage:", perpage);

  const [perPage, setPerPage] = useState<number>(perpage);

  const transactions = historicalMovements;
  const onPerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    // new Fetch call to get the new data based on the new perPage value
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm w-full">
      <div className="title font-medium px-5 py-3">Inventory Movements</div>
      <div className="bg-secondary px-5 py-3 text-right">
        <div className="flex items-center gap-2 justify-between">
          <div className="w-fit shrink-0">
            <PaginationHistory />
          </div>

          <Select
            value={String(perPage)}
            onValueChange={(value) => onPerPageChange(Number(value))}
          >
            <SelectTrigger className="w-[80px]">
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
          <Button variant="outline">
            Columns
            <ChevronDown className="ml-2 size-4 " />
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead className="text-center">
              <span className="inline-flex items-center gap-1">
                Type
                <MoveUp className="size-3" />
                <MoveDown className="size-3" />
              </span>
            </TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((movement) => (
            <TableRow key={movement.id}>
              <TableCell className="font-medium">
                {movement.createdAt.toLocaleString()}{" "}
              </TableCell>
              <TableCell className="text-center">{movement.type}</TableCell>
              <TableCell className="text-center">{movement.quantity}</TableCell>
              <TableCell className="text-center">
                {movement.comment || "--"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

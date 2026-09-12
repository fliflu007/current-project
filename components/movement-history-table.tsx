import React from "react";
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

export default function MovementHistoryTable() {
  return (
    <div className="rounded-xl border bg-card shadow-sm w-full">
      <div className="title font-medium px-5 py-3">Inventory Movements</div>
      <div className="bg-secondary px-5 py-3 text-right">
        <Button variant="outline">
          Columns
          <ChevronDown className="ml-2 size-4" />
        </Button>
      </div>
      <Table>
        <TableCaption></TableCaption>
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
          <TableRow>
            <TableCell className="font-medium">01/09/2025</TableCell>
            <TableCell className="text-center">IN</TableCell>
            <TableCell className="text-center">5</TableCell>
            <TableCell className="text-center">Receive extra supply</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

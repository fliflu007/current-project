// TODO : NEED TO UPDATE CURRENT STOCK

import z from "zod";

import { inventoryInputSchema } from "@/schemas/inventory";

import { addInventory } from "@/services/inventory.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const cleanBody = inventoryInputSchema.parse(body);

    const result = await addInventory(cleanBody);

    return Response.json(
      {
        data: result,
        error: null,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid inventory input",
          },
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        data: null,
        error: {
          code: "INVENTORY_ERROR",
          message: "Could not create inventory movement",
        },
      },
      { status: 500 },
    );
  }
}

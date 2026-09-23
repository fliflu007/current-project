export function validationError(message: string) {
  return Response.json(
    {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message,
      },
    },
    { status: 400 },
  );
}

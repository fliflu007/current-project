/**
 * API RESPONSE HELPERS
 *
 * Use these functions inside Next.js route handlers to return
 * consistent HTTP responses.
 *
 * - unauthorizedResponse()       → 401: User is not authenticated.
 * - forbiddenResponse()          → 403: User is authenticated but lacks permission.
 * - profileNotFoundResponse()    → 404: Authenticated user has no associated profile.
 * - validationErrorResponse()    → 400: Request data is invalid.
 * - notFoundResponse()           → 404: Requested resource does not exist.
 * - conflictResponse()           → 409: Request conflicts with existing data.
 * - internalServerErrorResponse()→ 500: Unexpected server-side error.
 *
 * Use `return responseFunction()` for straightforward checks
 * directly inside a route handler.
 *
 * For errors thrown by application logic or service functions,
 * catch the custom error and translate it into an API response.
 *
 * Keep HTTP response formatting in this file.
 */

export function unauthorizedResponse() {
  return Response.json(
    {
      data: null,
      error: {
        code: "UNAUTHORIZED",
        message: "You must be logged in",
      },
    },
    { status: 401 },
  );
}

export function validationErrorResponse(message: string) {
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

export function profileNotFoundResponse() {
  return Response.json(
    {
      data: null,
      error: {
        code: "PROFILE_NOT_FOUND",
        message: "Profile not found",
      },
    },
    { status: 404 },
  );
}

export function forbiddenResponse() {
  return Response.json(
    {
      data: null,
      error: {
        code: "FORBIDDEN",
        message: "You don't have permission to perform this action",
      },
    },
    { status: 403 },
  );
}

export function notFoundResponse(message: string) {
  return Response.json(
    {
      data: null,
      error: {
        code: "NOT_FOUND",
        message,
      },
    },
    { status: 404 },
  );
}

export function conflictResponse(message: string) {
  return Response.json(
    {
      data: null,
      error: {
        code: "CONFLICT",
        message,
      },
    },
    { status: 409 },
  );
}

export function internalServerErrorResponse() {
  return Response.json(
    {
      data: null,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred",
      },
    },
    { status: 500 },
  );
}

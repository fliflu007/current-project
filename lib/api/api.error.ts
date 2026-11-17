/**
 * CUSTOM API / APPLICATION ERRORS
 *
 * Use these classes when application logic detects a problem
 * that should be handled by the calling route handler.
 *
 * - ValidationError → Request or input data is invalid.
 * - NotFoundError   → Requested resource does not exist.
 * - ConflictError   → Operation conflicts with existing data.
 *
 * Throw these errors from helpers or application logic.
 * Catch them in the route handler and convert them into
 * the appropriate HTTP response using api-response.ts.
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
export class InternalServerError extends Error {
  constructor(message = "Internal server error") {
    super(message);
    this.name = "InternalServerError";
  }
}

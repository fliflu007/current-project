# Service Layer

## Return Convention

- Successful operation → return application data
- Resource not found → return `null` when appropriate
- Unexpected failure → throw an error
- Do not return `Response.json()` from services
- HTTP status codes and API response envelopes are handled by routes

## Examples

createProduct() → Product
getProduct() → Product | null
patchProduct() → Product | null
deleteProduct() → { deleted: boolean }

## Current Status

Service conventions are established and are being progressively applied
as existing services are refactored.

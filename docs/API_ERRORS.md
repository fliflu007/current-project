final DEFINITION

| Error code              | HTTP | Meaning                               |
| ----------------------- | ---- | ------------------------------------- |
| `VALIDATION_ERROR`      | 400  | Request data is invalid               |
| `UNAUTHORIZED`          | 401  | User isn't authenticated              |
| `FORBIDDEN`             | 403  | User is authenticated but not allowed |
| `NOT_FOUND`             | 404  | Requested resource doesn't exist      |
| `CONFLICT`              | 409  | Request conflicts with existing data  |
| `INTERNAL_SERVER_ERROR` | 500  | Unexpected server error               |

├── Product → 200
├── Product[] → 200
├── null → 404 (when appropriate)
├── Zod failure → 400
├── Auth failure → 401
├── Authorization failure → 403
├── Business error → appropriate HTTP status
└── unexpected error → 500

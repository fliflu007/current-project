# API Contract

## Response Format

All API endpoints use a consistent response structure.

### Success Response

```ts
{
  data: T,
  error: null
}
```

`T` represents the data returned by the endpoint.

Example:

```ts
{
  data: {
    id: "product-123",
    name: "Keyboard",
    quantity: 10
  },
  error: null
}
```

### Error Response

```ts
{
  data: null,
  error: {
    code: string,
    message: string
  }
}
```

Example:

```ts
{
  data: null,
  error: {
    code: "NOT_FOUND",
    message: "Product does not exist"
  }
}
```

The available error codes and their HTTP status codes are defined in `API_ERRORS.md`.

---

## Data Conventions

- API responses return `data` on successful operations.
- API errors return `data: null`.
- Successful responses return `error: null`.
- Error responses contain an error `code` and human-readable `message`.
- Database-specific representations are normalized before being returned by the API.

For example, PostgreSQL `numeric` values are converted to JavaScript `number` values before being returned.

---

## General API Flow

```text
Request
  ↓
Authentication (when required)
  ↓
Authorization (when required)
  ↓
Validation
  ↓
Service
  ↓
Database
  ↓
Response
```

Not every endpoint requires every step.

---

## API Design Principles

- Keep response structures consistent across endpoints.
- Validate incoming request data before calling the service layer.
- Keep database operations inside the service layer.
- Return appropriate HTTP status codes for errors.
- Avoid exposing unexpected internal errors to clients.

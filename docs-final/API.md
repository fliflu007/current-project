# API Reference — Inventory Management System

## 1. Base URL
```
/api
```

## 2. Response Format

All endpoints follow a consistent structure:

### Success Response
```ts
{
  data: T,
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

### Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request data invalid |
| `BAD_REQUEST` | 400 | Invalid JSON body |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Conflicts with existing data |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

---

## 3. Authentication

### POST /api/auth/register
Register a new user, company, and admin profile.

**Request:**
```json
{
  "companyName": "string (min 1)",
  "email": "string (email format)",
  "password": "string (min 6)"
}
```

**Responses:**
- `201` — Created: `{ data: { user, company, profile }, error: null }`
- `400` — Validation error / Supabase auth error
- `500` — Company/profile creation failed / unexpected error

**Notes:**
- Creates Supabase auth user
- Creates company record
- Creates profile with `admin` role
- No email confirmation flow implemented

---

## 4. Products

### POST /api/product/create
Create a new product with images.

**Authentication:** Required
**Authorization:** Admin only
**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | string (JSON) | Yes | Product data |
| imagesData | string (JSON) | Yes | Image metadata |
| image-{key} | File | Yes | Image files |

**data JSON:**
```json
{
  "name": "string (3-25 chars)",
  "description": "string (max 50, optional)",
  "quantity": "number (min 0)"
}
```

**imagesData JSON:**
```json
[
  { "key": "image-0", "isMain": true },
  { "key": "image-1", "isMain": false }
]
```
- 1-3 images required
- Exactly one `isMain: true`

**Responses:**
- `201` — Created: `{ data: { product }, error: null }`
- `400` — Validation error / missing images / invalid file
- `401` — Unauthorized
- `403` — Forbidden (not admin)
- `409` — Duplicate product name in company
- `500` — Database / Cloudinary error

**Verified:** ✅ 7 automated tests pass

---

### GET /api/product
**NOT IMPLEMENTED — Endpoint removed**

Product listing is handled by a Server Component (`app/(dashboard)/page.tsx`) that queries the database directly with proper tenant isolation via `companyId`.

| Feature | Implementation |
|---------|----------------|
| Authentication | Required (via `requireUserContextCached`) |
| Authorization | All roles |
| Tenant filtering | `eq(products.companyId, companyId)` |
| Pagination | 10 per page |
| Search | ILIKE on name |

**Response shape** (from Server Component):
```ts
{
  id: string,
  companyId: string,
  name: string,
  description: string | null,
  quantity: number,
  createdAt: string,
  mainImageUrl: string
}
```

---

### GET /api/product/[id]
Get product details with all images.

**Authentication:** Required
**Authorization:** All roles
**Tenant Check:** Returns 404 if product not in user's company

**Responses:**
- `200` — `{ data: { product, images }, error: null }`
- `401` — Unauthorized
- `404` — Not found / not in your company
- `500` — Server error

**Response Data:**
```ts
{
  id: string,
  name: string,
  description: string | null,
  quantity: number,
  createdAt: string,
  images: Array<{
    id: string,
    url: string,
    publicId: string,
    isPrimary: boolean,
    createdAt: string
  }>
}
```

**Verified:** ✅ Manual verification passed

---

### PATCH /api/product/[id]
Update product details and/or images.

**Authentication:** Required
**Authorization:** Admin only
**Tenant Check:** Returns 404 if product not in user's company
**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | string (JSON) | No | Product fields to update |
| existingImages | string (JSON) | No* | Existing images to keep |
| newImages | string (JSON) | No* | New image metadata |
| image-{key} | File | No* | New image files |

*If images are modified, both `existingImages` and `newImages` must be provided together.

**data JSON:**
```json
{
  "name": "string (3-25, optional)",
  "description": "string (max 50, optional)"
}
```
- Partial updates supported
- Quantity NOT editable via this endpoint

**existingImages JSON:**
```json
[
  { "publicId": "products/abc123", "isPrimary": true }
]
```

**newImages JSON:**
```json
[
  { "key": "image-0", "isPrimary": false }
]
```
- Keys must match `image-{n}` pattern
- Exactly one primary across existing + new
- Total images (existing + new): 1-5

**Responses:**
- `200` — `{ data: "OK", error: null }`
- `400` — Validation error (nothing to update, invalid data, image rules)
- `401` — Unauthorized
- `403` — Forbidden (not admin)
- `404` — Product not found / not in your company
- `500` — Database / Cloudinary error

**Verified:** ✅ 23 automated tests pass (13 validation + 10 API route)

---

### DELETE /api/product/[id]
**NOT IMPLEMENTED AS API ENDPOINT**

Product deletion is performed via Server Action:
- `app/(dashboard)/products/actions/action.tsx` → `deleteByIdAction(id)`

See Server Actions section below.

---

## 5. Inventory (Stock Movements)

### POST /api/stock
Record a stock IN or OUT movement.

**Authentication:** Required
**Authorization:** Admin, Staff (Viewer blocked)
**Tenant Check:** Returns 404 if product not in user's company
**Content-Type:** `application/json`

**Request:**
```json
{
  "id": "string (UUID)",
  "type": "IN" | "OUT",
  "quantity": "number (positive)",
  "reason": "string (max 20, optional)"
}
```

**Business Rules:**
- Quantity must be > 0
- Type must be IN or OUT
- OUT can exceed available stock (negative stock allowed by design)
- Movement recorded in `inventory_movements`
- Product `quantity` updated accordingly

**Responses:**
- `200` — `{ data: { transaction, product }, error: null }`
- `400` — Validation error (missing fields, invalid type, negative quantity, invalid JSON)
- `401` — Unauthorized
- `403` — Forbidden (viewer role)
- `404` — Product not found / not in your company
- `500` — Server error

**Known Gap:** No database transaction wrapping movement insert + quantity update.

**Verified:** ✅ 9 automated tests pass (partial mocking)

---

### GET /api/stock
Get paginated movement history for a product.

**Authentication:** Required
**Authorization:** All roles
**Tenant Check:** Returns 404 if product not in user's company

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| productId | UUID | Required | Product to query |
| page | int | 1 | Page number |
| perPage | int | 10 | Items per page |
| column | enum | "date" | Sort column: date, quantity, type |
| order | enum | "desc" | Sort order: asc, desc |

**Responses:**
- `200` — `{ data: Movement[], error: null }`
- `400` — Validation error (invalid query params)
- `401` — Unauthorized
- `404` — Product not found / not in your company
- `500` — Server error

**Movement Shape:**
```ts
{
  id: string,
  productId: string,
  type: "IN" | "OUT",
  quantity: string, // numeric as string
  comment: string | null,
  createdAt: string
}
```

---

## 6. Images

### POST /api/image
Upload image to Cloudinary (used by product creation/editing).

**Authentication:** Required
**Authorization:** Admin only

**Request:** `multipart/form-data` with `file` field

**Responses:**
- `200` — `{ data: { url, publicId }, error: null }`
- `400` — Invalid file / missing file
- `401` — Unauthorized
- `403` — Forbidden
- `500` — Cloudinary error

---

### DELETE /api/image
Delete image from Cloudinary.

**Authentication:** Required
**Authorization:** Admin only

**Request:** `application/json`
```json
{ "publicId": "string" }
```

**Responses:**
- `200` — Success
- `400` — Missing publicId
- `401` — Unauthorized
- `403` — Forbidden
- `500` — Cloudinary error

---

## 7. Server Actions

### deleteByIdAction(id: string)
Delete a product, its images, and movement history.

**Location:** `app/(dashboard)/products/actions/action.tsx`

**Authentication:** Required (via `requireUserId()`)
**Authorization:** Admin only
**Tenant Check:** Verifies product belongs to user's company

**Returns:**
```ts
type DeleteActionResult =
  | { success: true }
  | { success: false; error: string }
```

**Errors:**
- `"Invalid product ID"` — Not a valid UUID
- `"authentification error"` — Not authenticated
- `"not admin, can not delete product"` — Not admin role
- `"Error deleting product"` — Database error / not found / cross-tenant

**Behavior:**
1. Validates UUID format
2. Checks authentication
3. Checks admin role
4. Database transaction: deletes product_images, inventory_movements, products
5. Cloudinary cleanup for each image
6. Returns result object

**Verified:** ✅ 6 automated tests pass + manual verification

---

## 8. Development/Debug Endpoints

### POST /api/dev/switch-role
Switch current user's role (development only).

**Request:**
```json
{ "role": "admin" | "staff" | "viewer" }
```

**Note:** Not for production use.

---

## 9. Request/Response Examples

### Create Product (multipart/form-data)
```
POST /api/product/create
Content-Type: multipart/form-data; boundary=----Boundary

------Boundary
Content-Disposition: form-data; name="data"

{"name":"Keyboard","description":"Mechanical","quantity":10}
------Boundary
Content-Disposition: form-data; name="imagesData"

[{"key":"image-0","isMain":true}]
------Boundary
Content-Disposition: form-data; name="image-0"; filename="kb.jpg"
Content-Type: image/jpeg

<binary data>
------Boundary--
```

**Response (201):**
```json
{
  "data": {
    "product": {
      "id": "uuid",
      "companyId": "uuid",
      "name": "Keyboard",
      "description": "Mechanical",
      "quantity": "10",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "error": null
}
```

### Stock IN (application/json)
```
POST /api/stock
Content-Type: application/json

{
  "id": "product-uuid",
  "type": "IN",
  "quantity": 5,
  "reason": "purchase"
}
```

**Response (200):**
```json
{
  "data": {
    "transaction": {
      "id": "uuid",
      "productId": "product-uuid",
      "type": "IN",
      "quantity": "5",
      "comment": "purchase",
      "createdAt": "2024-01-15T10:35:00.000Z"
    },
    "product": {
      "id": "product-uuid",
      "companyId": "uuid",
      "name": "Keyboard",
      "description": "Mechanical",
      "quantity": "15",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "error": null
}
```

### Error Response (400)
```json
{
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name must be at least 3 characters"
  }
}
```

---

## 10. Validation Rules Summary

### Product Creation
| Field | Rule |
|-------|------|
| name | 3-25 chars, unique per company |
| description | max 50 chars, optional |
| quantity | >= 0 |
| images | 1-3, exactly 1 primary |
| image files | JPEG/PNG/WebP, max 5MB |

### Product Editing (PATCH)
| Field | Rule |
|-------|------|
| name | 3-25 chars, optional |
| description | max 50 chars, optional |
| quantity | NOT editable |
| existingImages + newImages | Must be provided together |
| total images | 1-5 |
| primary image | Exactly 1 across all |
| existing images | Must belong to product |

### Stock Movements
| Field | Rule |
|-------|------|
| id | Valid UUID |
| type | IN or OUT |
| quantity | > 0 |
| reason | max 20 chars, optional |

---

## 11. Test Coverage

| Endpoint | Automated Tests | Manual Verification |
|----------|-----------------|---------------------|
| POST /api/auth/register | 0 | Not verified |
| POST /api/product/create | 7 (Vitest) + 5 (Playwright) | ✅ |
| GET /api/product | N/A (Server Component) | ✅ Manual |
| GET /api/product/[id] | 0 | ✅ |
| PATCH /api/product/[id] | 23 (Vitest) | ✅ |
| POST /api/stock | 9 (Vitest) | ⚠️ Partial |
| GET /api/stock | 0 | Not verified |
| deleteByIdAction | 6 (Vitest) | ✅ |

**Total Automated Tests:** 45+ passing
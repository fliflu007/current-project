# Security — Inventory Management System

## 1. Authentication

### 1.1 Implementation
- **Provider:** Supabase Auth (email/password)
- **Session Management:** Server-side via Supabase server client
- **Helpers:** `lib/auth/require-user.ts`

### 1.2 Functions
```ts
// Returns Supabase user object or 401 Response
requireUser(): Promise<User | Response>

// Returns userId string or null
requireUserId(): Promise<string | null>

// Cached version for React Server Components
requireUserIdCached(): Promise<string | null>
```

### 1.3 Protected Routes
All API routes under `/api/` (except `/api/auth/register`) require authentication:
- `requireUserId()` called at start of each handler
- Returns `401 UNAUTHORIZED` if no valid session

### 1.4 Verified Status
| Check | Status | Evidence |
|-------|--------|----------|
| Login page exists | ✅ Implemented | `app/(auth)/login/page.tsx` |
| Register page exists | ✅ Implemented | `app/(auth)/register/page.tsx` |
| Protected pages redirect | ✅ Implemented | `app/(dashboard)/layout.tsx` uses auth |
| API 401 on unauthenticated | ✅ Tested | `tests/products/create.product.api.test.ts` |
| Session validation | ✅ Implemented | `requireUserId()` uses `supabase.auth.getUser()` |

## 2. Authorization

### 2.1 Role System
Three roles stored in `profiles.role`:
- `admin` — Full product CRUD + stock movements
- `staff` — Read products + stock movements
- `viewer` — Read-only access

### 2.2 Implementation
```ts
// lib/auth/require-user-context.ts
requireUserContext(userId): Promise<{ companyId: string, role: string }>
```

Returns user's `companyId` and `role` from profiles table. Throws `InternalServerError` if profile not found.

### 2.3 API Enforcement
Every protected API route:
1. Calls `requireUserId()` → 401 if null
2. Calls `requireUserContext(userId)` → gets role + companyId
3. Checks role before allowing operation

### 2.4 Permission Matrix (Implemented)

| Endpoint | Admin | Staff | Viewer |
|----------|-------|-------|--------|
| POST /api/product/create | ✓ | 403 | 403 |
| PATCH /api/product/[id] | ✓ | 403 | 403 |
| DELETE (Server Action) | ✓ | 403 | 403 |
| POST /api/stock | ✓ | ✓ | 403 |
| GET /api/stock | ✓ | ✓ | ✓ |
| GET /api/product | ✓ | ✓ | ✓ |
| GET /api/product/[id] | ✓ | ✓ | ✓ |

### 2.5 Verified Status
| Check | Status | Evidence |
|-------|--------|----------|
| Admin can create product | ✅ Tested | `create.product.api.test.ts` line 178-192 |
| Staff blocked from create | ✅ Tested | `create.product.api.test.ts` line 178-192 |
| Staff blocked from edit | ✅ Tested | `patch.test.ts` line 361-376 |
| Viewer blocked from stock | ✅ Tested | `stock/route.ts` line 28-30 |
| API enforces roles (not just UI) | ✅ Implemented | All routes check role |

## 3. Tenant Isolation (Company Data Isolation)

### 3.1 Design
- Each user profile has `companyId` FK to companies table.
- Products have `companyId` FK.
- All product queries filter by authenticated user's `companyId`.

### 3.2 Implementation Points

**Product Queries (services/products.service.ts):**
```ts
getProducts(companyId) // filters by companyId
getProductById(id, companyId) // filters by id AND companyId
getProductForCompany(id, companyId) // throws NotFoundError if not owned
```

**API Routes:**
- Create: Gets `companyId` from `requireUserContext`, passes to service
- PATCH: Calls `getProductForCompany(id, companyId)` before any operation
- Stock: Calls `getProductForCompany(validedId, companyId)` before operation
- GET /api/stock: Calls `getProductForCompany(productId, companyId)` before query

### 3.3 Cross-Company Access Behavior
Attempts to access another company's product return `404 NOT_FOUND` (not 403).
This is intentional — avoids leaking existence of resources.

### 3.4 Verified Status
| Check | Status | Evidence |
|-------|--------|----------|
| Product creation uses user's companyId | ✅ Implemented | `product/create/route.ts` line 42 |
| Product listing filters by companyId | ✅ Implemented | `products.service.ts` line 88-91 |
| PATCH checks tenant ownership | ✅ Implemented | `product/[id]/route.ts` line 45 |
| Stock operations check tenant | ✅ Implemented | `stock/route.ts` line 49, 135 |
| Cross-company returns 404 | ✅ Tested | `patch.test.ts` line 382-406 |
| GET /api/product uses correct filter | N/A | Endpoint removed; Server Component uses companyId |

### 3.5 Known Bug
**GET /api/product (legacy endpoint at `app/api/product/route.ts` line 75):**
```ts
const data = await getProducts(userId); // BUG: should be companyId
```
This endpoint filters by `userId` instead of `companyId`, breaking tenant isolation for product listing.

## 4. Input Validation

### 4.1 Validation Layers
1. **Zod Schemas** — Define structure and constraints
2. **API Route Validation** — Parse and validate before service calls
3. **Database Constraints** — CHECK constraints as last line of defense

### 4.2 Product Validation (schemas/product.ts)
| Field | Constraints |
|-------|-------------|
| name | 3-25 characters, required |
| description | max 50 characters, optional |
| quantity | numeric, min 0 |
| images | 1-3 items, exactly 1 primary |

### 4.3 PATCH Validation (app/api/product/[id]/patch-validation.ts)
- At least one field (data or images) must be provided
- Both `existingImages` and `newImages` must be provided together
- Total images (existing + new): 1-5
- Exactly 1 primary across all images
- Existing images must belong to the product
- New image files validated (type, size)

### 4.4 Stock Validation (app/api/stock/route.ts)
| Field | Constraints |
|-------|-------------|
| id | UUID |
| type | enum: IN, OUT |
| quantity | positive number |
| reason | string max 20, nullable, optional |

### 4.5 File Upload Validation
- Allowed types: `image/jpeg`, `image/png`, `image/webp`
- Max size: 5 MB
- Validated in `app/validation/product-image.ts`

### 4.6 Verified Status
| Check | Status | Evidence |
|-------|--------|----------|
| Product create validation | ✅ Tested | `create.product.validation.test.ts` |
| PATCH validation | ✅ Tested | `patch.test.ts` (13 validation tests) |
| Stock validation | ✅ Tested | `add.remove.stock.test.ts` |
| File type/size validation | ✅ Implemented | `product-image.ts` |

## 5. Error Handling

### 5.1 Standard Error Codes
| Code | HTTP | Usage |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Zod/schema validation failures |
| `UNAUTHORIZED` | 401 | No valid session |
| `FORBIDDEN` | 403 | Role/permission denied |
| `NOT_FOUND` | 404 | Resource not found / cross-tenant |
| `CONFLICT` | 409 | Duplicate product name |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected errors |

### 5.2 Error Response Format
```ts
{
  data: null,
  error: {
    code: string,
    message: string
  }
}
```

### 5.3 Helpers (lib/api/response.ts)
- `unauthorizedResponse()` → 401
- `forbiddenResponse()` → 403
- `notFoundResponse(msg)` → 404
- `conflictResponse(msg)` → 409
- `validationErrorResponse(msg)` → 400
- `internalServerErrorResponse()` → 500
- `profileNotFoundResponse()` → 404
- `conflictResponse(msg)` → 409

### 5.4 Custom Error Classes (lib/api/errors.ts)
- `ValidationError` — thrown by validation helpers
- `NotFoundError` — thrown by tenant checks
- `ConflictError` — thrown by duplicate detection
- `InternalServerError` — thrown by missing profile
- `UnauthorizedError` — available
- `ForbiddenError` — available

### 5.5 Verified Status
| Check | Status | Evidence |
|-------|--------|----------|
| Consistent error format | ✅ Implemented | All routes use helpers |
| 401 for unauthenticated | ✅ Tested | Multiple test files |
| 403 for unauthorized role | ✅ Tested | create, patch, stock tests |
| 404 for not found/cross-tenant | ✅ Tested | patch, stock tests |
| 409 for duplicate name | ✅ Tested | create.product.api.test.ts |
| 500 for unexpected errors | ✅ Tested | Multiple test files |

## 6. Security Headers & Configuration

### 6.1 Next.js Configuration
- `next.config.ts` — Standard configuration
- No custom security headers configured

### 6.2 Environment Variables
Required (from `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## 7. Known Security Issues / Limitations

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| GET /api/product wrong tenant filter | HIGH | `app/api/product/route.ts:75` | Uses `userId` instead of `companyId` |
| No DB transaction for stock atomicity | MEDIUM | `app/api/stock/route.ts` | Movement + quantity update not atomic |
| Profile missing throws 500 | MEDIUM | `lib/auth/require-user-context.ts:19` | Should return 404/401 |
| DELETE /api/product/[id] missing | LOW | API surface | Only Server Action exists |
| No rate limiting | LOW | All API routes | No protection against abuse |
| No CSRF protection | LOW | Forms/Server Actions | Next.js provides some via SameSite cookies |
| Password strength | LOW | `auth/register/route.ts` | Only min 6 chars |

## 8. Compliance Notes

- **OWASP Top 10:** Basic protections in place (validation, auth, authz)
- **Data Isolation:** Company-level multi-tenancy implemented
- **Secrets Management:** Environment variables only, no hardcoded secrets
- **Audit Trail:** Inventory movements provide stock change history
- **Image Cleanup:** Cloudinary images deleted on product/image removal

## 9. Evidence References

Key security implementation files:
- `lib/auth/require-user.ts` — Authentication
- `lib/auth/require-user-context.ts` — Authorization + tenant context
- `lib/api/errors.ts` — Custom error classes
- `lib/api/response.ts` — Error response helpers
- `app/api/product/create/route.ts` — Auth + authz + validation
- `app/api/product/[id]/route.ts` — Auth + authz + tenant check
- `app/api/stock/route.ts` — Auth + authz + tenant check
- `schemas/product.ts` — Validation schemas
- `schemas/inventory.ts` — Validation schemas
- `tests/products/create.product.api.test.ts` — Auth/authz tests
- `tests/products/patch.test.ts` — Auth/authz/tenant tests
- `tests/products/api/stock/add.remove.stock.test.ts` — Stock auth tests
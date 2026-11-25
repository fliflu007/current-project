# Architecture — Inventory Management System

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 15 App Router                      │
├─────────────────────────────────────────────────────────────────┤
│  Server Components (RSC)          │  Client Components           │
│  - Pages & Layouts                │  - Interactive UI            │
│  - Data fetching (DB direct)      │  - Forms & Dialogs           │
│  - Server Actions                 │  - Toast notifications       │
├─────────────────────────────────────────────────────────────────┤
│                        API Routes                                 │
│  /api/product/create    /api/product/[id]    /api/stock          │
│  /api/auth/register     /api/image           /api/dev/*          │
├─────────────────────────────────────────────────────────────────┤
│                    Service Layer                                  │
│  services/products.service.ts  services/inventory.service.ts     │
│  services/profiles.service.ts                                      │
├─────────────────────────────────────────────────────────────────┤
│                      Data Access (Drizzle ORM)                   │
│  db/schema.ts  →  PostgreSQL (Supabase)                          │
├─────────────────────────────────────────────────────────────────┤
│                  External Services                                │
│  Supabase Auth          Cloudinary                                │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Request Flow

### API Route Flow
```
Request
  ↓
Authentication (requireUserId)
  ↓
Authorization + Tenant Context (requireUserContext)
  ↓
Input Validation (Zod)
  ↓
Service Layer (business logic)
  ↓
Database (Drizzle ORM)
  ↓
External Services (Cloudinary)
  ↓
Response (standardized format)
```

### Server Action Flow (Delete Product)
```
Client Component
  ↓
Server Action (deleteByIdAction)
  ↓
Authentication + Authorization + Tenant Check
  ↓
Database Transaction (delete product, images, movements)
  ↓
Cloudinary Cleanup
  ↓
Return typed result object
```

## 3. Database Schema (Drizzle ORM)

### Tables

**companies**
- `id` UUID PK
- `name` text NOT NULL
- `createdAt` timestamptz DEFAULT now()

**profiles**
- `id` UUID PK (references auth.users.id)
- `companyId` UUID NOT NULL FK → companies.id
- `role` text NOT NULL CHECK ('admin' | 'staff' | 'viewer')
- `createdAt` timestamptz DEFAULT now()

**products**
- `id` UUID PK
- `companyId` UUID NOT NULL FK → companies.id
- `createdAt` timestamptz DEFAULT now()
- `name` text NOT NULL
- `description` text NULL
- `quantity` numeric NOT NULL DEFAULT 0
- Index: `products_company_id_idx` on companyId
- Unique Index: `products_company_name_unique` on (companyId, name)

**product_images**
- `id` UUID PK
- `productId` UUID NOT NULL FK → products.id
- `url` text NOT NULL
- `publicId` text NOT NULL
- `isPrimary` boolean NOT NULL DEFAULT false
- `createdAt` timestamptz DEFAULT now()
- Unique Partial Index: one primary per product

**inventory_movements**
- `id` UUID PK
- `productId` UUID NOT NULL FK → products.id
- `type` text NOT NULL CHECK ('IN' | 'OUT')
- `createdAt` timestamptz DEFAULT now()
- `quantity` numeric NOT NULL CHECK (quantity > 0)
- `comment` text NULL
- Index: `inventory_movements_product_id_idx` on productId

## 4. Key Design Decisions

### 4.1 Multi-Tenant Data Isolation
- Products belong to a company, not individual users.
- Every product query filters by `companyId` from the authenticated user's profile.
- Cross-company access attempts return `404 NOT_FOUND` (security through obscurity).

### 4.2 Role-Based Access Control
Three roles enforced at API level:
| Role   | Create Product | Edit Product | Delete Product | Stock IN/OUT | View All |
|--------|---------------|--------------|----------------|--------------|----------|
| Admin  | ✓             | ✓            | ✓              | ✓            | ✓        |
| Staff  | ✗             | ✗            | ✗              | ✓            | ✓        |
| Viewer | ✗             | ✗            | ✗              | ✗            | ✓        |

Enforcement: `requireUserContext()` returns role; API routes check before operations.

### 4.3 Product Quantity Management
- Quantity stored directly on `products.quantity` (numeric).
- Stock changes ONLY through inventory movements (IN/OUT).
- PATCH endpoint explicitly excludes quantity from editable fields.
- Initial stock set at creation, does NOT create movement record.
- Subsequent changes create movement records + update product quantity.

### 4.4 Inventory Movement Design
- Movement quantity ALWAYS positive (DB CHECK constraint).
- Type field (`IN` | `OUT`) determines stock effect.
- No database transaction wrapping movement + quantity update (known gap).
- Negative stock allowed by design (OUT can exceed available stock).

### 4.5 Image Management
- Cloudinary for storage, database for metadata.
- Creation: 1–3 images required, exactly 1 primary.
- Editing: Up to 5 images total, exactly 1 primary.
- Cloudinary cleanup on image removal and product deletion.
- Primary image enforced by unique partial index in DB.

### 4.6 API Response Contract
**Success:**
```ts
{ data: T, error: null }
```

**Error:**
```ts
{ data: null, error: { code: string, message: string } }
```

### 4.7 Error Codes
| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request data invalid |
| `UNAUTHORIZED` | 401 | Not authenticated |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Conflicts with existing data |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

## 5. Service Layer

### products.service.ts
- `insertProductDb()` — Insert product with companyId, handles unique constraint conflicts
- `getProducts(companyId)` — List products for company
- `getProductById(id, companyId)` — Single product with tenant check
- `getProductForCompany(id, companyId)` — Tenant check, throws NotFoundError
- `updateProductDetails(id, data)` — Update name/description
- `deleteImageDB(publicId)` — Delete image metadata
- `setPrimaryImageByPublicID(publicId, productId)` — Set primary image
- `addImagesToDB(images, productId)` — Batch insert images
- `getProductImageData(productId)` — Get all images for product

### inventory.service.ts
- `addToInventory(data)` — Insert movement record
- `updateProductQuantity(id, quantity)` — Update product quantity
- `getTransactionsbyProduct(productId, perPage, offset, order, column)` — Paginated history

### profiles.service.ts
- `getCompanyId(userId)` — Get user's companyId

## 6. Authentication & Authorization Helpers

### lib/auth/require-user.ts
- `requireUser()` — Returns Supabase user or 401 Response
- `requireUserId()` — Returns userId string or null
- `requireUserIdCached()` — Cached version for RSC

### lib/auth/require-user-context.ts
- `requireUserContext(userId)` — Returns { companyId, role } or throws InternalServerError
- `requireUserContextCached()` — Cached version

## 7. Validation Schemas (Zod)

### schemas/product.ts
- `createProductDataSchema` — Form data: name (3-25), description (max 50), quantity (min 0)
- `CreateProductSchema` — API: name, description, quantity, images (1-3, 1 primary)
- `patchProductDataApiSchema` — PATCH: partial name/description
- `existingImagesSchema` / `newImagesSchema` — Image metadata validation

### schemas/inventory.ts
- `inventoryInputSchema` — productId, type (IN/OUT), quantity (positive), comment (max 70)

## 8. Frontend Structure

### Key Components
- `app/(dashboard)/page.tsx` — Dashboard with product list
- `app/(dashboard)/products/[id]/page.tsx` — Product detail page (RSC)
- `components/products/product-detail-viewer.tsx` — Detail + history tabs
- `components/products/product-details.tsx` — Product info + actions
- `components/products/stock-movement-dialog.tsx` — Stock IN/OUT dialog
- `components/products/movement-history-table.tsx` — Paginated history table
- `components/products/product-delete-dialog.tsx` — Delete confirmation

### Forms
- React Hook Form + Zod resolvers
- FormData for file uploads (product creation/editing)

## 9. Testing Architecture

### Vitest (Unit/API)
- Mock Supabase, Drizzle, Cloudinary
- Test authentication, authorization, validation, business rules
- Test files: `tests/products/*.test.ts`, `tests/products/api/stock/*.test.ts`

### Playwright (E2E)
- `tests/e2e/create-product.spec.ts` — Full create product flow
- Tests validation, duplicate detection, image upload

## 10. Known Architectural Gaps

| Area | Gap | Impact |
|------|-----|--------|
| Stock Movement Atomicity | No DB transaction wrapping movement insert + quantity update | Potential inconsistency if one succeeds and other fails |
| Product Deletion API | No DELETE /api/product/[id] endpoint; only Server Action | Inconsistent API surface |
| GET /api/product | Endpoint removed; Server Component queries DB directly with companyId | Correct tenant isolation |
| Profile Missing | `requireUserContext` throws 500 if profile not found | Should return 404 or handle gracefully |
| Race Condition | Duplicate product name check + insert not atomic | Theoretical duplicate possible under concurrency |

## 11. File Paths Reference

| Layer | Files |
|-------|-------|
| API Routes | `app/api/product/create/route.ts`, `app/api/product/[id]/route.ts`, `app/api/stock/route.ts`, `app/api/auth/register/route.ts` |
| Server Actions | `app/(dashboard)/products/actions/action.tsx` |
| Services | `services/products.service.ts`, `services/inventory.service.ts`, `services/profiles.service.ts` |
| Auth | `lib/auth/require-user.ts`, `lib/auth/require-user-context.ts` |
| DB | `db/schema.ts`, `db/index.ts` |
| Validation | `schemas/product.ts`, `schemas/inventory.ts`, `app/api/product/create/validation.ts`, `app/api/product/[id]/patch-validation.ts` |
| Response Helpers | `lib/api/response.ts`, `lib/api/errors.ts` |
| Tests | `tests/products/*.test.ts`, `tests/e2e/*.spec.ts` |
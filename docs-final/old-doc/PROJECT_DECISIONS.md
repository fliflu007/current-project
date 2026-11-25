# Project Decisions — Inventory Management System

This document records the business rules and architectural decisions governing the inventory management application.

It describes how the application is intended to behave. It does not automatically confirm that every decision has been implemented or tested.

**Status definitions**

- `CONFIRMED`: The intended behaviour has been agreed upon.
- `IMPLEMENTED`: The behaviour has been checked against the code.
- `NEEDS VERIFICATION`: The decision is known, but the implementation has not yet been checked.

---

## 1. Authentication

**Status: CONFIRMED — Implementation needs verification**

- Supabase Auth is used for user authentication.
- Users must be authenticated before accessing protected application resources.
- The authenticated user's ID identifies their application profile.
- Unauthenticated API requests return `401 UNAUTHORIZED`.

## 2. User Roles and Permissions

**Status: CONFIRMED — Implementation needs verification**

The application supports three roles:

- `admin`
- `staff`
- `viewer`

### Admin

- Can view products and product details.
- Can create products.
- Can edit product names and descriptions.
- Can add, replace, and remove product images.
- Can delete products.
- Can perform stock IN/OUT movements.
- Can view inventory movement history.

### Staff

- Can view products and product details.
- Can view product images.
- Can perform stock IN/OUT movements.
- Can view inventory movement history.
- Cannot create, edit, or delete products.

### Viewer

- Has read-only access.
- Can view products and product details.
- Can view product images and stock quantities.
- Can view inventory movement history.
- Cannot create, edit, or delete products.
- Cannot perform stock IN/OUT movements.

### User Management

- User account management is outside the scope of this project.
- Role assignment is outside the scope of this application.

## 3. Company Data Isolation

**Status: CONFIRMED — Implementation needs verification**

- Products belong to a company, not an individual user.
- Each user profile is associated with a company through `companyId`.
- Users belonging to the same company share access to that company's products.
- Newly created products are visible to other users in the same company.
- Product queries and operations must be restricted to the authenticated user's company.
- Users cannot access products belonging to another company.
- Attempts to access another company's product return `404 NOT_FOUND`.

## 4. Product Management

**Status: CONFIRMED — Implementation needs verification**

- Admins are responsible for product creation, editing, and deletion.
- Product information can be edited through PATCH requests.
- Only `name` and `description` are editable through product editing, apart from images.
- Product quantity cannot be directly edited through product PATCH.
- Stock changes must be performed through inventory movements.

### Product Name Uniqueness

- Product names must be unique within the same company.
- Different companies may have products with the same name.
- Creating a product with an existing name in the same company must be rejected.
- The API returns `409 CONFLICT` when a duplicate name is detected.

## 5. Product Creation and Initial Stock

**Status: CONFIRMED — Implementation needs verification**

- Product creation includes an Initial Stock field.
- Initial stock defaults to `0`.
- Users can enter a different initial quantity.
- Initial stock cannot be negative.
- Initial stock is stored directly in `products.quantity`.
- Creating a product does not create an inventory movement record.
- Subsequent stock changes are recorded through IN/OUT movements.

## 6. Product Images

**Status: CONFIRMED — Implementation needs verification**

- Cloudinary is used for product image storage.
- Product creation accepts between 1 and 3 images.
- Product editing allows a maximum of 5 images.
- Exactly one image must be marked as primary.
- Existing images are represented by metadata, such as their URL and Cloudinary public ID.
- Newly added images are submitted as files.
- All user roles can view product images.
- Only admins can modify product images through product editing.

## 7. Product Editing (PATCH)

**Status: DECISION CONFIRMED — Implementation needs verification**

### Product Data

- PATCH accepts partial product data.
- Only supplied product fields are updated.
- Editable product fields are `name` and `description`.
- Quantity cannot be changed through PATCH.

### Product Images

- Product image updates are handled separately from ordinary product fields.
- If no image changes are submitted, existing images remain untouched.
- When images are modified, the complete intended image collection must be submitted.
- Existing images are represented by metadata.
- Newly added images are submitted as files.
- Exactly one image must be marked as primary.
- The final image collection must be validated before updating.

## 8. Product Deletion

**Status: DECISION CONFIRMED — Implementation needs verification**

- Products are permanently deleted (hard delete).
- Only admins can delete products.
- Associated product images are deleted from Cloudinary.
- Associated inventory movement history is also deleted.
- The application handles associated cleanup as part of the deletion process.
- Database-level cascading deletion is not configured for associated inventory movements.

## 9. Inventory Movements

**Status: CONFIRMED — Implementation needs verification**

- Stock changes are recorded as inventory movements.
- Two movement types are supported:
  - `IN`: increases product quantity.
  - `OUT`: decreases product quantity.
- Movement type is mandatory.
- Movement quantities must be greater than zero.
- Decimal quantities are allowed.
- OUT movements are not restricted by available stock.
- Product quantity can become negative.
- Product quantity is updated when a movement is successfully processed.

## 10. Initial Stock and Movement History

**Status: CONFIRMED — Implementation needs verification**

- Initial stock is stored directly in the product record.
- Initial stock does not generate an inventory movement.
- Subsequent IN/OUT operations generate movement records.
- Movement history is retained while the associated product exists.

## 11. Inventory Movement Comments

**Status: DATABASE SCHEMA CONFIRMED — Form/API behaviour needs verification**

- Movement type (`IN` or `OUT`) is required.
- The database comment field is nullable.
- A movement comment can therefore be stored as `NULL`.
- The movement form provides reasons such as Purchase, Correction, Return, and Other.
- The exact handling of selected reasons and additional comments still needs verification.
- No separate database column for the reason is currently documented.

## 12. Inventory Movement History

**Status: CONFIRMED — Implementation needs verification**

- Once recorded, inventory movements cannot be edited individually.
- Individual movement records cannot be deleted.
- Movement history is read-only for all user roles.
- Movement history is deleted when its associated product is deleted.

## 13. Stock Movement Atomicity

**Status: DECISION CONFIRMED — Implementation needs verification**

- Recording an inventory movement and updating product quantity must succeed or fail together.
- Both database operations should execute within a single transaction.
- If either operation fails, the transaction must roll back.
- This prevents inventory history and product quantity from becoming inconsistent.

## 14. Dashboard and Product Visibility

**Status: CONFIRMED — Implementation needs verification**

- Admins, staff, and viewers can access the main dashboard.
- All roles can view the product list.
- All roles can open product detail pages.
- All roles can view product information, images, current stock quantity, and inventory movement history.
- Available actions depend on the user's assigned role and permissions.

## 15. API Authorization and Security

**Status: CONFIRMED — Implementation needs verification**

- API endpoints enforce role-based permissions independently of the frontend.
- Hiding or disabling frontend actions is not sufficient for security.
- Unauthorized requests must be rejected by the API.
- Users cannot bypass role restrictions by sending requests directly to API endpoints.
- Authentication is checked before company ownership and role permissions.

## 16. API Response Consistency

**Status: DOCUMENTATION DECISION CONFIRMED**

- API endpoints follow the response structure defined in `API_CONTRACT.md`.
- Error codes and messages follow the conventions defined in `API_ERRORS.md`.

---

## Related Documentation

- `PROJECT_OVERVIEW.md` — Project purpose, features, architecture, and scope.
- `IMPLEMENTATION_STATUS.md` — Actual implementation status.
- `TEST_PLAN.md` — Testing scenarios and expected results.
- `NEXT_TASKS.md` — Outstanding development and verification tasks.
- `API_CONTRACT.md` — Standard API response structure.
- `API_ERRORS.md` — API error codes and handling conventions.

# Database Decisions

## IDs

UUIDs are used as primary keys rather than sequential integers.
They provide non-sequential identifiers and work well for Supabase.

## Company Name

Company names are not required to be unique.
Users authenticate using their account credentials, not the company name.

## Profiles

The profile ID uses the same UUID as the Supabase Auth user ID.
This creates a one-to-one relationship between the Auth user and profile.

## Roles

Roles are stored directly on the profile as:

- admin
- staff
- viewer

A separate roles table is not required for V1 because the available roles
are fixed.

## Product Quantity

Product quantity uses numeric rather than integer because future versions
may support fractional inventory such as kilograms or liters.

## Inventory Movement Quantity

Movement quantity is always positive.
The `type` field determines whether the movement is IN or OUT.

This avoids storing negative quantities and keeps the meaning of
the quantity consistent. The application determines the stock effect
based on the movement type.

## Nullable Values

NULL is used when information is genuinely optional.
Defaults are used when the database can provide a meaningful value
automatically.

## Database Constraints

The database enforces fundamental business rules using CHECK constraints.

- `profiles.role` must be `admin`, `staff`, or `viewer`.
- `inventory_movements.type` must be `IN` or `OUT`.
- `inventory_movements.quantity` must be greater than 0.

These rules are enforced at the database level to protect data integrity
even if invalid data bypasses frontend or API validation.

## Indexes

### products.company_id

Indexed because products are frequently retrieved by company.

### inventory_movements.product_id

Indexed because movement history is retrieved by product.

### profiles.company_id

Not indexed in V1 because the expected number of profiles is small.
A sequential scan is sufficient for the current project scale.
The index can be added later if the data size or query patterns change.

## Product Images

Product images are stored in a separate `product_images` table
rather than directly on the `products` table.

A product can have multiple images.

Only one image can be the primary image. The primary image is used
as the main image displayed for the product.

## Stock Quantity

`products.quantity` represents the current stock quantity.

`inventory_movements` stores the history of stock changes.

Movement quantities are always positive. The `type` field determines
whether the movement adds (`IN`) or removes (`OUT`) stock.

## Product Archiving

Products are archived rather than permanently deleted.

An active product has `archived_at` set to NULL.

When a product is archived, `archived_at` is set to the current timestamp.

Archived products are excluded from normal product queries.

Archived products cannot be used for stock operations.

Restoration is not supported in V1.

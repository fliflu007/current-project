# Project Overview — Inventory Management System

## 1. Project Purpose

This project is a web-based inventory management application designed to help companies manage their products and track stock movements.

The application provides a shared inventory workspace where multiple users belonging to the same company can access product information, monitor stock quantities, and consult inventory movement history.

The main objective is to provide a practical, secure, and easy-to-use inventory management system with role-based access control and company-level data isolation.

## 2. Target Users

The application supports three user roles:

- **Admin:** Manages the product catalogue, including creating, editing, and deleting products. Can also manage stock movements.
- **Staff:** Views products and performs stock IN/OUT operations.
- **Viewer:** Has read-only access to products, product details, images, stock quantities, and movement history.

User management and role assignment are outside the scope of this application.

## 3. Main Features

### 3.1 Authentication and Access Control

- User authentication through Supabase Auth.
- Role-based access control.
- Protected application pages and API endpoints.
- Company-level data isolation.
- API-side authorization to prevent unauthorized operations.

### 3.2 Product Management

- Create products (Admin only).
- View product lists and product details (all roles).
- Edit product names and descriptions (Admin only).
- Upload and manage product images (Admin only).
- Set initial stock when creating a product.
- Delete products (Admin only).

Product records belong to a company rather than an individual user. Users within the same company share access to its products, subject to their permissions.

### 3.3 Inventory Management

- Record stock IN movements (Admin, Staff).
- Record stock OUT movements (Admin, Staff).
- Support decimal quantities.
- Allow stock quantities to become negative (by design).
- Update product quantities when movements are recorded.
- Maintain inventory movement history.

Stock quantities are managed through inventory movements rather than direct product editing.

### 3.4 Inventory History

- Record each stock IN/OUT operation.
- Display movement history with pagination, sorting, and filtering.
- Store movement type, quantity, and optional comment/reason.
- Preserve movement history while the associated product exists.
- Remove associated movement history when a product is deleted.

### 3.5 Product Images

- Store product images through Cloudinary.
- Support multiple images per product (1–3 at creation, up to 5 at edit).
- Identify one primary image.
- Manage existing and newly uploaded images during product editing.
- Clean up Cloudinary images on product deletion.

## 4. Technology Stack

| Area                 | Technology            |
| -------------------- | --------------------- |
| Frontend framework   | Next.js 15 (App Router) |
| Programming language | TypeScript            |
| Styling              | Tailwind CSS          |
| UI components        | shadcn/ui             |
| Authentication       | Supabase Auth         |
| Database             | PostgreSQL (Supabase) |
| ORM                  | Drizzle ORM           |
| Validation           | Zod                   |
| Form management      | React Hook Form       |
| Image storage        | Cloudinary            |
| Package manager      | pnpm                  |
| Unit testing         | Vitest                |
| E2E testing          | Playwright            |
| Deployment target    | Vercel                |

## 5. General Architecture

The application follows a full-stack Next.js architecture.

- **Frontend:** Displays the application interface and handles user interactions (Server Components + Client Components).
- **API routes:** Handle requests, validate incoming data, enforce authentication and authorization, and perform application operations.
- **Database:** Stores user profiles, company associations, products, product images, and inventory movements.
- **Authentication:** Supabase Auth manages user authentication.
- **Image storage:** Cloudinary stores product images.

The application uses a shared API response contract to keep successful responses and errors consistent across endpoints.

## 6. Data Model Overview

The main database entities are:

### Profiles
- User ID (FK to Supabase Auth users)
- Company ID (FK to companies)
- Role: `admin` | `staff` | `viewer`

### Products
- Product ID
- Company ID
- Name
- Description
- Quantity (numeric, default 0)

### Product Images
- Image ID
- Product ID
- Image URL
- Cloudinary public ID
- Primary image indicator

### Inventory Movements
- Movement ID
- Product ID
- Movement type: `IN` | `OUT`
- Quantity (positive numeric)
- Optional comment

## 7. Security and Data Isolation

Security is enforced at the API level, not only through frontend visibility.

The main principles are:
- Users must authenticate before accessing protected resources.
- Users can only access data belonging to their associated company.
- Product ownership is checked before product operations.
- Role permissions are checked before protected actions.
- Unauthorized API requests are rejected.
- Access to another company's product returns `404 NOT_FOUND` to avoid exposing its existence.

## 8. Project Scope

### Included
- User authentication via Supabase.
- Three application roles with distinct permissions.
- Company-level data isolation.
- Product CRUD operations with image management.
- Stock IN/OUT operations with movement history.
- Product listing, detail pages, and dashboard.
- API validation and consistent error handling.
- Automated testing (Vitest for API routes, Playwright for E2E).

### Excluded
- User account creation and management within the application.
- Role assignment and administration.
- Company creation and management.
- Advanced accounting or financial management.
- Purchasing and supplier management.
- Sales order management.

## 9. Development Objectives

The project is intended to demonstrate practical full-stack development skills, including:
- Building a complete application with Next.js and TypeScript.
- Designing and querying a relational database.
- Implementing authentication and role-based authorization.
- Handling multi-tenant data isolation.
- Designing and validating API endpoints.
- Managing image uploads and external storage.
- Maintaining data consistency during stock operations.
- Writing automated tests.
- Documenting technical decisions and implementation behaviour.
- Preparing the application for deployment and portfolio presentation.

## 10. Evidence References

Key implementation files:
- `app/api/product/create/route.ts` — Product creation endpoint
- `app/api/product/[id]/route.ts` — Product PATCH endpoint
- `app/api/stock/route.ts` — Stock IN/OUT and history endpoints
- `app/(dashboard)/products/actions/action.tsx` — Delete product Server Action
- `lib/auth/require-user.ts` — Authentication helpers
- `lib/auth/require-user-context.ts` — Authorization + tenant context
- `services/products.service.ts` — Product business logic
- `services/inventory.service.ts` — Inventory business logic
- `db/schema.ts` — Database schema definitions
- `schemas/product.ts` — Zod schemas for product validation
- `schemas/inventory.ts` — Zod schemas for inventory validation
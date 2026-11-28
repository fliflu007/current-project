# Inventory Management System

A full-stack inventory management application built with **Next.js, TypeScript, PostgreSQL, Drizzle ORM, Supabase, Zod, and Vitest**.

The goal of this project is to build a realistic inventory system with product management, authentication, company data isolation, role-based authorization, inventory movements, and image management.

## 🚧 Current Progress

### Completed

- [x] PostgreSQL database setup
- [x] Drizzle ORM configuration and migrations
- [x] Product database schema (including optional barcode with per-company uniqueness)
- [x] Product CRUD API (create, read, update, delete via Server Action)
- [x] Zod request validation
- [x] Product service layer
- [x] API error handling
- [x] Authentication with Supabase Auth
- [x] Role-based authorization (admin/staff/viewer)
- [x] Company/data isolation
- [x] Inventory stock-in / stock-out
- [x] Inventory movement history
- [x] Product image management with Cloudinary
- [x] Frontend dashboard and product management UI
- [x] Barcode scanning and lookup (camera + manual entry)
- [x] Automated tests with Vitest (60 passing) + Playwright (create flow)

### In Progress / Planned

- [x] Production deployment
- [ ] Additional E2E coverage (edit/delete/stock)

## 🛠️ Tech Stack

- **Next.js** — Application framework
- **TypeScript** — Type safety
- **PostgreSQL** — Database
- **Drizzle ORM** — Database queries and schema
- **Supabase** — PostgreSQL hosting and authentication
- **Zod** — Request validation
- **Vitest** — Automated testing
- **Cloudinary** — Product image management
- **Tailwind CSS** — UI styling

## 🏗️ Architecture

The application is structured around a separation between the API routes, validation, services, and database layer.

```text
Client
  ↓
Next.js API Route
  ↓
Zod Validation
  ↓
Service Layer
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

Authentication and authorization are integrated into the API flow to ensure users can only access data belon their company and perform actions permitted by their assigned role.ging t

## 📦 Planned Features

### Product Management

- Create products
- View products
- Update products
- Delete products
- Product descriptions
- Product quantities
- Multiple product images
- Optional barcode (per-company unique)

### Inventory Management

- Stock in
- Stock out
- Inventory movement history
- Movement comments/reasons

### Authentication & Authorization

- User registration and login
- Protected routes
- Company-based data isolation
- Roles:
  - Admin
  - Staff
  - Viewer

## 🧪 Testing

Automated tests use Vitest with mocked database dependencies.

Tests cover:

Successful API operations

Validation failures

Not-found cases

Unexpected errors

Manual testing has also been performed across the application's main features, including product CRUD, authentication, image management, and inventory stock IN/OUT operations.

No Playwright E2E tests or real database integration tests are currently included.

Run automated tests:

pnpm test

## ⚙️ Local Setup

Create these local files:

- `.env.example` — template containing the required environment variables. Safe to commit.
- `.env.local` — Next.js environment variables. Do not commit.
- `.env` — environment variables used by the Drizzle CLI. Do not commit.

Use `.env.example` as the reference for the required variables.

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

## 🎯 Project Goal

This project is being developed as a production-style portfolio application, with an emphasis on **API architecture, database design, validation, authentication, authorization, testing, and real-world business rules** rather than only building a visual interface.

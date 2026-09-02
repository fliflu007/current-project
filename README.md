# Inventory Management System

A full-stack inventory management application built with **Next.js, TypeScript, PostgreSQL, Drizzle ORM, Supabase, Zod, and Vitest**.

The goal of this project is to build a realistic inventory system with product management, authentication, company data isolation, role-based authorization, inventory movements, and image management.

## 🚧 Current Progress

### Completed

- [x] PostgreSQL database setup
- [x] Drizzle ORM configuration and migrations
- [x] Product database schema
- [x] Product CRUD API
- [x] Zod request validation
- [x] Product service layer
- [x] API error handling
- [x] Mock/API tests with Vitest
- [x] Integration tests with the database

### In Progress / Planned

- [ ] Product deletion
- [ ] Authentication with Supabase Auth
- [ ] Role-based authorization
- [ ] Company/data isolation
- [ ] Inventory stock-in / stock-out
- [ ] Inventory movement history
- [ ] Product image management with Cloudinary
- [ ] Frontend dashboard and product management UI
- [ ] Production deployment

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

Authentication and authorization will later be integrated into the API flow to ensure users can only access data belonging to their company and can only perform actions allowed by their role.

## 📦 Planned Features

### Product Management

- Create products
- View products
- Update products
- Delete products
- Product descriptions
- Product quantities
- Multiple product images

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

The API is being tested as features are implemented.

Tests currently include:

- Successful API operations
- Validation failures
- Not-found cases
- Unexpected errors
- Integration tests against the database

The project uses both **mocked API tests** and **integration tests** to verify different parts of the application.

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

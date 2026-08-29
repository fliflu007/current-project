import {
  pgTable,
  uuid,
  text,
  timestamp,
  check,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),

    role: text("role").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    check(
      "profiles_role_check",
      sql`${table.role} IN ('admin', 'staff', 'viewer')`,
    ),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    name: text("name").notNull(),

    description: text("description"),

    quantity: numeric("quantity").default("0").notNull(),
  },
  (table) => [index("products_company_id_idx").on(table.companyId)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    url: text("url").notNull(),

    isPrimary: boolean("is_primary").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("product_images_one_primary_idx")
      .on(table.productId)
      .where(sql`${table.isPrimary} = true`),
  ],
);

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),

    type: text("type").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    quantity: numeric("quantity").notNull(),

    comment: text("comment"),
  },
  (table) => [
    index("inventory_movements_product_id_idx").on(table.productId),

    check(
      "inventory_movements_type_check",
      sql`${table.type} IN ('IN', 'OUT')`,
    ),

    check("inventory_movements_quantity_check", sql`${table.quantity} > 0`),
  ],
);

ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_products_id_fk";
--> statement-breakpoint
DROP INDEX "inventory_movements_product_id_idx";--> statement-breakpoint
DROP INDEX "product_images_one_primary_idx";--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "productId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "productId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "inventory_movements_product_id_idx" ON "inventory_movements" USING btree ("productId");--> statement-breakpoint
CREATE UNIQUE INDEX "product_images_one_primary_idx" ON "product_images" USING btree ("productId") WHERE "product_images"."is_primary" = true;--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "product_images" DROP COLUMN "product_id";
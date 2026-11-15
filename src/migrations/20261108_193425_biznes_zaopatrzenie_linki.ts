import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_biznes_procurement_industry_tiles_page" AS ENUM('agd', 'it');
  CREATE TABLE "site_settings_biznes_procurement_industry_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry" varchar,
  	"page" "enum_site_settings_biznes_procurement_industry_tiles_page",
  	"title" varchar,
  	"text" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "biznes_procurement_category_band" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_procurement_category_band_cta" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_procurement_product_link" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_procurement_scale_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_procurement_scale_text" varchar;
  ALTER TABLE "site_settings_biznes_procurement_industry_tiles" ADD CONSTRAINT "site_settings_biznes_procurement_industry_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_biznes_procurement_industry_tiles_order_idx" ON "site_settings_biznes_procurement_industry_tiles" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_procurement_industry_tiles_parent_id_idx" ON "site_settings_biznes_procurement_industry_tiles" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_biznes_procurement_industry_tiles" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "biznes_procurement_category_band";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_procurement_category_band_cta";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_procurement_product_link";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_procurement_scale_title";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_procurement_scale_text";
  DROP TYPE "public"."enum_site_settings_biznes_procurement_industry_tiles_page";`)
}

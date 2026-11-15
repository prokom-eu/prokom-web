import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_featured_group" AS ENUM('kasy-platnosci', 'komputery-telefony', 'programy-ochrona', 'zasilanie');
  CREATE TYPE "public"."enum__products_v_version_featured_group" AS ENUM('kasy-platnosci', 'komputery-telefony', 'programy-ochrona', 'zasilanie');
  ALTER TYPE "public"."enum_partners_partner_status" ADD VALUE 'partner';
  ALTER TYPE "public"."enum_partners_partner_status" ADD VALUE 'cooperation';
  CREATE TABLE "biznes_settings_brands_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon_path" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "biznes_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"partners_id" integer
  );
  
  CREATE TABLE "showrooms_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "showrooms_hero_card_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "showrooms_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "showrooms_plans_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"audience" varchar,
  	"product_id" integer,
  	"tag" varchar,
  	"alt" boolean DEFAULT false
  );
  
  CREATE TABLE "showrooms_more_plans_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"audience" varchar,
  	"product_id" integer,
  	"tag" varchar,
  	"alt" boolean DEFAULT false
  );
  
  CREATE TABLE "showrooms_compare_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "showrooms_family" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon_path" varchar
  );
  
  CREATE TABLE "showrooms_chooser_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"why" varchar
  );
  
  CREATE TABLE "showrooms_service_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "showrooms_rollout_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "showrooms_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "showrooms_brand_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"source_url" varchar
  );
  
  CREATE TABLE "showrooms_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "showrooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"pill" varchar,
  	"pill_mobile" varchar,
  	"h1a" varchar NOT NULL,
  	"h1b" varchar,
  	"lead" varchar,
  	"hero_card_title" varchar,
  	"plans_eyebrow" varchar,
  	"plans_title" varchar,
  	"plans_big" boolean DEFAULT false,
  	"plans_lead" varchar,
  	"plans_alt_title" varchar,
  	"more_plans_eyebrow" varchar,
  	"more_plans_title" varchar,
  	"more_plans_big" boolean DEFAULT false,
  	"more_plans_lead" varchar,
  	"more_plans_alt_title" varchar,
  	"compare_title" varchar,
  	"chooser_question" varchar,
  	"service_title" varchar,
  	"service_description" varchar,
  	"rollout_title" varchar,
  	"rollout_description" varchar,
  	"rollout_button" varchar,
  	"rollout_button_href" varchar,
  	"headings_faq" varchar,
  	"headings_facts" varchar,
  	"headings_offer" varchar,
  	"headings_more" varchar,
  	"headings_ask" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "showrooms_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "showrooms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"partners_id" integer,
  	"products_id" integer
  );
  
  ALTER TABLE "catalog_groups_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "products" ADD COLUMN "featured_group" "enum_products_featured_group";
  ALTER TABLE "products" ADD COLUMN "category_order" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_featured_group" "enum__products_v_version_featured_group";
  ALTER TABLE "_products_v" ADD COLUMN "version_category_order" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "showrooms_id" integer;
  ALTER TABLE "biznes_settings_brands_groups" ADD CONSTRAINT "biznes_settings_brands_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "biznes_settings_rels" ADD CONSTRAINT "biznes_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "biznes_settings_rels" ADD CONSTRAINT "biznes_settings_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_hero" ADD CONSTRAINT "showrooms_hero_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "showrooms_hero" ADD CONSTRAINT "showrooms_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_hero_card_items" ADD CONSTRAINT "showrooms_hero_card_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_facts" ADD CONSTRAINT "showrooms_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_plans_items" ADD CONSTRAINT "showrooms_plans_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "showrooms_plans_items" ADD CONSTRAINT "showrooms_plans_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_more_plans_items" ADD CONSTRAINT "showrooms_more_plans_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "showrooms_more_plans_items" ADD CONSTRAINT "showrooms_more_plans_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_compare_rows" ADD CONSTRAINT "showrooms_compare_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_family" ADD CONSTRAINT "showrooms_family_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_chooser_options" ADD CONSTRAINT "showrooms_chooser_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_service_items" ADD CONSTRAINT "showrooms_service_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_rollout_steps" ADD CONSTRAINT "showrooms_rollout_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_about" ADD CONSTRAINT "showrooms_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_brand_facts" ADD CONSTRAINT "showrooms_brand_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_faq" ADD CONSTRAINT "showrooms_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms" ADD CONSTRAINT "showrooms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "showrooms_texts" ADD CONSTRAINT "showrooms_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_rels" ADD CONSTRAINT "showrooms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_rels" ADD CONSTRAINT "showrooms_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "showrooms_rels" ADD CONSTRAINT "showrooms_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "biznes_settings_brands_groups_order_idx" ON "biznes_settings_brands_groups" USING btree ("_order");
  CREATE INDEX "biznes_settings_brands_groups_parent_id_idx" ON "biznes_settings_brands_groups" USING btree ("_parent_id");
  CREATE INDEX "biznes_settings_rels_order_idx" ON "biznes_settings_rels" USING btree ("order");
  CREATE INDEX "biznes_settings_rels_parent_idx" ON "biznes_settings_rels" USING btree ("parent_id");
  CREATE INDEX "biznes_settings_rels_path_idx" ON "biznes_settings_rels" USING btree ("path");
  CREATE INDEX "biznes_settings_rels_partners_id_idx" ON "biznes_settings_rels" USING btree ("partners_id");
  CREATE INDEX "showrooms_hero_order_idx" ON "showrooms_hero" USING btree ("_order");
  CREATE INDEX "showrooms_hero_parent_id_idx" ON "showrooms_hero" USING btree ("_parent_id");
  CREATE INDEX "showrooms_hero_product_idx" ON "showrooms_hero" USING btree ("product_id");
  CREATE INDEX "showrooms_hero_card_items_order_idx" ON "showrooms_hero_card_items" USING btree ("_order");
  CREATE INDEX "showrooms_hero_card_items_parent_id_idx" ON "showrooms_hero_card_items" USING btree ("_parent_id");
  CREATE INDEX "showrooms_facts_order_idx" ON "showrooms_facts" USING btree ("_order");
  CREATE INDEX "showrooms_facts_parent_id_idx" ON "showrooms_facts" USING btree ("_parent_id");
  CREATE INDEX "showrooms_plans_items_order_idx" ON "showrooms_plans_items" USING btree ("_order");
  CREATE INDEX "showrooms_plans_items_parent_id_idx" ON "showrooms_plans_items" USING btree ("_parent_id");
  CREATE INDEX "showrooms_plans_items_product_idx" ON "showrooms_plans_items" USING btree ("product_id");
  CREATE INDEX "showrooms_more_plans_items_order_idx" ON "showrooms_more_plans_items" USING btree ("_order");
  CREATE INDEX "showrooms_more_plans_items_parent_id_idx" ON "showrooms_more_plans_items" USING btree ("_parent_id");
  CREATE INDEX "showrooms_more_plans_items_product_idx" ON "showrooms_more_plans_items" USING btree ("product_id");
  CREATE INDEX "showrooms_compare_rows_order_idx" ON "showrooms_compare_rows" USING btree ("_order");
  CREATE INDEX "showrooms_compare_rows_parent_id_idx" ON "showrooms_compare_rows" USING btree ("_parent_id");
  CREATE INDEX "showrooms_family_order_idx" ON "showrooms_family" USING btree ("_order");
  CREATE INDEX "showrooms_family_parent_id_idx" ON "showrooms_family" USING btree ("_parent_id");
  CREATE INDEX "showrooms_chooser_options_order_idx" ON "showrooms_chooser_options" USING btree ("_order");
  CREATE INDEX "showrooms_chooser_options_parent_id_idx" ON "showrooms_chooser_options" USING btree ("_parent_id");
  CREATE INDEX "showrooms_service_items_order_idx" ON "showrooms_service_items" USING btree ("_order");
  CREATE INDEX "showrooms_service_items_parent_id_idx" ON "showrooms_service_items" USING btree ("_parent_id");
  CREATE INDEX "showrooms_rollout_steps_order_idx" ON "showrooms_rollout_steps" USING btree ("_order");
  CREATE INDEX "showrooms_rollout_steps_parent_id_idx" ON "showrooms_rollout_steps" USING btree ("_parent_id");
  CREATE INDEX "showrooms_about_order_idx" ON "showrooms_about" USING btree ("_order");
  CREATE INDEX "showrooms_about_parent_id_idx" ON "showrooms_about" USING btree ("_parent_id");
  CREATE INDEX "showrooms_brand_facts_order_idx" ON "showrooms_brand_facts" USING btree ("_order");
  CREATE INDEX "showrooms_brand_facts_parent_id_idx" ON "showrooms_brand_facts" USING btree ("_parent_id");
  CREATE INDEX "showrooms_faq_order_idx" ON "showrooms_faq" USING btree ("_order");
  CREATE INDEX "showrooms_faq_parent_id_idx" ON "showrooms_faq" USING btree ("_parent_id");
  CREATE INDEX "showrooms_tenant_idx" ON "showrooms" USING btree ("tenant_id");
  CREATE INDEX "showrooms_updated_at_idx" ON "showrooms" USING btree ("updated_at");
  CREATE INDEX "showrooms_created_at_idx" ON "showrooms" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_12_idx" ON "showrooms" USING btree ("tenant_id","slug");
  CREATE INDEX "showrooms_texts_order_parent" ON "showrooms_texts" USING btree ("order","parent_id");
  CREATE INDEX "showrooms_rels_order_idx" ON "showrooms_rels" USING btree ("order");
  CREATE INDEX "showrooms_rels_parent_idx" ON "showrooms_rels" USING btree ("parent_id");
  CREATE INDEX "showrooms_rels_path_idx" ON "showrooms_rels" USING btree ("path");
  CREATE INDEX "showrooms_rels_partners_id_idx" ON "showrooms_rels" USING btree ("partners_id");
  CREATE INDEX "showrooms_rels_products_id_idx" ON "showrooms_rels" USING btree ("products_id");
  ALTER TABLE "catalog_groups_rels" ADD CONSTRAINT "catalog_groups_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_showrooms_fk" FOREIGN KEY ("showrooms_id") REFERENCES "public"."showrooms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "catalog_groups_rels_products_id_idx" ON "catalog_groups_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_showrooms_id_idx" ON "payload_locked_documents_rels" USING btree ("showrooms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "biznes_settings_brands_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "biznes_settings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_hero_card_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_plans_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_more_plans_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_compare_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_family" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_chooser_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_service_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_rollout_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_brand_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "showrooms_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "biznes_settings_brands_groups" CASCADE;
  DROP TABLE "biznes_settings_rels" CASCADE;
  DROP TABLE "showrooms_hero" CASCADE;
  DROP TABLE "showrooms_hero_card_items" CASCADE;
  DROP TABLE "showrooms_facts" CASCADE;
  DROP TABLE "showrooms_plans_items" CASCADE;
  DROP TABLE "showrooms_more_plans_items" CASCADE;
  DROP TABLE "showrooms_compare_rows" CASCADE;
  DROP TABLE "showrooms_family" CASCADE;
  DROP TABLE "showrooms_chooser_options" CASCADE;
  DROP TABLE "showrooms_service_items" CASCADE;
  DROP TABLE "showrooms_rollout_steps" CASCADE;
  DROP TABLE "showrooms_about" CASCADE;
  DROP TABLE "showrooms_brand_facts" CASCADE;
  DROP TABLE "showrooms_faq" CASCADE;
  DROP TABLE "showrooms" CASCADE;
  DROP TABLE "showrooms_texts" CASCADE;
  DROP TABLE "showrooms_rels" CASCADE;
  -- Hand-written: rows of the dropped product relations would stay behind with no target.
  DELETE FROM "catalog_groups_rels" WHERE "products_id" IS NOT NULL;
  ALTER TABLE "catalog_groups_rels" DROP CONSTRAINT "catalog_groups_rels_products_fk";
  
  -- Hand-written: IF EXISTS — DROP TABLE "showrooms" CASCADE above already removed it.
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_showrooms_fk";
  
  -- Hand-written: K4 statuses have no value in the old type (Optivendi, COMEX → no status).
  UPDATE "partners" SET "partner_status" = 'none' WHERE "partner_status" IN ('partner', 'cooperation');
  ALTER TABLE "partners" ALTER COLUMN "partner_status" SET DATA TYPE text;
  ALTER TABLE "partners" ALTER COLUMN "partner_status" SET DEFAULT 'none'::text;
  DROP TYPE "public"."enum_partners_partner_status";
  CREATE TYPE "public"."enum_partners_partner_status" AS ENUM('none', 'authorized-service', 'authorized-partner');
  ALTER TABLE "partners" ALTER COLUMN "partner_status" SET DEFAULT 'none'::"public"."enum_partners_partner_status";
  ALTER TABLE "partners" ALTER COLUMN "partner_status" SET DATA TYPE "public"."enum_partners_partner_status" USING "partner_status"::"public"."enum_partners_partner_status";
  DROP INDEX "catalog_groups_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_showrooms_id_idx";
  ALTER TABLE "catalog_groups_rels" DROP COLUMN "products_id";
  ALTER TABLE "products" DROP COLUMN "featured_group";
  ALTER TABLE "products" DROP COLUMN "category_order";
  ALTER TABLE "_products_v" DROP COLUMN "version_featured_group";
  ALTER TABLE "_products_v" DROP COLUMN "version_category_order";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "showrooms_id";
  DROP TYPE "public"."enum_products_featured_group";
  DROP TYPE "public"."enum__products_v_version_featured_group";`)
}

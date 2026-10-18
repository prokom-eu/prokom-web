import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_biznes_contact_channels_department" AS ENUM('it-care', 'fiscal', 'software', 'hardware', 'funding');
  CREATE TYPE "public"."enum_site_settings_line" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  CREATE TYPE "public"."enum_inquiries_type" AS ENUM('contact', 'list', 'wizard', 'search');
  CREATE TYPE "public"."enum_inquiries_preferred_contact" AS ENUM('phone', 'email', 'any');
  CREATE TYPE "public"."enum_company_data_promo_bar_lines" AS ENUM('prokom', 'biznes', 'instalacje', 'software');
  CREATE TABLE "site_settings_biznes_contact_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"department" "enum_site_settings_biznes_contact_channels_department",
  	"phone" varchar,
  	"email" varchar,
  	"hours" varchar,
  	"show_in_footer" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "inquiries_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"name_snapshot" varchar NOT NULL,
  	"quantity" numeric NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "inquiries_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "biznes_settings_search_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phrase" varchar NOT NULL
  );
  
  CREATE TABLE "biznes_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"wizard" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "biznes_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "company_data_promo_bar_lines" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_company_data_promo_bar_lines",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "line" "enum_site_settings_line";
  ALTER TABLE "site_settings" ADD COLUMN "biznes_whatsapp" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_trust_line" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_promises_callback_time" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_promises_it_review" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_promises_included_with_register" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_promises_service_takeover" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_show_reviews" boolean DEFAULT false;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_show_client_logos" boolean DEFAULT false;
  ALTER TABLE "inquiries" ADD COLUMN "number" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "type" "enum_inquiries_type" DEFAULT 'contact' NOT NULL;
  ALTER TABLE "inquiries" ADD COLUMN "preferred_contact" "enum_inquiries_preferred_contact";
  ALTER TABLE "inquiries" ADD COLUMN "deadline" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "wizard" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "biznes_settings_id" integer;
  ALTER TABLE "company_data" ADD COLUMN "promo_bar_campaign_id" varchar;
  ALTER TABLE "site_settings_biznes_contact_channels" ADD CONSTRAINT "site_settings_biznes_contact_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_texts" ADD CONSTRAINT "site_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_items" ADD CONSTRAINT "inquiries_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries_items" ADD CONSTRAINT "inquiries_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inquiries_texts" ADD CONSTRAINT "inquiries_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "biznes_settings_search_synonyms" ADD CONSTRAINT "biznes_settings_search_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "biznes_settings" ADD CONSTRAINT "biznes_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "biznes_settings_texts" ADD CONSTRAINT "biznes_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_promo_bar_lines" ADD CONSTRAINT "company_data_promo_bar_lines_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_biznes_contact_channels_order_idx" ON "site_settings_biznes_contact_channels" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_contact_channels_parent_id_idx" ON "site_settings_biznes_contact_channels" USING btree ("_parent_id");
  CREATE INDEX "site_settings_texts_order_parent" ON "site_settings_texts" USING btree ("order","parent_id");
  CREATE INDEX "inquiries_items_order_idx" ON "inquiries_items" USING btree ("_order");
  CREATE INDEX "inquiries_items_parent_id_idx" ON "inquiries_items" USING btree ("_parent_id");
  CREATE INDEX "inquiries_items_product_idx" ON "inquiries_items" USING btree ("product_id");
  CREATE INDEX "inquiries_texts_order_parent" ON "inquiries_texts" USING btree ("order","parent_id");
  CREATE INDEX "biznes_settings_search_synonyms_order_idx" ON "biznes_settings_search_synonyms" USING btree ("_order");
  CREATE INDEX "biznes_settings_search_synonyms_parent_id_idx" ON "biznes_settings_search_synonyms" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "biznes_settings_tenant_idx" ON "biznes_settings" USING btree ("tenant_id");
  CREATE INDEX "biznes_settings_updated_at_idx" ON "biznes_settings" USING btree ("updated_at");
  CREATE INDEX "biznes_settings_created_at_idx" ON "biznes_settings" USING btree ("created_at");
  CREATE INDEX "biznes_settings_texts_order_parent" ON "biznes_settings_texts" USING btree ("order","parent_id");
  CREATE INDEX "company_data_promo_bar_lines_order_idx" ON "company_data_promo_bar_lines" USING btree ("order");
  CREATE INDEX "company_data_promo_bar_lines_parent_idx" ON "company_data_promo_bar_lines" USING btree ("parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_biznes_settings_fk" FOREIGN KEY ("biznes_settings_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "inquiries_number_idx" ON "inquiries" USING btree ("number");
  CREATE INDEX "inquiries_type_idx" ON "inquiries" USING btree ("type");
  CREATE INDEX "payload_locked_documents_rels_biznes_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("biznes_settings_id");

  -- Hand-written (B1b): rows saved before this migration.
  -- The hidden copy of the tenant's line (SiteSettings hook sets it on every later save).
  UPDATE "site_settings" SET "line" = "tenants"."line"::text::"enum_site_settings_line"
    FROM "tenants" WHERE "site_settings"."tenant_id" = "tenants"."id";
  -- Inquiry numbers as \`lib/inquiry/number.ts\` builds them (year in Polish time).
  UPDATE "inquiries" SET "number" =
    (CASE "line" WHEN 'biznes' THEN 'PKB' WHEN 'instalacje' THEN 'PKI'
      WHEN 'software' THEN 'PKS' ELSE 'PK' END)
    || '-' || to_char("created_at" AT TIME ZONE 'Europe/Warsaw', 'YYYY')
    || '-' || lpad("id"::text, greatest(4, length("id"::text)), '0')
    WHERE "number" IS NULL;
`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_biznes_contact_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inquiries_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "biznes_settings_search_synonyms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "biznes_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "biznes_settings_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data_promo_bar_lines" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_biznes_contact_channels" CASCADE;
  DROP TABLE "site_settings_texts" CASCADE;
  DROP TABLE "inquiries_items" CASCADE;
  DROP TABLE "inquiries_texts" CASCADE;
  DROP TABLE "biznes_settings_search_synonyms" CASCADE;
  DROP TABLE "biznes_settings" CASCADE;
  DROP TABLE "biznes_settings_texts" CASCADE;
  DROP TABLE "company_data_promo_bar_lines" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_biznes_settings_fk";
  
  DROP INDEX "inquiries_number_idx";
  DROP INDEX "inquiries_type_idx";
  DROP INDEX "payload_locked_documents_rels_biznes_settings_id_idx";
  ALTER TABLE "site_settings" DROP COLUMN "line";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_whatsapp";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_trust_line";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_promises_callback_time";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_promises_it_review";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_promises_included_with_register";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_promises_service_takeover";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_show_reviews";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_show_client_logos";
  ALTER TABLE "inquiries" DROP COLUMN "number";
  ALTER TABLE "inquiries" DROP COLUMN "type";
  ALTER TABLE "inquiries" DROP COLUMN "preferred_contact";
  ALTER TABLE "inquiries" DROP COLUMN "deadline";
  ALTER TABLE "inquiries" DROP COLUMN "wizard";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "biznes_settings_id";
  ALTER TABLE "company_data" DROP COLUMN "promo_bar_campaign_id";
  DROP TYPE "public"."enum_site_settings_biznes_contact_channels_department";
  DROP TYPE "public"."enum_site_settings_line";
  DROP TYPE "public"."enum_inquiries_type";
  DROP TYPE "public"."enum_inquiries_preferred_contact";
  DROP TYPE "public"."enum_company_data_promo_bar_lines";`)
}

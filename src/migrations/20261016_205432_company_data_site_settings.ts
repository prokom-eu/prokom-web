import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_company_data_locations_hours_days" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
  CREATE TABLE "site_settings_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"phone" varchar,
  	"email" varchar,
  	"footer_text" varchar,
  	"seo_title_template" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "company_data_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"number" varchar NOT NULL
  );
  
  CREATE TABLE "company_data_locations_hours_days" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_company_data_locations_hours_days",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "company_data_locations_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"opens" varchar NOT NULL,
  	"closes" varchar NOT NULL
  );
  
  CREATE TABLE "company_data_locations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"street" varchar NOT NULL,
  	"postal_code" varchar NOT NULL,
  	"city" varchar NOT NULL
  );
  
  CREATE TABLE "company_data" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"nip" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"promo_bar_text" varchar,
  	"promo_bar_href" varchar,
  	"promo_bar_starts_at" timestamp(3) with time zone,
  	"promo_bar_ends_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "site_settings_id" integer;
  ALTER TABLE "site_settings_navigation" ADD CONSTRAINT "site_settings_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_footer_links" ADD CONSTRAINT "site_settings_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "company_data_phones" ADD CONSTRAINT "company_data_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_locations_hours_days" ADD CONSTRAINT "company_data_locations_hours_days_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."company_data_locations_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_locations_hours" ADD CONSTRAINT "company_data_locations_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data_locations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_locations" ADD CONSTRAINT "company_data_locations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_navigation_order_idx" ON "site_settings_navigation" USING btree ("_order");
  CREATE INDEX "site_settings_navigation_parent_id_idx" ON "site_settings_navigation" USING btree ("_parent_id");
  CREATE INDEX "site_settings_footer_links_order_idx" ON "site_settings_footer_links" USING btree ("_order");
  CREATE INDEX "site_settings_footer_links_parent_id_idx" ON "site_settings_footer_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "site_settings_tenant_idx" ON "site_settings" USING btree ("tenant_id");
  CREATE INDEX "site_settings_updated_at_idx" ON "site_settings" USING btree ("updated_at");
  CREATE INDEX "site_settings_created_at_idx" ON "site_settings" USING btree ("created_at");
  CREATE INDEX "company_data_phones_order_idx" ON "company_data_phones" USING btree ("_order");
  CREATE INDEX "company_data_phones_parent_id_idx" ON "company_data_phones" USING btree ("_parent_id");
  CREATE INDEX "company_data_locations_hours_days_order_idx" ON "company_data_locations_hours_days" USING btree ("order");
  CREATE INDEX "company_data_locations_hours_days_parent_idx" ON "company_data_locations_hours_days" USING btree ("parent_id");
  CREATE INDEX "company_data_locations_hours_order_idx" ON "company_data_locations_hours" USING btree ("_order");
  CREATE INDEX "company_data_locations_hours_parent_id_idx" ON "company_data_locations_hours" USING btree ("_parent_id");
  CREATE INDEX "company_data_locations_order_idx" ON "company_data_locations" USING btree ("_order");
  CREATE INDEX "company_data_locations_parent_id_idx" ON "company_data_locations" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_settings_fk" FOREIGN KEY ("site_settings_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_site_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("site_settings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_footer_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data_phones" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data_locations_hours_days" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data_locations_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data_locations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "company_data" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_navigation" CASCADE;
  DROP TABLE "site_settings_footer_links" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "company_data_phones" CASCADE;
  DROP TABLE "company_data_locations_hours_days" CASCADE;
  DROP TABLE "company_data_locations_hours" CASCADE;
  DROP TABLE "company_data_locations" CASCADE;
  DROP TABLE "company_data" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_site_settings_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_site_settings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "site_settings_id";
  DROP TYPE "public"."enum_company_data_locations_hours_days";`)
}

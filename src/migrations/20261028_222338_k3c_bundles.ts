import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_bundles_content_status" AS ENUM('ready', 'needs-review');
  CREATE TYPE "public"."enum_bundles_area" AS ENUM('sklep', 'gastronomia', 'noclegi', 'biuro', 'gabinet', 'szkola', 'siec', 'ekrany');
  CREATE TABLE "floor_plans_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"bundles_id" integer
  );
  
  CREATE TABLE "bundles_description" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "bundles_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"role" varchar NOT NULL,
  	"quantity" varchar DEFAULT '1' NOT NULL,
  	"mandatory" boolean DEFAULT true,
  	"suggested_version" varchar,
  	"to_confirm" varchar
  );
  
  CREATE TABLE "bundles_swaps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from_id" integer,
  	"to_id" integer,
  	"when" varchar NOT NULL
  );
  
  CREATE TABLE "bundles_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "bundles_compat_checks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pair" varchar NOT NULL,
  	"source" varchar,
  	"status" varchar
  );
  
  CREATE TABLE "bundles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"content_status" "enum_bundles_content_status" DEFAULT 'needs-review' NOT NULL,
  	"name" varchar NOT NULL,
  	"area" "enum_bundles_area" NOT NULL,
  	"series" varchar NOT NULL,
  	"level" varchar,
  	"audience" varchar NOT NULL,
  	"benefit" varchar NOT NULL,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bundles_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "bundles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"industries_id" integer,
  	"products_id" integer,
  	"catalog_categories_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bundles_id" integer;
  ALTER TABLE "floor_plans_rels" ADD CONSTRAINT "floor_plans_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."floor_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "floor_plans_rels" ADD CONSTRAINT "floor_plans_rels_bundles_fk" FOREIGN KEY ("bundles_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_description" ADD CONSTRAINT "bundles_description_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_items" ADD CONSTRAINT "bundles_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles_items" ADD CONSTRAINT "bundles_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_swaps" ADD CONSTRAINT "bundles_swaps_from_id_products_id_fk" FOREIGN KEY ("from_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles_swaps" ADD CONSTRAINT "bundles_swaps_to_id_products_id_fk" FOREIGN KEY ("to_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles_swaps" ADD CONSTRAINT "bundles_swaps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_faq" ADD CONSTRAINT "bundles_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_compat_checks" ADD CONSTRAINT "bundles_compat_checks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles" ADD CONSTRAINT "bundles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "bundles_texts" ADD CONSTRAINT "bundles_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_rels" ADD CONSTRAINT "bundles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_rels" ADD CONSTRAINT "bundles_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_rels" ADD CONSTRAINT "bundles_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bundles_rels" ADD CONSTRAINT "bundles_rels_catalog_categories_fk" FOREIGN KEY ("catalog_categories_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "floor_plans_rels_order_idx" ON "floor_plans_rels" USING btree ("order");
  CREATE INDEX "floor_plans_rels_parent_idx" ON "floor_plans_rels" USING btree ("parent_id");
  CREATE INDEX "floor_plans_rels_path_idx" ON "floor_plans_rels" USING btree ("path");
  CREATE INDEX "floor_plans_rels_bundles_id_idx" ON "floor_plans_rels" USING btree ("bundles_id");
  CREATE INDEX "bundles_description_order_idx" ON "bundles_description" USING btree ("_order");
  CREATE INDEX "bundles_description_parent_id_idx" ON "bundles_description" USING btree ("_parent_id");
  CREATE INDEX "bundles_items_order_idx" ON "bundles_items" USING btree ("_order");
  CREATE INDEX "bundles_items_parent_id_idx" ON "bundles_items" USING btree ("_parent_id");
  CREATE INDEX "bundles_items_product_idx" ON "bundles_items" USING btree ("product_id");
  CREATE INDEX "bundles_swaps_order_idx" ON "bundles_swaps" USING btree ("_order");
  CREATE INDEX "bundles_swaps_parent_id_idx" ON "bundles_swaps" USING btree ("_parent_id");
  CREATE INDEX "bundles_swaps_from_idx" ON "bundles_swaps" USING btree ("from_id");
  CREATE INDEX "bundles_swaps_to_idx" ON "bundles_swaps" USING btree ("to_id");
  CREATE INDEX "bundles_faq_order_idx" ON "bundles_faq" USING btree ("_order");
  CREATE INDEX "bundles_faq_parent_id_idx" ON "bundles_faq" USING btree ("_parent_id");
  CREATE INDEX "bundles_compat_checks_order_idx" ON "bundles_compat_checks" USING btree ("_order");
  CREATE INDEX "bundles_compat_checks_parent_id_idx" ON "bundles_compat_checks" USING btree ("_parent_id");
  CREATE INDEX "bundles_tenant_idx" ON "bundles" USING btree ("tenant_id");
  CREATE INDEX "bundles_updated_at_idx" ON "bundles" USING btree ("updated_at");
  CREATE INDEX "bundles_created_at_idx" ON "bundles" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_11_idx" ON "bundles" USING btree ("tenant_id","slug");
  CREATE INDEX "bundles_texts_order_parent" ON "bundles_texts" USING btree ("order","parent_id");
  CREATE INDEX "bundles_rels_order_idx" ON "bundles_rels" USING btree ("order");
  CREATE INDEX "bundles_rels_parent_idx" ON "bundles_rels" USING btree ("parent_id");
  CREATE INDEX "bundles_rels_path_idx" ON "bundles_rels" USING btree ("path");
  CREATE INDEX "bundles_rels_industries_id_idx" ON "bundles_rels" USING btree ("industries_id");
  CREATE INDEX "bundles_rels_products_id_idx" ON "bundles_rels" USING btree ("products_id");
  CREATE INDEX "bundles_rels_catalog_categories_id_idx" ON "bundles_rels" USING btree ("catalog_categories_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bundles_fk" FOREIGN KEY ("bundles_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_bundles_id_idx" ON "payload_locked_documents_rels" USING btree ("bundles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Edited by hand like K31a: the lock foreign key and index go with `DROP TABLE ... CASCADE`,
  // hence IF EXISTS; lock rows of bundles are removed before their column.
  await db.execute(sql`
   ALTER TABLE "floor_plans_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_description" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_swaps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_compat_checks" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bundles_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "floor_plans_rels" CASCADE;
  DROP TABLE "bundles_description" CASCADE;
  DROP TABLE "bundles_items" CASCADE;
  DROP TABLE "bundles_swaps" CASCADE;
  DROP TABLE "bundles_faq" CASCADE;
  DROP TABLE "bundles_compat_checks" CASCADE;
  DROP TABLE "bundles" CASCADE;
  DROP TABLE "bundles_texts" CASCADE;
  DROP TABLE "bundles_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_bundles_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_bundles_id_idx";
  DELETE FROM "payload_locked_documents_rels" WHERE "bundles_id" IS NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "bundles_id";
  DROP TYPE "public"."enum_bundles_content_status";
  DROP TYPE "public"."enum_bundles_area";`)
}

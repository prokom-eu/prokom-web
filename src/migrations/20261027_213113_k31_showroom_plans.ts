import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'videoAvailability' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'videoAvailability' BEFORE 'schedulePublish';
  CREATE TABLE "partners_showroom_segments_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tier" varchar,
  	"audience" varchar,
  	"highlight" varchar,
  	"image_product_id" integer
  );
  
  CREATE TABLE "partners_showroom_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"icon_path" varchar
  );
  
  CREATE TABLE "partners_showroom_wizard_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_wizard" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_wizard_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series" varchar NOT NULL,
  	"why" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon_path" varchar,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series" varchar NOT NULL,
  	"youtube_id" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"title" varchar NOT NULL,
  	"channel" varchar,
  	"lang" varchar
  );
  
  CREATE TABLE "floor_plans_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" numeric NOT NULL,
  	"y" numeric NOT NULL,
  	"product_id" integer,
  	"label" varchar NOT NULL,
  	"description" varchar
  );
  
  CREATE TABLE "floor_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"lead" varchar,
  	"icon_path" varchar,
  	"view_box" varchar DEFAULT '0 0 1600 820' NOT NULL,
  	"svg" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "partners" ADD COLUMN "showroom_h1" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_lead" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_compare_title" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_wizard_title" varchar;
  ALTER TABLE "partners_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "floor_plans_id" integer;
  ALTER TABLE "partners_showroom_segments_series" ADD CONSTRAINT "partners_showroom_segments_series_image_product_id_products_id_fk" FOREIGN KEY ("image_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_showroom_segments_series" ADD CONSTRAINT "partners_showroom_segments_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_showroom_segments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_segments" ADD CONSTRAINT "partners_showroom_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard_options" ADD CONSTRAINT "partners_showroom_wizard_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_showroom_wizard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard" ADD CONSTRAINT "partners_showroom_wizard_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard_rules" ADD CONSTRAINT "partners_showroom_wizard_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_services" ADD CONSTRAINT "partners_showroom_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_videos" ADD CONSTRAINT "partners_showroom_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "floor_plans_points" ADD CONSTRAINT "floor_plans_points_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "floor_plans_points" ADD CONSTRAINT "floor_plans_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."floor_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "partners_showroom_segments_series_order_idx" ON "partners_showroom_segments_series" USING btree ("_order");
  CREATE INDEX "partners_showroom_segments_series_parent_id_idx" ON "partners_showroom_segments_series" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_segments_series_image_product_idx" ON "partners_showroom_segments_series" USING btree ("image_product_id");
  CREATE INDEX "partners_showroom_segments_order_idx" ON "partners_showroom_segments" USING btree ("_order");
  CREATE INDEX "partners_showroom_segments_parent_id_idx" ON "partners_showroom_segments" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_options_order_idx" ON "partners_showroom_wizard_options" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_options_parent_id_idx" ON "partners_showroom_wizard_options" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_order_idx" ON "partners_showroom_wizard" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_parent_id_idx" ON "partners_showroom_wizard" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_rules_order_idx" ON "partners_showroom_wizard_rules" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_rules_parent_id_idx" ON "partners_showroom_wizard_rules" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_services_order_idx" ON "partners_showroom_services" USING btree ("_order");
  CREATE INDEX "partners_showroom_services_parent_id_idx" ON "partners_showroom_services" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_videos_order_idx" ON "partners_showroom_videos" USING btree ("_order");
  CREATE INDEX "partners_showroom_videos_parent_id_idx" ON "partners_showroom_videos" USING btree ("_parent_id");
  CREATE INDEX "floor_plans_points_order_idx" ON "floor_plans_points" USING btree ("_order");
  CREATE INDEX "floor_plans_points_parent_id_idx" ON "floor_plans_points" USING btree ("_parent_id");
  CREATE INDEX "floor_plans_points_product_idx" ON "floor_plans_points" USING btree ("product_id");
  CREATE INDEX "floor_plans_tenant_idx" ON "floor_plans" USING btree ("tenant_id");
  CREATE INDEX "floor_plans_updated_at_idx" ON "floor_plans" USING btree ("updated_at");
  CREATE INDEX "floor_plans_created_at_idx" ON "floor_plans" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_8_idx" ON "floor_plans" USING btree ("tenant_id","slug");
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_floor_plans_fk" FOREIGN KEY ("floor_plans_id") REFERENCES "public"."floor_plans"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partners_rels_products_id_idx" ON "partners_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_floor_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("floor_plans_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Added by hand: rows of the removed task would not fit the narrowed enums below; the
  // floor_plans foreign key and index go with `DROP TABLE ... CASCADE`, hence IF EXISTS;
  // relation rows of the dropped columns (showroom products, plan locks) would stay empty.
  await db.execute(sql`
  DELETE FROM "payload_jobs_log" WHERE "task_slug" = 'videoAvailability';
  DELETE FROM "payload_jobs" WHERE "task_slug" = 'videoAvailability';
   ALTER TABLE "partners_showroom_segments_series" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_segments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard_rules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_videos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "floor_plans_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "floor_plans" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "partners_showroom_segments_series" CASCADE;
  DROP TABLE "partners_showroom_segments" CASCADE;
  DROP TABLE "partners_showroom_wizard_options" CASCADE;
  DROP TABLE "partners_showroom_wizard" CASCADE;
  DROP TABLE "partners_showroom_wizard_rules" CASCADE;
  DROP TABLE "partners_showroom_services" CASCADE;
  DROP TABLE "partners_showroom_videos" CASCADE;
  DROP TABLE "floor_plans_points" CASCADE;
  DROP TABLE "floor_plans" CASCADE;
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_floor_plans_fk";
  
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'inquiryRetention', 'schedulePublish');
  ALTER TABLE "payload_jobs_log" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_log_task_slug" USING "task_slug"::"public"."enum_payload_jobs_log_task_slug";
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'inquiryRetention', 'schedulePublish');
  ALTER TABLE "payload_jobs" ALTER COLUMN "task_slug" SET DATA TYPE "public"."enum_payload_jobs_task_slug" USING "task_slug"::"public"."enum_payload_jobs_task_slug";
  DROP INDEX "partners_rels_products_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_floor_plans_id_idx";
  ALTER TABLE "partners" DROP COLUMN "showroom_h1";
  ALTER TABLE "partners" DROP COLUMN "showroom_lead";
  ALTER TABLE "partners" DROP COLUMN "showroom_compare_title";
  ALTER TABLE "partners" DROP COLUMN "showroom_wizard_title";
  DELETE FROM "partners_rels" WHERE "products_id" IS NOT NULL;
  DELETE FROM "payload_locked_documents_rels" WHERE "floor_plans_id" IS NOT NULL;
  ALTER TABLE "partners_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "floor_plans_id";`)
}

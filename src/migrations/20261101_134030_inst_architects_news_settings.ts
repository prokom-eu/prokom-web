import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inst_arch_news_category" AS ENUM('snd', 'scr', 'smart', 'wifi', 'kam', 'ev', 'sz');
  CREATE TYPE "public"."enum_inst_arch_news_type" AS ENUM('Nowość', 'Rozwiązanie', 'Szkolenie', 'Oferta');
  CREATE TYPE "public"."enum_inst_arch_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__inst_arch_news_v_version_category" AS ENUM('snd', 'scr', 'smart', 'wifi', 'kam', 'ev', 'sz');
  CREATE TYPE "public"."enum__inst_arch_news_v_version_type" AS ENUM('Nowość', 'Rozwiązanie', 'Szkolenie', 'Oferta');
  CREATE TYPE "public"."enum__inst_arch_news_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "inst_arch_news_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "inst_arch_news_plan_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "inst_arch_news_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "inst_arch_news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"legacy_id" numeric,
  	"title" varchar,
  	"category" "enum_inst_arch_news_category",
  	"type" "enum_inst_arch_news_type",
  	"description" varchar,
  	"examples" varchar,
  	"illustration" varchar,
  	"order" numeric,
  	"featured" boolean DEFAULT false,
  	"internal_note" varchar,
  	"published_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_inst_arch_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_inst_arch_news_v_version_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_arch_news_v_version_plan_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_arch_news_v_version_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_inst_arch_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_legacy_id" numeric,
  	"version_title" varchar,
  	"version_category" "enum__inst_arch_news_v_version_category",
  	"version_type" "enum__inst_arch_news_v_version_type",
  	"version_description" varchar,
  	"version_examples" varchar,
  	"version_illustration" varchar,
  	"version_order" numeric,
  	"version_featured" boolean DEFAULT false,
  	"version_internal_note" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__inst_arch_news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_name" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_role" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_photo_id" integer;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_phone" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_email" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_quote" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_response_text" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inst_arch_news_id" integer;
  ALTER TABLE "inst_arch_news_params" ADD CONSTRAINT "inst_arch_news_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_arch_news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_arch_news_plan_items" ADD CONSTRAINT "inst_arch_news_plan_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_arch_news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_arch_news_places" ADD CONSTRAINT "inst_arch_news_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inst_arch_news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "inst_arch_news" ADD CONSTRAINT "inst_arch_news_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v_version_params" ADD CONSTRAINT "_inst_arch_news_v_version_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_arch_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v_version_plan_items" ADD CONSTRAINT "_inst_arch_news_v_version_plan_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_arch_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v_version_places" ADD CONSTRAINT "_inst_arch_news_v_version_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_inst_arch_news_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v" ADD CONSTRAINT "_inst_arch_news_v_parent_id_inst_arch_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."inst_arch_news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v" ADD CONSTRAINT "_inst_arch_news_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inst_arch_news_params_order_idx" ON "inst_arch_news_params" USING btree ("_order");
  CREATE INDEX "inst_arch_news_params_parent_id_idx" ON "inst_arch_news_params" USING btree ("_parent_id");
  CREATE INDEX "inst_arch_news_plan_items_order_idx" ON "inst_arch_news_plan_items" USING btree ("_order");
  CREATE INDEX "inst_arch_news_plan_items_parent_id_idx" ON "inst_arch_news_plan_items" USING btree ("_parent_id");
  CREATE INDEX "inst_arch_news_places_order_idx" ON "inst_arch_news_places" USING btree ("_order");
  CREATE INDEX "inst_arch_news_places_parent_id_idx" ON "inst_arch_news_places" USING btree ("_parent_id");
  CREATE INDEX "inst_arch_news_tenant_idx" ON "inst_arch_news" USING btree ("tenant_id");
  CREATE INDEX "inst_arch_news_updated_at_idx" ON "inst_arch_news" USING btree ("updated_at");
  CREATE INDEX "inst_arch_news_created_at_idx" ON "inst_arch_news" USING btree ("created_at");
  CREATE INDEX "inst_arch_news__status_idx" ON "inst_arch_news" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_legacyId_3_idx" ON "inst_arch_news" USING btree ("tenant_id","legacy_id");
  CREATE INDEX "_inst_arch_news_v_version_params_order_idx" ON "_inst_arch_news_v_version_params" USING btree ("_order");
  CREATE INDEX "_inst_arch_news_v_version_params_parent_id_idx" ON "_inst_arch_news_v_version_params" USING btree ("_parent_id");
  CREATE INDEX "_inst_arch_news_v_version_plan_items_order_idx" ON "_inst_arch_news_v_version_plan_items" USING btree ("_order");
  CREATE INDEX "_inst_arch_news_v_version_plan_items_parent_id_idx" ON "_inst_arch_news_v_version_plan_items" USING btree ("_parent_id");
  CREATE INDEX "_inst_arch_news_v_version_places_order_idx" ON "_inst_arch_news_v_version_places" USING btree ("_order");
  CREATE INDEX "_inst_arch_news_v_version_places_parent_id_idx" ON "_inst_arch_news_v_version_places" USING btree ("_parent_id");
  CREATE INDEX "_inst_arch_news_v_parent_idx" ON "_inst_arch_news_v" USING btree ("parent_id");
  CREATE INDEX "_inst_arch_news_v_version_version_tenant_idx" ON "_inst_arch_news_v" USING btree ("version_tenant_id");
  CREATE INDEX "_inst_arch_news_v_version_version_updated_at_idx" ON "_inst_arch_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_inst_arch_news_v_version_version_created_at_idx" ON "_inst_arch_news_v" USING btree ("version_created_at");
  CREATE INDEX "_inst_arch_news_v_version_version__status_idx" ON "_inst_arch_news_v" USING btree ("version__status");
  CREATE INDEX "_inst_arch_news_v_created_at_idx" ON "_inst_arch_news_v" USING btree ("created_at");
  CREATE INDEX "_inst_arch_news_v_updated_at_idx" ON "_inst_arch_news_v" USING btree ("updated_at");
  CREATE INDEX "_inst_arch_news_v_latest_idx" ON "_inst_arch_news_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_legacyId_3_idx" ON "_inst_arch_news_v" USING btree ("version_tenant_id","version_legacy_id");
  ALTER TABLE "instalacje_settings" ADD CONSTRAINT "instalacje_settings_architects_photo_id_media_id_fk" FOREIGN KEY ("architects_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inst_arch_news_fk" FOREIGN KEY ("inst_arch_news_id") REFERENCES "public"."inst_arch_news"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "instalacje_settings_architects_architects_photo_idx" ON "instalacje_settings" USING btree ("architects_photo_id");
  CREATE INDEX "payload_locked_documents_rels_inst_arch_news_id_idx" ON "payload_locked_documents_rels" USING btree ("inst_arch_news_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inst_arch_news_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_arch_news_plan_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_arch_news_places" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "inst_arch_news" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_arch_news_v_version_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_arch_news_v_version_plan_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_arch_news_v_version_places" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_inst_arch_news_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "inst_arch_news_params" CASCADE;
  DROP TABLE "inst_arch_news_plan_items" CASCADE;
  DROP TABLE "inst_arch_news_places" CASCADE;
  DROP TABLE "inst_arch_news" CASCADE;
  DROP TABLE "_inst_arch_news_v_version_params" CASCADE;
  DROP TABLE "_inst_arch_news_v_version_plan_items" CASCADE;
  DROP TABLE "_inst_arch_news_v_version_places" CASCADE;
  DROP TABLE "_inst_arch_news_v" CASCADE;
  ALTER TABLE "instalacje_settings" DROP CONSTRAINT "instalacje_settings_architects_photo_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_inst_arch_news_fk";
  
  DROP INDEX "instalacje_settings_architects_architects_photo_idx";
  DROP INDEX "payload_locked_documents_rels_inst_arch_news_id_idx";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_name";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_role";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_photo_id";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_phone";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_email";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_quote";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_response_text";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "inst_arch_news_id";
  DROP TYPE "public"."enum_inst_arch_news_category";
  DROP TYPE "public"."enum_inst_arch_news_type";
  DROP TYPE "public"."enum_inst_arch_news_status";
  DROP TYPE "public"."enum__inst_arch_news_v_version_category";
  DROP TYPE "public"."enum__inst_arch_news_v_version_type";
  DROP TYPE "public"."enum__inst_arch_news_v_version_status";`)
}

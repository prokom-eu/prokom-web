import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_hub_services_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum_hub_services_audience" AS ENUM('firma', 'dom', 'oba');
  CREATE TYPE "public"."enum_hub_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hub_services_v_version_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum__hub_services_v_version_audience" AS ENUM('firma', 'dom', 'oba');
  CREATE TYPE "public"."enum__hub_services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_hub_tools_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum_hub_tools_action" AS ENUM('zglos', 'sprawdz', 'policz', 'zaplanuj', 'zapytaj');
  CREATE TYPE "public"."enum_hub_tools_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hub_tools_v_version_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum__hub_tools_v_version_action" AS ENUM('zglos', 'sprawdz', 'policz', 'zaplanuj', 'zapytaj');
  CREATE TYPE "public"."enum__hub_tools_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_hub_help_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum_hub_help_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hub_help_v_version_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum__hub_help_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_hub_plans_groups_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum_hub_plans_type" AS ENUM('persona', 'branza', 'sytuacja-firma', 'sytuacja-dom');
  CREATE TYPE "public"."enum_hub_plans_call" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum_hub_plans_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__hub_plans_v_version_groups_line" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum__hub_plans_v_version_type" AS ENUM('persona', 'branza', 'sytuacja-firma', 'sytuacja-dom');
  CREATE TYPE "public"."enum__hub_plans_v_version_call" AS ENUM('biznes', 'instalacje', 'software', 'tech', 'gaming');
  CREATE TYPE "public"."enum__hub_plans_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "hub_services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" varchar,
  	"order" numeric DEFAULT 0,
  	"visible" boolean DEFAULT true,
  	"line" "enum_hub_services_line",
  	"audience" "enum_hub_services_audience" DEFAULT 'oba',
  	"title" varchar,
  	"short" varchar,
  	"long" varchar,
  	"keywords" varchar,
  	"url" varchar,
  	"cta_label" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_hub_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "hub_services_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "hub_services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hub_services_id" integer
  );
  
  CREATE TABLE "_hub_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_visible" boolean DEFAULT true,
  	"version_line" "enum__hub_services_v_version_line",
  	"version_audience" "enum__hub_services_v_version_audience" DEFAULT 'oba',
  	"version_title" varchar,
  	"version_short" varchar,
  	"version_long" varchar,
  	"version_keywords" varchar,
  	"version_url" varchar,
  	"version_cta_label" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__hub_services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_hub_services_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_hub_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"hub_services_id" integer
  );
  
  CREATE TABLE "hub_tools" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" varchar,
  	"order" numeric DEFAULT 0,
  	"featured_on_home" boolean DEFAULT false,
  	"line" "enum_hub_tools_line",
  	"action" "enum_hub_tools_action",
  	"title" varchar,
  	"desc" varchar,
  	"result" varchar,
  	"cta_label" varchar,
  	"url" varchar,
  	"badge" varchar,
  	"preview" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_hub_tools_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "hub_tools_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_hub_tools_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_featured_on_home" boolean DEFAULT false,
  	"version_line" "enum__hub_tools_v_version_line",
  	"version_action" "enum__hub_tools_v_version_action",
  	"version_title" varchar,
  	"version_desc" varchar,
  	"version_result" varchar,
  	"version_cta_label" varchar,
  	"version_url" varchar,
  	"version_badge" varchar,
  	"version_preview" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__hub_tools_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_hub_tools_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "hub_help" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar,
  	"order" numeric DEFAULT 0,
  	"line" "enum_hub_help_line",
  	"group" varchar,
  	"title" varchar,
  	"cta_label" varchar,
  	"related_tool_id" integer,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_hub_help_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "hub_help_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_hub_help_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_line" "enum__hub_help_v_version_line",
  	"version_group" varchar,
  	"version_title" varchar,
  	"version_cta_label" varchar,
  	"version_related_tool_id" integer,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__hub_help_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_hub_help_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "hub_plans_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" "enum_hub_plans_groups_line"
  );
  
  CREATE TABLE "hub_plans" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"key" varchar,
  	"order" numeric DEFAULT 0,
  	"type" "enum_hub_plans_type",
  	"name" varchar,
  	"title" varchar,
  	"lead" varchar,
  	"call" "enum_hub_plans_call",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_hub_plans_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "hub_plans_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_hub_plans_v_version_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" "enum__hub_plans_v_version_groups_line",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_hub_plans_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_key" varchar,
  	"version_order" numeric DEFAULT 0,
  	"version_type" "enum__hub_plans_v_version_type",
  	"version_name" varchar,
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_call" "enum__hub_plans_v_version_call",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__hub_plans_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_hub_plans_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hub_services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hub_tools_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hub_help_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hub_plans_id" integer;
  ALTER TABLE "hub_services" ADD CONSTRAINT "hub_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hub_services_texts" ADD CONSTRAINT "hub_services_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_services_rels" ADD CONSTRAINT "hub_services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_services_rels" ADD CONSTRAINT "hub_services_rels_hub_services_fk" FOREIGN KEY ("hub_services_id") REFERENCES "public"."hub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_services_v" ADD CONSTRAINT "_hub_services_v_parent_id_hub_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_services_v" ADD CONSTRAINT "_hub_services_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_services_v_texts" ADD CONSTRAINT "_hub_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hub_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_services_v_rels" ADD CONSTRAINT "_hub_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hub_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_services_v_rels" ADD CONSTRAINT "_hub_services_v_rels_hub_services_fk" FOREIGN KEY ("hub_services_id") REFERENCES "public"."hub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_tools" ADD CONSTRAINT "hub_tools_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hub_tools_texts" ADD CONSTRAINT "hub_tools_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_tools_v" ADD CONSTRAINT "_hub_tools_v_parent_id_hub_tools_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_tools_v" ADD CONSTRAINT "_hub_tools_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_tools_v_texts" ADD CONSTRAINT "_hub_tools_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hub_tools_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_help" ADD CONSTRAINT "hub_help_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hub_help" ADD CONSTRAINT "hub_help_related_tool_id_hub_tools_id_fk" FOREIGN KEY ("related_tool_id") REFERENCES "public"."hub_tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hub_help_texts" ADD CONSTRAINT "hub_help_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_help"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_help_v" ADD CONSTRAINT "_hub_help_v_parent_id_hub_help_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_help"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_help_v" ADD CONSTRAINT "_hub_help_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_help_v" ADD CONSTRAINT "_hub_help_v_version_related_tool_id_hub_tools_id_fk" FOREIGN KEY ("version_related_tool_id") REFERENCES "public"."hub_tools"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_help_v_texts" ADD CONSTRAINT "_hub_help_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hub_help_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_plans_groups" ADD CONSTRAINT "hub_plans_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_plans" ADD CONSTRAINT "hub_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hub_plans_texts" ADD CONSTRAINT "hub_plans_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_plans_v_version_groups" ADD CONSTRAINT "_hub_plans_v_version_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_hub_plans_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_hub_plans_v" ADD CONSTRAINT "_hub_plans_v_parent_id_hub_plans_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."hub_plans"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_plans_v" ADD CONSTRAINT "_hub_plans_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_hub_plans_v_texts" ADD CONSTRAINT "_hub_plans_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_hub_plans_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "hub_services_tenant_idx" ON "hub_services" USING btree ("tenant_id");
  CREATE INDEX "hub_services_updated_at_idx" ON "hub_services" USING btree ("updated_at");
  CREATE INDEX "hub_services_created_at_idx" ON "hub_services" USING btree ("created_at");
  CREATE INDEX "hub_services__status_idx" ON "hub_services" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_key_3_idx" ON "hub_services" USING btree ("tenant_id","key");
  CREATE INDEX "hub_services_texts_order_parent" ON "hub_services_texts" USING btree ("order","parent_id");
  CREATE INDEX "hub_services_rels_order_idx" ON "hub_services_rels" USING btree ("order");
  CREATE INDEX "hub_services_rels_parent_idx" ON "hub_services_rels" USING btree ("parent_id");
  CREATE INDEX "hub_services_rels_path_idx" ON "hub_services_rels" USING btree ("path");
  CREATE INDEX "hub_services_rels_hub_services_id_idx" ON "hub_services_rels" USING btree ("hub_services_id");
  CREATE INDEX "_hub_services_v_parent_idx" ON "_hub_services_v" USING btree ("parent_id");
  CREATE INDEX "_hub_services_v_version_version_tenant_idx" ON "_hub_services_v" USING btree ("version_tenant_id");
  CREATE INDEX "_hub_services_v_version_version_updated_at_idx" ON "_hub_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_hub_services_v_version_version_created_at_idx" ON "_hub_services_v" USING btree ("version_created_at");
  CREATE INDEX "_hub_services_v_version_version__status_idx" ON "_hub_services_v" USING btree ("version__status");
  CREATE INDEX "_hub_services_v_created_at_idx" ON "_hub_services_v" USING btree ("created_at");
  CREATE INDEX "_hub_services_v_updated_at_idx" ON "_hub_services_v" USING btree ("updated_at");
  CREATE INDEX "_hub_services_v_latest_idx" ON "_hub_services_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_key_2_idx" ON "_hub_services_v" USING btree ("version_tenant_id","version_key");
  CREATE INDEX "_hub_services_v_texts_order_parent" ON "_hub_services_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_hub_services_v_rels_order_idx" ON "_hub_services_v_rels" USING btree ("order");
  CREATE INDEX "_hub_services_v_rels_parent_idx" ON "_hub_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_hub_services_v_rels_path_idx" ON "_hub_services_v_rels" USING btree ("path");
  CREATE INDEX "_hub_services_v_rels_hub_services_id_idx" ON "_hub_services_v_rels" USING btree ("hub_services_id");
  CREATE INDEX "hub_tools_tenant_idx" ON "hub_tools" USING btree ("tenant_id");
  CREATE INDEX "hub_tools_updated_at_idx" ON "hub_tools" USING btree ("updated_at");
  CREATE INDEX "hub_tools_created_at_idx" ON "hub_tools" USING btree ("created_at");
  CREATE INDEX "hub_tools__status_idx" ON "hub_tools" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_key_4_idx" ON "hub_tools" USING btree ("tenant_id","key");
  CREATE INDEX "hub_tools_texts_order_parent" ON "hub_tools_texts" USING btree ("order","parent_id");
  CREATE INDEX "_hub_tools_v_parent_idx" ON "_hub_tools_v" USING btree ("parent_id");
  CREATE INDEX "_hub_tools_v_version_version_tenant_idx" ON "_hub_tools_v" USING btree ("version_tenant_id");
  CREATE INDEX "_hub_tools_v_version_version_updated_at_idx" ON "_hub_tools_v" USING btree ("version_updated_at");
  CREATE INDEX "_hub_tools_v_version_version_created_at_idx" ON "_hub_tools_v" USING btree ("version_created_at");
  CREATE INDEX "_hub_tools_v_version_version__status_idx" ON "_hub_tools_v" USING btree ("version__status");
  CREATE INDEX "_hub_tools_v_created_at_idx" ON "_hub_tools_v" USING btree ("created_at");
  CREATE INDEX "_hub_tools_v_updated_at_idx" ON "_hub_tools_v" USING btree ("updated_at");
  CREATE INDEX "_hub_tools_v_latest_idx" ON "_hub_tools_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_key_3_idx" ON "_hub_tools_v" USING btree ("version_tenant_id","version_key");
  CREATE INDEX "_hub_tools_v_texts_order_parent" ON "_hub_tools_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "hub_help_tenant_idx" ON "hub_help" USING btree ("tenant_id");
  CREATE INDEX "hub_help_related_tool_idx" ON "hub_help" USING btree ("related_tool_id");
  CREATE INDEX "hub_help_updated_at_idx" ON "hub_help" USING btree ("updated_at");
  CREATE INDEX "hub_help_created_at_idx" ON "hub_help" USING btree ("created_at");
  CREATE INDEX "hub_help__status_idx" ON "hub_help" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_13_idx" ON "hub_help" USING btree ("tenant_id","slug");
  CREATE INDEX "hub_help_texts_order_parent" ON "hub_help_texts" USING btree ("order","parent_id");
  CREATE INDEX "_hub_help_v_parent_idx" ON "_hub_help_v" USING btree ("parent_id");
  CREATE INDEX "_hub_help_v_version_version_tenant_idx" ON "_hub_help_v" USING btree ("version_tenant_id");
  CREATE INDEX "_hub_help_v_version_version_related_tool_idx" ON "_hub_help_v" USING btree ("version_related_tool_id");
  CREATE INDEX "_hub_help_v_version_version_updated_at_idx" ON "_hub_help_v" USING btree ("version_updated_at");
  CREATE INDEX "_hub_help_v_version_version_created_at_idx" ON "_hub_help_v" USING btree ("version_created_at");
  CREATE INDEX "_hub_help_v_version_version__status_idx" ON "_hub_help_v" USING btree ("version__status");
  CREATE INDEX "_hub_help_v_created_at_idx" ON "_hub_help_v" USING btree ("created_at");
  CREATE INDEX "_hub_help_v_updated_at_idx" ON "_hub_help_v" USING btree ("updated_at");
  CREATE INDEX "_hub_help_v_latest_idx" ON "_hub_help_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_6_idx" ON "_hub_help_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_hub_help_v_texts_order_parent" ON "_hub_help_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "hub_plans_groups_order_idx" ON "hub_plans_groups" USING btree ("_order");
  CREATE INDEX "hub_plans_groups_parent_id_idx" ON "hub_plans_groups" USING btree ("_parent_id");
  CREATE INDEX "hub_plans_tenant_idx" ON "hub_plans" USING btree ("tenant_id");
  CREATE INDEX "hub_plans_updated_at_idx" ON "hub_plans" USING btree ("updated_at");
  CREATE INDEX "hub_plans_created_at_idx" ON "hub_plans" USING btree ("created_at");
  CREATE INDEX "hub_plans__status_idx" ON "hub_plans" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_type_key_idx" ON "hub_plans" USING btree ("tenant_id","type","key");
  CREATE INDEX "hub_plans_texts_order_parent" ON "hub_plans_texts" USING btree ("order","parent_id");
  CREATE INDEX "_hub_plans_v_version_groups_order_idx" ON "_hub_plans_v_version_groups" USING btree ("_order");
  CREATE INDEX "_hub_plans_v_version_groups_parent_id_idx" ON "_hub_plans_v_version_groups" USING btree ("_parent_id");
  CREATE INDEX "_hub_plans_v_parent_idx" ON "_hub_plans_v" USING btree ("parent_id");
  CREATE INDEX "_hub_plans_v_version_version_tenant_idx" ON "_hub_plans_v" USING btree ("version_tenant_id");
  CREATE INDEX "_hub_plans_v_version_version_updated_at_idx" ON "_hub_plans_v" USING btree ("version_updated_at");
  CREATE INDEX "_hub_plans_v_version_version_created_at_idx" ON "_hub_plans_v" USING btree ("version_created_at");
  CREATE INDEX "_hub_plans_v_version_version__status_idx" ON "_hub_plans_v" USING btree ("version__status");
  CREATE INDEX "_hub_plans_v_created_at_idx" ON "_hub_plans_v" USING btree ("created_at");
  CREATE INDEX "_hub_plans_v_updated_at_idx" ON "_hub_plans_v" USING btree ("updated_at");
  CREATE INDEX "_hub_plans_v_latest_idx" ON "_hub_plans_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_type_version_key_idx" ON "_hub_plans_v" USING btree ("version_tenant_id","version_type","version_key");
  CREATE INDEX "_hub_plans_v_texts_order_parent" ON "_hub_plans_v_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_services_fk" FOREIGN KEY ("hub_services_id") REFERENCES "public"."hub_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_tools_fk" FOREIGN KEY ("hub_tools_id") REFERENCES "public"."hub_tools"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_help_fk" FOREIGN KEY ("hub_help_id") REFERENCES "public"."hub_help"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_plans_fk" FOREIGN KEY ("hub_plans_id") REFERENCES "public"."hub_plans"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hub_services_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_services_id");
  CREATE INDEX "payload_locked_documents_rels_hub_tools_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_tools_id");
  CREATE INDEX "payload_locked_documents_rels_hub_help_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_help_id");
  CREATE INDEX "payload_locked_documents_rels_hub_plans_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_plans_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_services_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_services_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_services_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_services_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_tools" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_tools_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_tools_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_tools_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_help" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_help_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_help_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_help_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_plans_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_plans" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_plans_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_plans_v_version_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_plans_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_hub_plans_v_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hub_services" CASCADE;
  DROP TABLE "hub_services_texts" CASCADE;
  DROP TABLE "hub_services_rels" CASCADE;
  DROP TABLE "_hub_services_v" CASCADE;
  DROP TABLE "_hub_services_v_texts" CASCADE;
  DROP TABLE "_hub_services_v_rels" CASCADE;
  DROP TABLE "hub_tools" CASCADE;
  DROP TABLE "hub_tools_texts" CASCADE;
  DROP TABLE "_hub_tools_v" CASCADE;
  DROP TABLE "_hub_tools_v_texts" CASCADE;
  DROP TABLE "hub_help" CASCADE;
  DROP TABLE "hub_help_texts" CASCADE;
  DROP TABLE "_hub_help_v" CASCADE;
  DROP TABLE "_hub_help_v_texts" CASCADE;
  DROP TABLE "hub_plans_groups" CASCADE;
  DROP TABLE "hub_plans" CASCADE;
  DROP TABLE "hub_plans_texts" CASCADE;
  DROP TABLE "_hub_plans_v_version_groups" CASCADE;
  DROP TABLE "_hub_plans_v" CASCADE;
  DROP TABLE "_hub_plans_v_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hub_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hub_tools_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hub_help_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hub_plans_fk";
  
  DROP INDEX "payload_locked_documents_rels_hub_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_hub_tools_id_idx";
  DROP INDEX "payload_locked_documents_rels_hub_help_id_idx";
  DROP INDEX "payload_locked_documents_rels_hub_plans_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hub_services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hub_tools_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hub_help_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hub_plans_id";
  DROP TYPE "public"."enum_hub_services_line";
  DROP TYPE "public"."enum_hub_services_audience";
  DROP TYPE "public"."enum_hub_services_status";
  DROP TYPE "public"."enum__hub_services_v_version_line";
  DROP TYPE "public"."enum__hub_services_v_version_audience";
  DROP TYPE "public"."enum__hub_services_v_version_status";
  DROP TYPE "public"."enum_hub_tools_line";
  DROP TYPE "public"."enum_hub_tools_action";
  DROP TYPE "public"."enum_hub_tools_status";
  DROP TYPE "public"."enum__hub_tools_v_version_line";
  DROP TYPE "public"."enum__hub_tools_v_version_action";
  DROP TYPE "public"."enum__hub_tools_v_version_status";
  DROP TYPE "public"."enum_hub_help_line";
  DROP TYPE "public"."enum_hub_help_status";
  DROP TYPE "public"."enum__hub_help_v_version_line";
  DROP TYPE "public"."enum__hub_help_v_version_status";
  DROP TYPE "public"."enum_hub_plans_groups_line";
  DROP TYPE "public"."enum_hub_plans_type";
  DROP TYPE "public"."enum_hub_plans_call";
  DROP TYPE "public"."enum_hub_plans_status";
  DROP TYPE "public"."enum__hub_plans_v_version_groups_line";
  DROP TYPE "public"."enum__hub_plans_v_version_type";
  DROP TYPE "public"."enum__hub_plans_v_version_call";
  DROP TYPE "public"."enum__hub_plans_v_version_status";`)
}

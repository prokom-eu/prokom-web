import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_catalog_groups_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_catalog_categories_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_industries_wizard_business_type" AS ENUM('sklep', 'gastro', 'hotel', 'biuro', 'warsztat', 'gabinet', 'szkola', 'produkcja', 'truck', 'inna');
  CREATE TYPE "public"."enum_products_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_products_register_types" AS ENUM('mobile', 'small', 'system', 'touch');
  CREATE TYPE "public"."enum_products_kind" AS ENUM('device', 'software', 'service');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_version_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__products_v_version_register_types" AS ENUM('mobile', 'small', 'system', 'touch');
  CREATE TYPE "public"."enum__products_v_version_kind" AS ENUM('device', 'software', 'service');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_posts_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy');
  CREATE TYPE "public"."enum_posts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_v_version_category" AS ENUM('ksef', 'kasy', 'terminale', 'dofinansowania', 'programy');
  CREATE TYPE "public"."enum__posts_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "catalog_groups" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"icon" "enum_catalog_groups_icon" NOT NULL,
  	"gradient_from" varchar NOT NULL,
  	"gradient_to" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "catalog_categories_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "catalog_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"group_id" integer NOT NULL,
  	"icon" "enum_catalog_categories_icon",
  	"description" varchar,
  	"hero_title" varchar,
  	"hero_lead" varchar,
  	"hero_image_id" integer,
  	"order" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "catalog_categories_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "catalog_categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "industries_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "industries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT false,
  	"wizard_business_type" "enum_industries_wizard_business_type",
  	"hero_title" varchar,
  	"hero_lead" varchar,
  	"hero_image_id" integer,
  	"order" numeric DEFAULT 0,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "industries_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "products_key_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"group" varchar,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "products_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"icon" "enum_products_modules_icon"
  );
  
  CREATE TABLE "products_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "products_register_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_register_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar,
  	"name" varchar,
  	"kind" "enum_products_kind" DEFAULT 'device',
  	"brand_id" integer,
  	"benefit" varchar,
  	"badge" varchar,
  	"keywords" varchar,
  	"description" jsonb,
  	"comparison_type" varchar,
  	"comparison_display" varchar,
  	"comparison_keyboard" varchar,
  	"comparison_plu" varchar,
  	"comparison_printer" varchar,
  	"comparison_connectivity" varchar,
  	"comparison_weight" varchar,
  	"comparison_audience" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"is_new" boolean DEFAULT false,
  	"authorized" boolean DEFAULT false,
  	"popularity" numeric DEFAULT 50,
  	"featured" boolean DEFAULT false,
  	"featured_order" numeric,
  	"legacy_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"catalog_categories_id" integer,
  	"industries_id" integer,
  	"media_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "_products_v_version_key_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"group" varchar,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"icon" "enum__products_v_version_modules_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_register_types" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_register_types",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_slug" varchar,
  	"version_name" varchar,
  	"version_kind" "enum__products_v_version_kind" DEFAULT 'device',
  	"version_brand_id" integer,
  	"version_benefit" varchar,
  	"version_badge" varchar,
  	"version_keywords" varchar,
  	"version_description" jsonb,
  	"version_comparison_type" varchar,
  	"version_comparison_display" varchar,
  	"version_comparison_keyboard" varchar,
  	"version_comparison_plu" varchar,
  	"version_comparison_printer" varchar,
  	"version_comparison_connectivity" varchar,
  	"version_comparison_weight" varchar,
  	"version_comparison_audience" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_is_new" boolean DEFAULT false,
  	"version_authorized" boolean DEFAULT false,
  	"version_popularity" numeric DEFAULT 50,
  	"version_featured" boolean DEFAULT false,
  	"version_featured_order" numeric,
  	"version_legacy_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_products_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"catalog_categories_id" integer,
  	"industries_id" integer,
  	"media_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "posts_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"verified_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"title" varchar,
  	"slug" varchar,
  	"category" "enum_posts_category",
  	"published_at" timestamp(3) with time zone,
  	"lead" varchar,
  	"cover_id" integer,
  	"content" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "posts_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_posts_v_version_sources" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar,
  	"verified_at" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_posts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_category" "enum__posts_v_version_category",
  	"version_published_at" timestamp(3) with time zone,
  	"version_lead" varchar,
  	"version_cover_id" integer,
  	"version_content" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_posts_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "partners" ADD COLUMN "slug" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catalog_groups_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "catalog_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "industries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_id" integer;
  ALTER TABLE "catalog_groups" ADD CONSTRAINT "catalog_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "catalog_categories_faq" ADD CONSTRAINT "catalog_categories_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_categories" ADD CONSTRAINT "catalog_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "catalog_categories" ADD CONSTRAINT "catalog_categories_group_id_catalog_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."catalog_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "catalog_categories" ADD CONSTRAINT "catalog_categories_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "catalog_categories_texts" ADD CONSTRAINT "catalog_categories_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_categories_rels" ADD CONSTRAINT "catalog_categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_categories_rels" ADD CONSTRAINT "catalog_categories_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_faq" ADD CONSTRAINT "industries_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries" ADD CONSTRAINT "industries_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_rels" ADD CONSTRAINT "industries_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_key_params" ADD CONSTRAINT "products_key_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_hotspots" ADD CONSTRAINT "products_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules" ADD CONSTRAINT "products_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_faq" ADD CONSTRAINT "products_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_register_types" ADD CONSTRAINT "products_register_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_partners_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_catalog_categories_fk" FOREIGN KEY ("catalog_categories_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_key_params" ADD CONSTRAINT "_products_v_version_key_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_specs" ADD CONSTRAINT "_products_v_version_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_hotspots" ADD CONSTRAINT "_products_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules" ADD CONSTRAINT "_products_v_version_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_faq" ADD CONSTRAINT "_products_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_register_types" ADD CONSTRAINT "_products_v_version_register_types_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_partners_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_texts" ADD CONSTRAINT "_products_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_catalog_categories_fk" FOREIGN KEY ("catalog_categories_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_sources" ADD CONSTRAINT "posts_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_sources" ADD CONSTRAINT "_posts_v_version_sources_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_parent_id_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "catalog_groups_tenant_idx" ON "catalog_groups" USING btree ("tenant_id");
  CREATE INDEX "catalog_groups_slug_idx" ON "catalog_groups" USING btree ("slug");
  CREATE INDEX "catalog_groups_updated_at_idx" ON "catalog_groups" USING btree ("updated_at");
  CREATE INDEX "catalog_groups_created_at_idx" ON "catalog_groups" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_1_idx" ON "catalog_groups" USING btree ("tenant_id","slug");
  CREATE INDEX "catalog_categories_faq_order_idx" ON "catalog_categories_faq" USING btree ("_order");
  CREATE INDEX "catalog_categories_faq_parent_id_idx" ON "catalog_categories_faq" USING btree ("_parent_id");
  CREATE INDEX "catalog_categories_tenant_idx" ON "catalog_categories" USING btree ("tenant_id");
  CREATE INDEX "catalog_categories_slug_idx" ON "catalog_categories" USING btree ("slug");
  CREATE INDEX "catalog_categories_group_idx" ON "catalog_categories" USING btree ("group_id");
  CREATE INDEX "catalog_categories_hero_hero_image_idx" ON "catalog_categories" USING btree ("hero_image_id");
  CREATE INDEX "catalog_categories_updated_at_idx" ON "catalog_categories" USING btree ("updated_at");
  CREATE INDEX "catalog_categories_created_at_idx" ON "catalog_categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_2_idx" ON "catalog_categories" USING btree ("tenant_id","slug");
  CREATE INDEX "catalog_categories_texts_order_parent" ON "catalog_categories_texts" USING btree ("order","parent_id");
  CREATE INDEX "catalog_categories_rels_order_idx" ON "catalog_categories_rels" USING btree ("order");
  CREATE INDEX "catalog_categories_rels_parent_idx" ON "catalog_categories_rels" USING btree ("parent_id");
  CREATE INDEX "catalog_categories_rels_path_idx" ON "catalog_categories_rels" USING btree ("path");
  CREATE INDEX "catalog_categories_rels_products_id_idx" ON "catalog_categories_rels" USING btree ("products_id");
  CREATE INDEX "industries_faq_order_idx" ON "industries_faq" USING btree ("_order");
  CREATE INDEX "industries_faq_parent_id_idx" ON "industries_faq" USING btree ("_parent_id");
  CREATE INDEX "industries_tenant_idx" ON "industries" USING btree ("tenant_id");
  CREATE INDEX "industries_slug_idx" ON "industries" USING btree ("slug");
  CREATE INDEX "industries_hero_hero_image_idx" ON "industries" USING btree ("hero_image_id");
  CREATE INDEX "industries_updated_at_idx" ON "industries" USING btree ("updated_at");
  CREATE INDEX "industries_created_at_idx" ON "industries" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_3_idx" ON "industries" USING btree ("tenant_id","slug");
  CREATE INDEX "industries_rels_order_idx" ON "industries_rels" USING btree ("order");
  CREATE INDEX "industries_rels_parent_idx" ON "industries_rels" USING btree ("parent_id");
  CREATE INDEX "industries_rels_path_idx" ON "industries_rels" USING btree ("path");
  CREATE INDEX "industries_rels_products_id_idx" ON "industries_rels" USING btree ("products_id");
  CREATE INDEX "products_key_params_order_idx" ON "products_key_params" USING btree ("_order");
  CREATE INDEX "products_key_params_parent_id_idx" ON "products_key_params" USING btree ("_parent_id");
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_hotspots_order_idx" ON "products_hotspots" USING btree ("_order");
  CREATE INDEX "products_hotspots_parent_id_idx" ON "products_hotspots" USING btree ("_parent_id");
  CREATE INDEX "products_modules_order_idx" ON "products_modules" USING btree ("_order");
  CREATE INDEX "products_modules_parent_id_idx" ON "products_modules" USING btree ("_parent_id");
  CREATE INDEX "products_faq_order_idx" ON "products_faq" USING btree ("_order");
  CREATE INDEX "products_faq_parent_id_idx" ON "products_faq" USING btree ("_parent_id");
  CREATE INDEX "products_register_types_order_idx" ON "products_register_types" USING btree ("order");
  CREATE INDEX "products_register_types_parent_idx" ON "products_register_types" USING btree ("parent_id");
  CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");
  CREATE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "products_legacy_id_idx" ON "products" USING btree ("legacy_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_4_idx" ON "products" USING btree ("tenant_id","slug");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_catalog_categories_id_idx" ON "products_rels" USING btree ("catalog_categories_id");
  CREATE INDEX "products_rels_industries_id_idx" ON "products_rels" USING btree ("industries_id");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_version_key_params_order_idx" ON "_products_v_version_key_params" USING btree ("_order");
  CREATE INDEX "_products_v_version_key_params_parent_id_idx" ON "_products_v_version_key_params" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_specs_order_idx" ON "_products_v_version_specs" USING btree ("_order");
  CREATE INDEX "_products_v_version_specs_parent_id_idx" ON "_products_v_version_specs" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_hotspots_order_idx" ON "_products_v_version_hotspots" USING btree ("_order");
  CREATE INDEX "_products_v_version_hotspots_parent_id_idx" ON "_products_v_version_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_modules_order_idx" ON "_products_v_version_modules" USING btree ("_order");
  CREATE INDEX "_products_v_version_modules_parent_id_idx" ON "_products_v_version_modules" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_faq_order_idx" ON "_products_v_version_faq" USING btree ("_order");
  CREATE INDEX "_products_v_version_faq_parent_id_idx" ON "_products_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_register_types_order_idx" ON "_products_v_version_register_types" USING btree ("order");
  CREATE INDEX "_products_v_version_register_types_parent_idx" ON "_products_v_version_register_types" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_tenant_idx" ON "_products_v" USING btree ("version_tenant_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "_products_v_version_version_legacy_id_idx" ON "_products_v" USING btree ("version_legacy_id");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_1_idx" ON "_products_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_products_v_texts_order_parent" ON "_products_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_catalog_categories_id_idx" ON "_products_v_rels" USING btree ("catalog_categories_id");
  CREATE INDEX "_products_v_rels_industries_id_idx" ON "_products_v_rels" USING btree ("industries_id");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "posts_sources_order_idx" ON "posts_sources" USING btree ("_order");
  CREATE INDEX "posts_sources_parent_id_idx" ON "posts_sources" USING btree ("_parent_id");
  CREATE INDEX "posts_tenant_idx" ON "posts" USING btree ("tenant_id");
  CREATE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");
  CREATE INDEX "posts_cover_idx" ON "posts" USING btree ("cover_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "posts__status_idx" ON "posts" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_5_idx" ON "posts" USING btree ("tenant_id","slug");
  CREATE INDEX "posts_rels_order_idx" ON "posts_rels" USING btree ("order");
  CREATE INDEX "posts_rels_parent_idx" ON "posts_rels" USING btree ("parent_id");
  CREATE INDEX "posts_rels_path_idx" ON "posts_rels" USING btree ("path");
  CREATE INDEX "posts_rels_products_id_idx" ON "posts_rels" USING btree ("products_id");
  CREATE INDEX "_posts_v_version_sources_order_idx" ON "_posts_v_version_sources" USING btree ("_order");
  CREATE INDEX "_posts_v_version_sources_parent_id_idx" ON "_posts_v_version_sources" USING btree ("_parent_id");
  CREATE INDEX "_posts_v_parent_idx" ON "_posts_v" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_version_tenant_idx" ON "_posts_v" USING btree ("version_tenant_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE INDEX "_posts_v_version_version_published_at_idx" ON "_posts_v" USING btree ("version_published_at");
  CREATE INDEX "_posts_v_version_version_cover_idx" ON "_posts_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_v_version_version_updated_at_idx" ON "_posts_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_v_version_version_created_at_idx" ON "_posts_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_v_version_version__status_idx" ON "_posts_v" USING btree ("version__status");
  CREATE INDEX "_posts_v_created_at_idx" ON "_posts_v" USING btree ("created_at");
  CREATE INDEX "_posts_v_updated_at_idx" ON "_posts_v" USING btree ("updated_at");
  CREATE INDEX "_posts_v_latest_idx" ON "_posts_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_2_idx" ON "_posts_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "_posts_v_rels_order_idx" ON "_posts_v_rels" USING btree ("order");
  CREATE INDEX "_posts_v_rels_parent_idx" ON "_posts_v_rels" USING btree ("parent_id");
  CREATE INDEX "_posts_v_rels_path_idx" ON "_posts_v_rels" USING btree ("path");
  CREATE INDEX "_posts_v_rels_products_id_idx" ON "_posts_v_rels" USING btree ("products_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_groups_fk" FOREIGN KEY ("catalog_groups_id") REFERENCES "public"."catalog_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_catalog_categories_fk" FOREIGN KEY ("catalog_categories_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industries_fk" FOREIGN KEY ("industries_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "partners_slug_idx" ON "partners" USING btree ("slug");
  CREATE INDEX "payload_locked_documents_rels_catalog_groups_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_groups_id");
  CREATE INDEX "payload_locked_documents_rels_catalog_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("catalog_categories_id");
  CREATE INDEX "payload_locked_documents_rels_industries_id_idx" ON "payload_locked_documents_rels" USING btree ("industries_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_categories_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_categories_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "catalog_categories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_key_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_register_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_key_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_specs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_hotspots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_register_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_sources" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "catalog_groups" CASCADE;
  DROP TABLE "catalog_categories_faq" CASCADE;
  DROP TABLE "catalog_categories" CASCADE;
  DROP TABLE "catalog_categories_texts" CASCADE;
  DROP TABLE "catalog_categories_rels" CASCADE;
  DROP TABLE "industries_faq" CASCADE;
  DROP TABLE "industries" CASCADE;
  DROP TABLE "industries_rels" CASCADE;
  DROP TABLE "products_key_params" CASCADE;
  DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_hotspots" CASCADE;
  DROP TABLE "products_modules" CASCADE;
  DROP TABLE "products_faq" CASCADE;
  DROP TABLE "products_register_types" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_key_params" CASCADE;
  DROP TABLE "_products_v_version_specs" CASCADE;
  DROP TABLE "_products_v_version_hotspots" CASCADE;
  DROP TABLE "_products_v_version_modules" CASCADE;
  DROP TABLE "_products_v_version_faq" CASCADE;
  DROP TABLE "_products_v_version_register_types" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_texts" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "posts_sources" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "posts_rels" CASCADE;
  DROP TABLE "_posts_v_version_sources" CASCADE;
  DROP TABLE "_posts_v" CASCADE;
  DROP TABLE "_posts_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_catalog_groups_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_catalog_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_industries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_posts_fk";
  
  DROP INDEX "partners_slug_idx";
  DROP INDEX "payload_locked_documents_rels_catalog_groups_id_idx";
  DROP INDEX "payload_locked_documents_rels_catalog_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_industries_id_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_posts_id_idx";
  ALTER TABLE "partners" DROP COLUMN "slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "catalog_groups_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "catalog_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "industries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_id";
  DROP TYPE "public"."enum_catalog_groups_icon";
  DROP TYPE "public"."enum_catalog_categories_icon";
  DROP TYPE "public"."enum_industries_wizard_business_type";
  DROP TYPE "public"."enum_products_modules_icon";
  DROP TYPE "public"."enum_products_register_types";
  DROP TYPE "public"."enum_products_kind";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_version_modules_icon";
  DROP TYPE "public"."enum__products_v_version_register_types";
  DROP TYPE "public"."enum__products_v_version_kind";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_posts_category";
  DROP TYPE "public"."enum_posts_status";
  DROP TYPE "public"."enum__posts_v_version_category";
  DROP TYPE "public"."enum__posts_v_version_status";`)
}

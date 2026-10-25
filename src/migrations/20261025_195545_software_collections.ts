import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_solutions_situations" AS ENUM('Z', 'R', 'P');
  CREATE TYPE "public"."enum_solutions_industry_groups" AS ENUM('budowlanka-i-ekipy', 'noclegi', 'turystyka-i-wydarzenia', 'gastronomia', 'zdrowie-i-uroda', 'uslugi-i-transport', 'handel-i-producenci', 'edukacja-i-organizacje');
  CREATE TYPE "public"."enum_solutions_category" AS ENUM('strony', 'systemy', 'aplikacje', 'automatyzacje', 'opieka');
  CREATE TYPE "public"."enum_solutions_card_gradient" AS ENUM('peach', 'sand', 'sage');
  CREATE TYPE "public"."enum_solutions_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__solutions_v_version_situations" AS ENUM('Z', 'R', 'P');
  CREATE TYPE "public"."enum__solutions_v_version_industry_groups" AS ENUM('budowlanka-i-ekipy', 'noclegi', 'turystyka-i-wydarzenia', 'gastronomia', 'zdrowie-i-uroda', 'uslugi-i-transport', 'handel-i-producenci', 'edukacja-i-organizacje');
  CREATE TYPE "public"."enum__solutions_v_version_category" AS ENUM('strony', 'systemy', 'aplikacje', 'automatyzacje', 'opieka');
  CREATE TYPE "public"."enum__solutions_v_version_card_gradient" AS ENUM('peach', 'sand', 'sage');
  CREATE TYPE "public"."enum__solutions_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_solution_areas_key" AS ENUM('www', 'sys', 'app', 'cal', 'plug', 'auto', 'care', 'aud');
  CREATE TYPE "public"."enum_solution_areas_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TABLE "solutions_situations" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_solutions_situations",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "solutions_industry_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_solutions_industry_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "solutions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"slug" varchar,
  	"legacy_id" numeric,
  	"name" varchar,
  	"category" "enum_solutions_category",
  	"label" varchar,
  	"tag" varchar,
  	"lead" varchar,
  	"for_whom" varchar,
  	"keywords" varchar,
  	"has_live_preview" boolean DEFAULT false,
  	"toast" varchar,
  	"card_gradient" "enum_solutions_card_gradient",
  	"prices_start" numeric,
  	"prices_std" numeric,
  	"prices_full" numeric,
  	"lead_times_start" varchar,
  	"lead_times_std" varchar,
  	"lead_times_full" varchar,
  	"price_note" varchar,
  	"featured_name" varchar,
  	"featured_tag" varchar,
  	"featured_lead" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_solutions_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "solutions_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_solutions_v_version_situations" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__solutions_v_version_situations",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_solutions_v_version_industry_groups" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__solutions_v_version_industry_groups",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_solutions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_tenant_id" integer,
  	"version_slug" varchar,
  	"version_legacy_id" numeric,
  	"version_name" varchar,
  	"version_category" "enum__solutions_v_version_category",
  	"version_label" varchar,
  	"version_tag" varchar,
  	"version_lead" varchar,
  	"version_for_whom" varchar,
  	"version_keywords" varchar,
  	"version_has_live_preview" boolean DEFAULT false,
  	"version_toast" varchar,
  	"version_card_gradient" "enum__solutions_v_version_card_gradient",
  	"version_prices_start" numeric,
  	"version_prices_std" numeric,
  	"version_prices_full" numeric,
  	"version_lead_times_start" varchar,
  	"version_lead_times_std" varchar,
  	"version_lead_times_full" varchar,
  	"version_price_note" varchar,
  	"version_featured_name" varchar,
  	"version_featured_tag" varchar,
  	"version_featured_lead" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__solutions_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_solutions_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "solution_areas_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"solution_id" integer
  );
  
  CREATE TABLE "solution_areas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"key" "enum_solution_areas_key" NOT NULL,
  	"icon" "enum_solution_areas_icon",
  	"short" varchar,
  	"description" varchar,
  	"gain" varchar,
  	"count_label" varchar,
  	"price_from" numeric,
  	"price_label" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cities_hero_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL
  );
  
  CREATE TABLE "cities_hero_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cities_who_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"text" varchar,
  	"cta" varchar,
  	"solution_id" integer
  );
  
  CREATE TABLE "cities_local_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "cities_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "cities_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar NOT NULL,
  	"link_href" varchar NOT NULL
  );
  
  CREATE TABLE "cities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"name" varchar NOT NULL,
  	"locative" varchar,
  	"slug" varchar NOT NULL,
  	"active" boolean DEFAULT false,
  	"hero_eyebrow" varchar,
  	"hero_title" varchar,
  	"hero_title_accent" varchar,
  	"hero_lead" varchar,
  	"who_title" varchar,
  	"who_lead" varchar,
  	"local_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cities_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solutions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "solution_areas_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "cities_id" integer;
  ALTER TABLE "solutions_situations" ADD CONSTRAINT "solutions_situations_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_industry_groups" ADD CONSTRAINT "solutions_industry_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions" ADD CONSTRAINT "solutions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solutions_texts" ADD CONSTRAINT "solutions_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_situations" ADD CONSTRAINT "_solutions_v_version_situations_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_industry_groups" ADD CONSTRAINT "_solutions_v_version_industry_groups_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_parent_id_solutions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v" ADD CONSTRAINT "_solutions_v_version_tenant_id_tenants_id_fk" FOREIGN KEY ("version_tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_solutions_v_texts" ADD CONSTRAINT "_solutions_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_areas_chips" ADD CONSTRAINT "solution_areas_chips_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "solution_areas_chips" ADD CONSTRAINT "solution_areas_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solution_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solution_areas" ADD CONSTRAINT "solution_areas_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cities_hero_ctas" ADD CONSTRAINT "cities_hero_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_hero_badges" ADD CONSTRAINT "cities_hero_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_who_items" ADD CONSTRAINT "cities_who_items_solution_id_solutions_id_fk" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cities_who_items" ADD CONSTRAINT "cities_who_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_local_items" ADD CONSTRAINT "cities_local_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_faq" ADD CONSTRAINT "cities_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities_cta_buttons" ADD CONSTRAINT "cities_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cities" ADD CONSTRAINT "cities_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cities_texts" ADD CONSTRAINT "cities_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "solutions_situations_order_idx" ON "solutions_situations" USING btree ("order");
  CREATE INDEX "solutions_situations_parent_idx" ON "solutions_situations" USING btree ("parent_id");
  CREATE INDEX "solutions_industry_groups_order_idx" ON "solutions_industry_groups" USING btree ("order");
  CREATE INDEX "solutions_industry_groups_parent_idx" ON "solutions_industry_groups" USING btree ("parent_id");
  CREATE INDEX "solutions_tenant_idx" ON "solutions" USING btree ("tenant_id");
  CREATE INDEX "solutions_updated_at_idx" ON "solutions" USING btree ("updated_at");
  CREATE INDEX "solutions_created_at_idx" ON "solutions" USING btree ("created_at");
  CREATE INDEX "solutions__status_idx" ON "solutions" USING btree ("_status");
  CREATE UNIQUE INDEX "tenant_slug_6_idx" ON "solutions" USING btree ("tenant_id","slug");
  CREATE UNIQUE INDEX "tenant_legacyId_idx" ON "solutions" USING btree ("tenant_id","legacy_id");
  CREATE INDEX "solutions_texts_order_parent" ON "solutions_texts" USING btree ("order","parent_id");
  CREATE INDEX "_solutions_v_version_situations_order_idx" ON "_solutions_v_version_situations" USING btree ("order");
  CREATE INDEX "_solutions_v_version_situations_parent_idx" ON "_solutions_v_version_situations" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_version_industry_groups_order_idx" ON "_solutions_v_version_industry_groups" USING btree ("order");
  CREATE INDEX "_solutions_v_version_industry_groups_parent_idx" ON "_solutions_v_version_industry_groups" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_parent_idx" ON "_solutions_v" USING btree ("parent_id");
  CREATE INDEX "_solutions_v_version_version_tenant_idx" ON "_solutions_v" USING btree ("version_tenant_id");
  CREATE INDEX "_solutions_v_version_version_updated_at_idx" ON "_solutions_v" USING btree ("version_updated_at");
  CREATE INDEX "_solutions_v_version_version_created_at_idx" ON "_solutions_v" USING btree ("version_created_at");
  CREATE INDEX "_solutions_v_version_version__status_idx" ON "_solutions_v" USING btree ("version__status");
  CREATE INDEX "_solutions_v_created_at_idx" ON "_solutions_v" USING btree ("created_at");
  CREATE INDEX "_solutions_v_updated_at_idx" ON "_solutions_v" USING btree ("updated_at");
  CREATE INDEX "_solutions_v_latest_idx" ON "_solutions_v" USING btree ("latest");
  CREATE INDEX "version_tenant_version_slug_3_idx" ON "_solutions_v" USING btree ("version_tenant_id","version_slug");
  CREATE INDEX "version_tenant_version_legacyId_idx" ON "_solutions_v" USING btree ("version_tenant_id","version_legacy_id");
  CREATE INDEX "_solutions_v_texts_order_parent" ON "_solutions_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "solution_areas_chips_order_idx" ON "solution_areas_chips" USING btree ("_order");
  CREATE INDEX "solution_areas_chips_parent_id_idx" ON "solution_areas_chips" USING btree ("_parent_id");
  CREATE INDEX "solution_areas_chips_solution_idx" ON "solution_areas_chips" USING btree ("solution_id");
  CREATE INDEX "solution_areas_tenant_idx" ON "solution_areas" USING btree ("tenant_id");
  CREATE INDEX "solution_areas_updated_at_idx" ON "solution_areas" USING btree ("updated_at");
  CREATE INDEX "solution_areas_created_at_idx" ON "solution_areas" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_key_idx" ON "solution_areas" USING btree ("tenant_id","key");
  CREATE INDEX "cities_hero_ctas_order_idx" ON "cities_hero_ctas" USING btree ("_order");
  CREATE INDEX "cities_hero_ctas_parent_id_idx" ON "cities_hero_ctas" USING btree ("_parent_id");
  CREATE INDEX "cities_hero_badges_order_idx" ON "cities_hero_badges" USING btree ("_order");
  CREATE INDEX "cities_hero_badges_parent_id_idx" ON "cities_hero_badges" USING btree ("_parent_id");
  CREATE INDEX "cities_who_items_order_idx" ON "cities_who_items" USING btree ("_order");
  CREATE INDEX "cities_who_items_parent_id_idx" ON "cities_who_items" USING btree ("_parent_id");
  CREATE INDEX "cities_who_items_solution_idx" ON "cities_who_items" USING btree ("solution_id");
  CREATE INDEX "cities_local_items_order_idx" ON "cities_local_items" USING btree ("_order");
  CREATE INDEX "cities_local_items_parent_id_idx" ON "cities_local_items" USING btree ("_parent_id");
  CREATE INDEX "cities_faq_order_idx" ON "cities_faq" USING btree ("_order");
  CREATE INDEX "cities_faq_parent_id_idx" ON "cities_faq" USING btree ("_parent_id");
  CREATE INDEX "cities_cta_buttons_order_idx" ON "cities_cta_buttons" USING btree ("_order");
  CREATE INDEX "cities_cta_buttons_parent_id_idx" ON "cities_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "cities_tenant_idx" ON "cities" USING btree ("tenant_id");
  CREATE INDEX "cities_updated_at_idx" ON "cities" USING btree ("updated_at");
  CREATE INDEX "cities_created_at_idx" ON "cities" USING btree ("created_at");
  CREATE UNIQUE INDEX "tenant_slug_7_idx" ON "cities" USING btree ("tenant_id","slug");
  CREATE INDEX "cities_texts_order_parent" ON "cities_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solutions_fk" FOREIGN KEY ("solutions_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_solution_areas_fk" FOREIGN KEY ("solution_areas_id") REFERENCES "public"."solution_areas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_cities_fk" FOREIGN KEY ("cities_id") REFERENCES "public"."cities"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_solutions_id_idx" ON "payload_locked_documents_rels" USING btree ("solutions_id");
  CREATE INDEX "payload_locked_documents_rels_solution_areas_id_idx" ON "payload_locked_documents_rels" USING btree ("solution_areas_id");
  CREATE INDEX "payload_locked_documents_rels_cities_id_idx" ON "payload_locked_documents_rels" USING btree ("cities_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // `DROP TABLE … CASCADE` below already removes the foreign keys of `payload_locked_documents_rels`
  // to the dropped tables, so the generated `DROP CONSTRAINT` needs `IF EXISTS` (as in biznes_catalog).
  await db.execute(sql`
   ALTER TABLE "solutions_situations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_industry_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solutions_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_version_situations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_version_industry_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_solutions_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solution_areas_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "solution_areas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_hero_ctas" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_hero_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_who_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_local_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cities_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "solutions_situations" CASCADE;
  DROP TABLE "solutions_industry_groups" CASCADE;
  DROP TABLE "solutions" CASCADE;
  DROP TABLE "solutions_texts" CASCADE;
  DROP TABLE "_solutions_v_version_situations" CASCADE;
  DROP TABLE "_solutions_v_version_industry_groups" CASCADE;
  DROP TABLE "_solutions_v" CASCADE;
  DROP TABLE "_solutions_v_texts" CASCADE;
  DROP TABLE "solution_areas_chips" CASCADE;
  DROP TABLE "solution_areas" CASCADE;
  DROP TABLE "cities_hero_ctas" CASCADE;
  DROP TABLE "cities_hero_badges" CASCADE;
  DROP TABLE "cities_who_items" CASCADE;
  DROP TABLE "cities_local_items" CASCADE;
  DROP TABLE "cities_faq" CASCADE;
  DROP TABLE "cities_cta_buttons" CASCADE;
  DROP TABLE "cities" CASCADE;
  DROP TABLE "cities_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_solutions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_solution_areas_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_cities_fk";
  
  DROP INDEX "payload_locked_documents_rels_solutions_id_idx";
  DROP INDEX "payload_locked_documents_rels_solution_areas_id_idx";
  DROP INDEX "payload_locked_documents_rels_cities_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "solutions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "solution_areas_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "cities_id";
  DROP TYPE "public"."enum_solutions_situations";
  DROP TYPE "public"."enum_solutions_industry_groups";
  DROP TYPE "public"."enum_solutions_category";
  DROP TYPE "public"."enum_solutions_card_gradient";
  DROP TYPE "public"."enum_solutions_status";
  DROP TYPE "public"."enum__solutions_v_version_situations";
  DROP TYPE "public"."enum__solutions_v_version_industry_groups";
  DROP TYPE "public"."enum__solutions_v_version_category";
  DROP TYPE "public"."enum__solutions_v_version_card_gradient";
  DROP TYPE "public"."enum__solutions_v_version_status";
  DROP TYPE "public"."enum_solution_areas_key";
  DROP TYPE "public"."enum_solution_areas_icon";`)
}

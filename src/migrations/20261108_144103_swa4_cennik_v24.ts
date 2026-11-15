import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_pricing_featured_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sw_pricing_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sw_pricing_included_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sw_pricing_featured_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sw_pricing_tabs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sw_pricing_included_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_sw_pricing_featured_points" CASCADE;
  DROP TABLE "pages_blocks_sw_pricing_tabs" CASCADE;
  DROP TABLE "pages_blocks_sw_pricing_included_items" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_featured_points" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_included_items" CASCADE;
  ALTER TABLE "pages_blocks_sw_pricing" DROP CONSTRAINT "pages_blocks_sw_pricing_featured_id_solutions_id_fk";
  
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP CONSTRAINT "_pages_v_blocks_sw_pricing_featured_id_solutions_id_fk";
  
  DROP INDEX "pages_blocks_sw_pricing_featured_idx";
  DROP INDEX "_pages_v_blocks_sw_pricing_featured_idx";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "featured_id";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "featured_badge";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "table_eyebrow";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "table_title";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "included_eyebrow";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "included_title";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_title";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_text";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_primary_label";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_primary_href";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_secondary_label";
  ALTER TABLE "pages_blocks_sw_pricing" DROP COLUMN "cta_secondary_href";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "featured_id";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "featured_badge";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "table_eyebrow";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "table_title";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "included_eyebrow";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "included_title";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_title";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_text";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_primary_label";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_primary_href";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_secondary_label";
  ALTER TABLE "_pages_v_blocks_sw_pricing" DROP COLUMN "cta_secondary_href";
  DROP TYPE "public"."enum_pages_blocks_sw_pricing_tabs_category";
  DROP TYPE "public"."enum__pages_v_blocks_sw_pricing_tabs_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_pricing_tabs_category" AS ENUM('strony', 'systemy', 'aplikacje', 'automatyzacje', 'opieka');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_pricing_tabs_category" AS ENUM('strony', 'systemy', 'aplikacje', 'automatyzacje', 'opieka');
  CREATE TABLE "pages_blocks_sw_pricing_featured_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_pricing_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"category" "enum_pages_blocks_sw_pricing_tabs_category",
  	"label" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_pricing_included_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_pricing_featured_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_pricing_tabs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum__pages_v_blocks_sw_pricing_tabs_category",
  	"label" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_pricing_included_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "featured_id" integer;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "featured_badge" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "table_eyebrow" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "table_title" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "included_eyebrow" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "included_title" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_text" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_primary_label" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_primary_href" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_secondary_label" varchar;
  ALTER TABLE "pages_blocks_sw_pricing" ADD COLUMN "cta_secondary_href" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "featured_id" integer;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "featured_badge" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "table_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "table_title" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "included_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "included_title" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_title" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_text" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_primary_label" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_primary_href" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_secondary_label" varchar;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD COLUMN "cta_secondary_href" varchar;
  ALTER TABLE "pages_blocks_sw_pricing_featured_points" ADD CONSTRAINT "pages_blocks_sw_pricing_featured_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing_tabs" ADD CONSTRAINT "pages_blocks_sw_pricing_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing_included_items" ADD CONSTRAINT "pages_blocks_sw_pricing_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_featured_points" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_featured_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_tabs" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_included_items" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_pricing_featured_points_order_idx" ON "pages_blocks_sw_pricing_featured_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_featured_points_parent_id_idx" ON "pages_blocks_sw_pricing_featured_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_tabs_order_idx" ON "pages_blocks_sw_pricing_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_tabs_parent_id_idx" ON "pages_blocks_sw_pricing_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_included_items_order_idx" ON "pages_blocks_sw_pricing_included_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_included_items_parent_id_idx" ON "pages_blocks_sw_pricing_included_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_points_order_idx" ON "_pages_v_blocks_sw_pricing_featured_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_points_parent_id_idx" ON "_pages_v_blocks_sw_pricing_featured_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_tabs_order_idx" ON "_pages_v_blocks_sw_pricing_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_tabs_parent_id_idx" ON "_pages_v_blocks_sw_pricing_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_included_items_order_idx" ON "_pages_v_blocks_sw_pricing_included_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_included_items_parent_id_idx" ON "_pages_v_blocks_sw_pricing_included_items" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_sw_pricing" ADD CONSTRAINT "pages_blocks_sw_pricing_featured_id_solutions_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_featured_id_solutions_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_pricing_featured_idx" ON "pages_blocks_sw_pricing" USING btree ("featured_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_idx" ON "_pages_v_blocks_sw_pricing" USING btree ("featured_id");`)
}

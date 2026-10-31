import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
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
  
  CREATE TABLE "pages_blocks_sw_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"featured_id" integer,
  	"featured_badge" varchar,
  	"table_eyebrow" varchar,
  	"table_title" varchar,
  	"care_eyebrow" varchar,
  	"care_title" varchar,
  	"care_lead" varchar,
  	"care_button" varchar,
  	"care_note" varchar,
  	"audit_eyebrow" varchar,
  	"audit_title" varchar,
  	"audit_lead" varchar,
  	"audit_button" varchar,
  	"audit_href" varchar,
  	"included_eyebrow" varchar,
  	"included_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_primary_label" varchar,
  	"cta_primary_href" varchar,
  	"cta_secondary_label" varchar,
  	"cta_secondary_href" varchar,
  	"block_name" varchar
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
  
  CREATE TABLE "_pages_v_blocks_sw_pricing" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"featured_id" integer,
  	"featured_badge" varchar,
  	"table_eyebrow" varchar,
  	"table_title" varchar,
  	"care_eyebrow" varchar,
  	"care_title" varchar,
  	"care_lead" varchar,
  	"care_button" varchar,
  	"care_note" varchar,
  	"audit_eyebrow" varchar,
  	"audit_title" varchar,
  	"audit_lead" varchar,
  	"audit_button" varchar,
  	"audit_href" varchar,
  	"included_eyebrow" varchar,
  	"included_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_primary_label" varchar,
  	"cta_primary_href" varchar,
  	"cta_secondary_label" varchar,
  	"cta_secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_pricing_featured_points" ADD CONSTRAINT "pages_blocks_sw_pricing_featured_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing_tabs" ADD CONSTRAINT "pages_blocks_sw_pricing_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing_included_items" ADD CONSTRAINT "pages_blocks_sw_pricing_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing" ADD CONSTRAINT "pages_blocks_sw_pricing_featured_id_solutions_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_pricing" ADD CONSTRAINT "pages_blocks_sw_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_featured_points" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_featured_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_tabs" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_tabs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing_included_items" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_included_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_featured_id_solutions_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."solutions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_pricing" ADD CONSTRAINT "_pages_v_blocks_sw_pricing_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_pricing_featured_points_order_idx" ON "pages_blocks_sw_pricing_featured_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_featured_points_parent_id_idx" ON "pages_blocks_sw_pricing_featured_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_tabs_order_idx" ON "pages_blocks_sw_pricing_tabs" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_tabs_parent_id_idx" ON "pages_blocks_sw_pricing_tabs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_included_items_order_idx" ON "pages_blocks_sw_pricing_included_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_included_items_parent_id_idx" ON "pages_blocks_sw_pricing_included_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_order_idx" ON "pages_blocks_sw_pricing" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_pricing_parent_id_idx" ON "pages_blocks_sw_pricing" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_pricing_path_idx" ON "pages_blocks_sw_pricing" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_pricing_featured_idx" ON "pages_blocks_sw_pricing" USING btree ("featured_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_points_order_idx" ON "_pages_v_blocks_sw_pricing_featured_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_points_parent_id_idx" ON "_pages_v_blocks_sw_pricing_featured_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_tabs_order_idx" ON "_pages_v_blocks_sw_pricing_tabs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_tabs_parent_id_idx" ON "_pages_v_blocks_sw_pricing_tabs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_included_items_order_idx" ON "_pages_v_blocks_sw_pricing_included_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_included_items_parent_id_idx" ON "_pages_v_blocks_sw_pricing_included_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_order_idx" ON "_pages_v_blocks_sw_pricing" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_pricing_parent_id_idx" ON "_pages_v_blocks_sw_pricing" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_pricing_path_idx" ON "_pages_v_blocks_sw_pricing" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_pricing_featured_idx" ON "_pages_v_blocks_sw_pricing" USING btree ("featured_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_pricing_featured_points" CASCADE;
  DROP TABLE "pages_blocks_sw_pricing_tabs" CASCADE;
  DROP TABLE "pages_blocks_sw_pricing_included_items" CASCADE;
  DROP TABLE "pages_blocks_sw_pricing" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_featured_points" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_tabs" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing_included_items" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_pricing" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_sw_pricing_tabs_category";
  DROP TYPE "public"."enum__pages_v_blocks_sw_pricing_tabs_category";`)
}

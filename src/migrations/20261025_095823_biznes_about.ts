import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_bz_page_hero_variant" ADD VALUE 'stats';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" ADD VALUE 'stats';
  CREATE TABLE "pages_blocks_bz_page_hero_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"current" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_bz_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_brands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_location" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"current" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_brands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_location" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "since_year" numeric;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "since_year" numeric;
  ALTER TABLE "pages_blocks_bz_page_hero_figures" ADD CONSTRAINT "pages_blocks_bz_page_hero_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_lines_lines" ADD CONSTRAINT "pages_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_lines" ADD CONSTRAINT "pages_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_brands" ADD CONSTRAINT "pages_blocks_bz_brands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_location" ADD CONSTRAINT "pages_blocks_bz_location_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_figures" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_brands" ADD CONSTRAINT "_pages_v_blocks_bz_brands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_location" ADD CONSTRAINT "_pages_v_blocks_bz_location_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_figures_order_idx" ON "pages_blocks_bz_page_hero_figures" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_figures_parent_id_idx" ON "pages_blocks_bz_page_hero_figures" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_lines_order_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_lines_parent_id_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_order_idx" ON "pages_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_parent_id_idx" ON "pages_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_path_idx" ON "pages_blocks_bz_lines" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_brands_order_idx" ON "pages_blocks_bz_brands" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_brands_parent_id_idx" ON "pages_blocks_bz_brands" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_brands_path_idx" ON "pages_blocks_bz_brands" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_location_order_idx" ON "pages_blocks_bz_location" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_location_parent_id_idx" ON "pages_blocks_bz_location" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_location_path_idx" ON "pages_blocks_bz_location" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_figures_order_idx" ON "_pages_v_blocks_bz_page_hero_figures" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_figures_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_figures" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_order_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_order_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_path_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_brands_order_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_brands_parent_id_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_brands_path_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_location_order_idx" ON "_pages_v_blocks_bz_location" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_location_parent_id_idx" ON "_pages_v_blocks_bz_location" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_location_path_idx" ON "_pages_v_blocks_bz_location" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_page_hero_figures" CASCADE;
  DROP TABLE "pages_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "pages_blocks_bz_lines" CASCADE;
  DROP TABLE "pages_blocks_bz_brands" CASCADE;
  DROP TABLE "pages_blocks_bz_location" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_figures" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_brands" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_location" CASCADE;
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_variant" AS ENUM('card', 'photo', 'screen');
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_page_hero_variant" USING "variant"::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" AS ENUM('card', 'photo', 'screen');
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "since_year";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "since_year";`)
}

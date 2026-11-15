import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_cards_tone" AS ENUM('accent', 'green');
  CREATE TYPE "public"."enum_pages_blocks_bz_modules_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_panels_panels_style" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_tone" AS ENUM('accent', 'green');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_modules_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_panels_panels_style" AS ENUM('light', 'dark');
  ALTER TYPE "public"."enum_pages_blocks_bz_page_hero_variant" ADD VALUE 'photo';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" ADD VALUE 'photo';
  CREATE TABLE "pages_blocks_bz_page_hero_photo_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_modules_modules_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_modules_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"subtitle" varchar,
  	"icon" "enum_pages_blocks_bz_modules_modules_icon",
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_order_flow_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_order_flow_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_order_flow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"image_id" integer,
  	"ticket" varchar,
  	"note" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_kits_kits" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tag" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_kits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_timeline_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_panels_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"style" "enum_pages_blocks_bz_panels_panels_style" DEFAULT 'light',
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_photo_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_modules_modules_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_modules_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"subtitle" varchar,
  	"icon" "enum__pages_v_blocks_bz_modules_modules_icon",
  	"description" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_order_flow_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_order_flow_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_order_flow" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"image_id" integer,
  	"ticket" varchar,
  	"note" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_kits_kits" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"tag" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_kits" (
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
  
  CREATE TABLE "_pages_v_blocks_bz_timeline_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_timeline" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_panels_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"style" "enum__pages_v_blocks_bz_panels_panels_style" DEFAULT 'light',
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "photo_image_id" integer;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "photo_partner_id" integer;
  ALTER TABLE "pages_blocks_bz_cards" ADD COLUMN "tone" "enum_pages_blocks_bz_cards_tone" DEFAULT 'accent';
  ALTER TABLE "pages_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "photo_image_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "photo_partner_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_cards" ADD COLUMN "tone" "enum__pages_v_blocks_bz_cards_tone" DEFAULT 'accent';
  ALTER TABLE "_pages_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "pages_blocks_bz_page_hero_photo_stats" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules_modules_points" ADD CONSTRAINT "pages_blocks_bz_modules_modules_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_modules_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules_modules" ADD CONSTRAINT "pages_blocks_bz_modules_modules_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules_modules" ADD CONSTRAINT "pages_blocks_bz_modules_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules" ADD CONSTRAINT "pages_blocks_bz_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_order_flow_badges" ADD CONSTRAINT "pages_blocks_bz_order_flow_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_order_flow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_order_flow_steps" ADD CONSTRAINT "pages_blocks_bz_order_flow_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_order_flow_steps" ADD CONSTRAINT "pages_blocks_bz_order_flow_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_order_flow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_order_flow" ADD CONSTRAINT "pages_blocks_bz_order_flow_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_order_flow" ADD CONSTRAINT "pages_blocks_bz_order_flow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_kits_kits" ADD CONSTRAINT "pages_blocks_bz_kits_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_kits" ADD CONSTRAINT "pages_blocks_bz_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_timeline_steps" ADD CONSTRAINT "pages_blocks_bz_timeline_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_timeline" ADD CONSTRAINT "pages_blocks_bz_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_panels_panels" ADD CONSTRAINT "pages_blocks_bz_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_panels" ADD CONSTRAINT "pages_blocks_bz_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_photo_stats" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules_points" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_modules_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_order_flow_badges" ADD CONSTRAINT "_pages_v_blocks_bz_order_flow_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_order_flow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_order_flow_steps" ADD CONSTRAINT "_pages_v_blocks_bz_order_flow_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_order_flow_steps" ADD CONSTRAINT "_pages_v_blocks_bz_order_flow_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_order_flow"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_order_flow" ADD CONSTRAINT "_pages_v_blocks_bz_order_flow_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_order_flow" ADD CONSTRAINT "_pages_v_blocks_bz_order_flow_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_kits_kits" ADD CONSTRAINT "_pages_v_blocks_bz_kits_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_kits" ADD CONSTRAINT "_pages_v_blocks_bz_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_timeline_steps" ADD CONSTRAINT "_pages_v_blocks_bz_timeline_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_timeline"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_timeline" ADD CONSTRAINT "_pages_v_blocks_bz_timeline_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_panels_panels" ADD CONSTRAINT "_pages_v_blocks_bz_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_panels" ADD CONSTRAINT "_pages_v_blocks_bz_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_photo_stats_order_idx" ON "pages_blocks_bz_page_hero_photo_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_stats_parent_id_idx" ON "pages_blocks_bz_page_hero_photo_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_modules_points_order_idx" ON "pages_blocks_bz_modules_modules_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_modules_points_parent_id_idx" ON "pages_blocks_bz_modules_modules_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_modules_order_idx" ON "pages_blocks_bz_modules_modules" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_modules_parent_id_idx" ON "pages_blocks_bz_modules_modules" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_modules_image_idx" ON "pages_blocks_bz_modules_modules" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_modules_order_idx" ON "pages_blocks_bz_modules" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_parent_id_idx" ON "pages_blocks_bz_modules" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_path_idx" ON "pages_blocks_bz_modules" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_order_flow_badges_order_idx" ON "pages_blocks_bz_order_flow_badges" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_order_flow_badges_parent_id_idx" ON "pages_blocks_bz_order_flow_badges" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_order_flow_steps_order_idx" ON "pages_blocks_bz_order_flow_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_order_flow_steps_parent_id_idx" ON "pages_blocks_bz_order_flow_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_order_flow_steps_image_idx" ON "pages_blocks_bz_order_flow_steps" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_order_flow_order_idx" ON "pages_blocks_bz_order_flow" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_order_flow_parent_id_idx" ON "pages_blocks_bz_order_flow" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_order_flow_path_idx" ON "pages_blocks_bz_order_flow" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_order_flow_image_idx" ON "pages_blocks_bz_order_flow" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_kits_kits_order_idx" ON "pages_blocks_bz_kits_kits" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_kits_kits_parent_id_idx" ON "pages_blocks_bz_kits_kits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_kits_order_idx" ON "pages_blocks_bz_kits" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_kits_parent_id_idx" ON "pages_blocks_bz_kits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_kits_path_idx" ON "pages_blocks_bz_kits" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_timeline_steps_order_idx" ON "pages_blocks_bz_timeline_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_timeline_steps_parent_id_idx" ON "pages_blocks_bz_timeline_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_timeline_order_idx" ON "pages_blocks_bz_timeline" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_timeline_parent_id_idx" ON "pages_blocks_bz_timeline" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_timeline_path_idx" ON "pages_blocks_bz_timeline" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_panels_panels_order_idx" ON "pages_blocks_bz_panels_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_panels_panels_parent_id_idx" ON "pages_blocks_bz_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_panels_order_idx" ON "pages_blocks_bz_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_panels_parent_id_idx" ON "pages_blocks_bz_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_panels_path_idx" ON "pages_blocks_bz_panels" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_stats_order_idx" ON "_pages_v_blocks_bz_page_hero_photo_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_stats_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_photo_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_points_order_idx" ON "_pages_v_blocks_bz_modules_modules_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_points_parent_id_idx" ON "_pages_v_blocks_bz_modules_modules_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_order_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_parent_id_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_image_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_order_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_parent_id_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_path_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_badges_order_idx" ON "_pages_v_blocks_bz_order_flow_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_badges_parent_id_idx" ON "_pages_v_blocks_bz_order_flow_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_steps_order_idx" ON "_pages_v_blocks_bz_order_flow_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_steps_parent_id_idx" ON "_pages_v_blocks_bz_order_flow_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_steps_image_idx" ON "_pages_v_blocks_bz_order_flow_steps" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_order_idx" ON "_pages_v_blocks_bz_order_flow" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_parent_id_idx" ON "_pages_v_blocks_bz_order_flow" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_path_idx" ON "_pages_v_blocks_bz_order_flow" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_order_flow_image_idx" ON "_pages_v_blocks_bz_order_flow" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_kits_kits_order_idx" ON "_pages_v_blocks_bz_kits_kits" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_kits_kits_parent_id_idx" ON "_pages_v_blocks_bz_kits_kits" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_kits_order_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_kits_parent_id_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_kits_path_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_timeline_steps_order_idx" ON "_pages_v_blocks_bz_timeline_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_timeline_steps_parent_id_idx" ON "_pages_v_blocks_bz_timeline_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_timeline_order_idx" ON "_pages_v_blocks_bz_timeline" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_timeline_parent_id_idx" ON "_pages_v_blocks_bz_timeline" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_timeline_path_idx" ON "_pages_v_blocks_bz_timeline" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_panels_panels_order_idx" ON "_pages_v_blocks_bz_panels_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_panels_panels_parent_id_idx" ON "_pages_v_blocks_bz_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_panels_order_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_panels_parent_id_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_panels_path_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_path");
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_image_id_media_id_fk" FOREIGN KEY ("photo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_partner_id_partners_id_fk" FOREIGN KEY ("photo_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_image_id_media_id_fk" FOREIGN KEY ("photo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_partner_id_partners_id_fk" FOREIGN KEY ("photo_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_photo_photo_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("photo_image_id");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_photo_partner_idx" ON "pages_blocks_bz_page_hero" USING btree ("photo_partner_id");
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_photo_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("photo_image_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_photo_partner_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("photo_partner_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_page_hero_photo_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules_modules_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_order_flow_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_order_flow_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_order_flow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_kits_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_timeline_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_photo_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_order_flow_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_order_flow_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_order_flow" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_kits_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_timeline_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_timeline" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_panels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_bz_page_hero_photo_stats" CASCADE;
  DROP TABLE "pages_blocks_bz_modules_modules_points" CASCADE;
  DROP TABLE "pages_blocks_bz_modules_modules" CASCADE;
  DROP TABLE "pages_blocks_bz_modules" CASCADE;
  DROP TABLE "pages_blocks_bz_order_flow_badges" CASCADE;
  DROP TABLE "pages_blocks_bz_order_flow_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_order_flow" CASCADE;
  DROP TABLE "pages_blocks_bz_kits_kits" CASCADE;
  DROP TABLE "pages_blocks_bz_kits" CASCADE;
  DROP TABLE "pages_blocks_bz_timeline_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_timeline" CASCADE;
  DROP TABLE "pages_blocks_bz_panels_panels" CASCADE;
  DROP TABLE "pages_blocks_bz_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_photo_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_modules_modules_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_modules_modules" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_modules" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_order_flow_badges" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_order_flow_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_order_flow" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_kits_kits" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_kits" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_timeline_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_timeline" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_panels_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_panels" CASCADE;
  ALTER TABLE "pages_blocks_bz_page_hero" DROP CONSTRAINT "pages_blocks_bz_page_hero_photo_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_bz_page_hero" DROP CONSTRAINT "pages_blocks_bz_page_hero_photo_partner_id_partners_id_fk";
  
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_products_fk";
  
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_partner_id_partners_id_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_products_fk";
  
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_variant" AS ENUM('card');
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_page_hero_variant" USING "variant"::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" AS ENUM('card');
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  DROP INDEX "pages_blocks_bz_page_hero_photo_photo_image_idx";
  DROP INDEX "pages_blocks_bz_page_hero_photo_photo_partner_idx";
  DROP INDEX "pages_rels_products_id_idx";
  DROP INDEX "_pages_v_blocks_bz_page_hero_photo_photo_image_idx";
  DROP INDEX "_pages_v_blocks_bz_page_hero_photo_photo_partner_idx";
  DROP INDEX "_pages_v_rels_products_id_idx";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "photo_image_id";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "photo_partner_id";
  ALTER TABLE "pages_blocks_bz_cards" DROP COLUMN "tone";
  ALTER TABLE "pages_rels" DROP COLUMN "products_id";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "photo_image_id";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "photo_partner_id";
  ALTER TABLE "_pages_v_blocks_bz_cards" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "products_id";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_modules_modules_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_panels_panels_style";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_modules_modules_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_panels_panels_style";`)
}

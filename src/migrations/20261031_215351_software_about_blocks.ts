import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_photos_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_nodes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_visual" AS ENUM('none', 'photos', 'lines');
  CREATE TYPE "public"."enum_pages_blocks_sw_steps_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_steps_variant" AS ENUM('stats', 'cards', 'timeline');
  CREATE TYPE "public"."enum_pages_blocks_sw_team_members_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum_pages_blocks_sw_team_variant" AS ENUM('people', 'places');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_lines_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_examples_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_variant" AS ENUM('lines', 'examples');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_photos_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_nodes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_visual" AS ENUM('none', 'photos', 'lines');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_steps_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_steps_variant" AS ENUM('stats', 'cards', 'timeline');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_team_members_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_team_variant" AS ENUM('people', 'places');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_lines_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_examples_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_variant" AS ENUM('lines', 'examples');
  CREATE TABLE "pages_blocks_sw_page_hero_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"photo_caption" varchar,
  	"tone" "enum_pages_blocks_sw_page_hero_photos_tone" DEFAULT 'violet'
  );
  
  CREATE TABLE "pages_blocks_sw_page_hero_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" "enum_pages_blocks_sw_page_hero_nodes_icon",
  	"text" varchar,
  	"current" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_sw_page_hero" (
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
  	"visual" "enum_pages_blocks_sw_page_hero_visual" DEFAULT 'none',
  	"badge_status" varchar,
  	"badge_title" varchar,
  	"badge_text" varchar,
  	"hub_title" varchar,
  	"hub_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"marker" varchar,
  	"icon" "enum_pages_blocks_sw_steps_items_icon",
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_sw_steps_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"name" varchar,
  	"text" varchar,
  	"details" varchar,
  	"photo_id" integer,
  	"photo_caption" varchar,
  	"tone" "enum_pages_blocks_sw_team_members_tone" DEFAULT 'violet'
  );
  
  CREATE TABLE "pages_blocks_sw_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_sw_team_variant" DEFAULT 'people',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_lines_lines_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" "enum_pages_blocks_sw_lines_lines_icon",
  	"address" varchar,
  	"href" varchar,
  	"cta" varchar,
  	"current" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_sw_lines_examples_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar,
  	"icon" "enum_pages_blocks_sw_lines_examples_rows_icon",
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_lines_examples" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_sw_lines_variant" DEFAULT 'lines',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_page_hero_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"photo_caption" varchar,
  	"tone" "enum__pages_v_blocks_sw_page_hero_photos_tone" DEFAULT 'violet',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_page_hero_nodes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" "enum__pages_v_blocks_sw_page_hero_nodes_icon",
  	"text" varchar,
  	"current" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_page_hero" (
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
  	"visual" "enum__pages_v_blocks_sw_page_hero_visual" DEFAULT 'none',
  	"badge_status" varchar,
  	"badge_title" varchar,
  	"badge_text" varchar,
  	"hub_title" varchar,
  	"hub_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_steps_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"marker" varchar,
  	"icon" "enum__pages_v_blocks_sw_steps_items_icon",
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_sw_steps_variant" DEFAULT 'cards',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"name" varchar,
  	"text" varchar,
  	"details" varchar,
  	"photo_id" integer,
  	"photo_caption" varchar,
  	"tone" "enum__pages_v_blocks_sw_team_members_tone" DEFAULT 'violet',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_team" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_sw_team_variant" DEFAULT 'people',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_lines_lines_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"icon" "enum__pages_v_blocks_sw_lines_lines_icon",
  	"address" varchar,
  	"href" varchar,
  	"cta" varchar,
  	"current" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_lines_examples_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" varchar,
  	"icon" "enum__pages_v_blocks_sw_lines_examples_rows_icon",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_lines_examples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_sw_lines_variant" DEFAULT 'lines',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_page_hero_photos" ADD CONSTRAINT "pages_blocks_sw_page_hero_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_page_hero_photos" ADD CONSTRAINT "pages_blocks_sw_page_hero_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_page_hero_nodes" ADD CONSTRAINT "pages_blocks_sw_page_hero_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_page_hero" ADD CONSTRAINT "pages_blocks_sw_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_steps_items" ADD CONSTRAINT "pages_blocks_sw_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_steps" ADD CONSTRAINT "pages_blocks_sw_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_team_members" ADD CONSTRAINT "pages_blocks_sw_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_team_members" ADD CONSTRAINT "pages_blocks_sw_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_team" ADD CONSTRAINT "pages_blocks_sw_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_lines_lines_points" ADD CONSTRAINT "pages_blocks_sw_lines_lines_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_lines_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_lines_lines" ADD CONSTRAINT "pages_blocks_sw_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_lines_examples_rows" ADD CONSTRAINT "pages_blocks_sw_lines_examples_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_lines_examples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_lines_examples" ADD CONSTRAINT "pages_blocks_sw_lines_examples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_lines" ADD CONSTRAINT "pages_blocks_sw_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_page_hero_photos" ADD CONSTRAINT "_pages_v_blocks_sw_page_hero_photos_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_page_hero_photos" ADD CONSTRAINT "_pages_v_blocks_sw_page_hero_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_page_hero_nodes" ADD CONSTRAINT "_pages_v_blocks_sw_page_hero_nodes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_page_hero" ADD CONSTRAINT "_pages_v_blocks_sw_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_steps_items" ADD CONSTRAINT "_pages_v_blocks_sw_steps_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_steps" ADD CONSTRAINT "_pages_v_blocks_sw_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_team_members" ADD CONSTRAINT "_pages_v_blocks_sw_team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_team_members" ADD CONSTRAINT "_pages_v_blocks_sw_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_team" ADD CONSTRAINT "_pages_v_blocks_sw_team_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_lines_lines_points" ADD CONSTRAINT "_pages_v_blocks_sw_lines_lines_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_lines_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_lines_lines" ADD CONSTRAINT "_pages_v_blocks_sw_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_lines_examples_rows" ADD CONSTRAINT "_pages_v_blocks_sw_lines_examples_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_lines_examples"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_lines_examples" ADD CONSTRAINT "_pages_v_blocks_sw_lines_examples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_lines" ADD CONSTRAINT "_pages_v_blocks_sw_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_page_hero_photos_order_idx" ON "pages_blocks_sw_page_hero_photos" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_page_hero_photos_parent_id_idx" ON "pages_blocks_sw_page_hero_photos" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_page_hero_photos_photo_idx" ON "pages_blocks_sw_page_hero_photos" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_sw_page_hero_nodes_order_idx" ON "pages_blocks_sw_page_hero_nodes" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_page_hero_nodes_parent_id_idx" ON "pages_blocks_sw_page_hero_nodes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_page_hero_order_idx" ON "pages_blocks_sw_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_page_hero_parent_id_idx" ON "pages_blocks_sw_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_page_hero_path_idx" ON "pages_blocks_sw_page_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_steps_items_order_idx" ON "pages_blocks_sw_steps_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_steps_items_parent_id_idx" ON "pages_blocks_sw_steps_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_steps_order_idx" ON "pages_blocks_sw_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_steps_parent_id_idx" ON "pages_blocks_sw_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_steps_path_idx" ON "pages_blocks_sw_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_team_members_order_idx" ON "pages_blocks_sw_team_members" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_team_members_parent_id_idx" ON "pages_blocks_sw_team_members" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_team_members_photo_idx" ON "pages_blocks_sw_team_members" USING btree ("photo_id");
  CREATE INDEX "pages_blocks_sw_team_order_idx" ON "pages_blocks_sw_team" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_team_parent_id_idx" ON "pages_blocks_sw_team" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_team_path_idx" ON "pages_blocks_sw_team" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_lines_lines_points_order_idx" ON "pages_blocks_sw_lines_lines_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_lines_lines_points_parent_id_idx" ON "pages_blocks_sw_lines_lines_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_lines_lines_order_idx" ON "pages_blocks_sw_lines_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_lines_lines_parent_id_idx" ON "pages_blocks_sw_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_lines_examples_rows_order_idx" ON "pages_blocks_sw_lines_examples_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_lines_examples_rows_parent_id_idx" ON "pages_blocks_sw_lines_examples_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_lines_examples_order_idx" ON "pages_blocks_sw_lines_examples" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_lines_examples_parent_id_idx" ON "pages_blocks_sw_lines_examples" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_lines_order_idx" ON "pages_blocks_sw_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_lines_parent_id_idx" ON "pages_blocks_sw_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_lines_path_idx" ON "pages_blocks_sw_lines" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_photos_order_idx" ON "_pages_v_blocks_sw_page_hero_photos" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_photos_parent_id_idx" ON "_pages_v_blocks_sw_page_hero_photos" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_photos_photo_idx" ON "_pages_v_blocks_sw_page_hero_photos" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_nodes_order_idx" ON "_pages_v_blocks_sw_page_hero_nodes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_nodes_parent_id_idx" ON "_pages_v_blocks_sw_page_hero_nodes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_order_idx" ON "_pages_v_blocks_sw_page_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_parent_id_idx" ON "_pages_v_blocks_sw_page_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_page_hero_path_idx" ON "_pages_v_blocks_sw_page_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_steps_items_order_idx" ON "_pages_v_blocks_sw_steps_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_steps_items_parent_id_idx" ON "_pages_v_blocks_sw_steps_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_steps_order_idx" ON "_pages_v_blocks_sw_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_steps_parent_id_idx" ON "_pages_v_blocks_sw_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_steps_path_idx" ON "_pages_v_blocks_sw_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_team_members_order_idx" ON "_pages_v_blocks_sw_team_members" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_team_members_parent_id_idx" ON "_pages_v_blocks_sw_team_members" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_team_members_photo_idx" ON "_pages_v_blocks_sw_team_members" USING btree ("photo_id");
  CREATE INDEX "_pages_v_blocks_sw_team_order_idx" ON "_pages_v_blocks_sw_team" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_team_parent_id_idx" ON "_pages_v_blocks_sw_team" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_team_path_idx" ON "_pages_v_blocks_sw_team" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_lines_lines_points_order_idx" ON "_pages_v_blocks_sw_lines_lines_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_lines_lines_points_parent_id_idx" ON "_pages_v_blocks_sw_lines_lines_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_lines_lines_order_idx" ON "_pages_v_blocks_sw_lines_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_lines_lines_parent_id_idx" ON "_pages_v_blocks_sw_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_lines_examples_rows_order_idx" ON "_pages_v_blocks_sw_lines_examples_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_lines_examples_rows_parent_id_idx" ON "_pages_v_blocks_sw_lines_examples_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_lines_examples_order_idx" ON "_pages_v_blocks_sw_lines_examples" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_lines_examples_parent_id_idx" ON "_pages_v_blocks_sw_lines_examples" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_lines_order_idx" ON "_pages_v_blocks_sw_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_lines_parent_id_idx" ON "_pages_v_blocks_sw_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_lines_path_idx" ON "_pages_v_blocks_sw_lines" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_page_hero_photos" CASCADE;
  DROP TABLE "pages_blocks_sw_page_hero_nodes" CASCADE;
  DROP TABLE "pages_blocks_sw_page_hero" CASCADE;
  DROP TABLE "pages_blocks_sw_steps_items" CASCADE;
  DROP TABLE "pages_blocks_sw_steps" CASCADE;
  DROP TABLE "pages_blocks_sw_team_members" CASCADE;
  DROP TABLE "pages_blocks_sw_team" CASCADE;
  DROP TABLE "pages_blocks_sw_lines_lines_points" CASCADE;
  DROP TABLE "pages_blocks_sw_lines_lines" CASCADE;
  DROP TABLE "pages_blocks_sw_lines_examples_rows" CASCADE;
  DROP TABLE "pages_blocks_sw_lines_examples" CASCADE;
  DROP TABLE "pages_blocks_sw_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_page_hero_photos" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_page_hero_nodes" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_page_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_steps_items" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_team_members" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_team" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_lines_lines_points" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_lines_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_lines_examples_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_lines_examples" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_lines" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_photos_tone";
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_nodes_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_visual";
  DROP TYPE "public"."enum_pages_blocks_sw_steps_items_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_steps_variant";
  DROP TYPE "public"."enum_pages_blocks_sw_team_members_tone";
  DROP TYPE "public"."enum_pages_blocks_sw_team_variant";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_lines_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_examples_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_photos_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_nodes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_visual";
  DROP TYPE "public"."enum__pages_v_blocks_sw_steps_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_steps_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_team_members_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_team_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_lines_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_examples_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_variant";`)
}

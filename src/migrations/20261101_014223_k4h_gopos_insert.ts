import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_section_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements');
  CREATE TYPE "public"."enum_pages_blocks_bz_section_surface" AS ENUM('default', 'muted', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_surface" AS ENUM('default', 'muted', 'dark');
  CREATE TABLE "pages_blocks_bz_section_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"label" varchar,
  	"icon" "enum_pages_blocks_bz_section_items_icon",
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_bz_section_variant",
  	"anchor" varchar,
  	"surface" "enum_pages_blocks_bz_section_surface" DEFAULT 'default',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"source" varchar,
  	"source_url" varchar,
  	"data" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_section_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"label" varchar,
  	"icon" "enum__pages_v_blocks_bz_section_items_icon",
  	"text" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_bz_section_variant",
  	"anchor" varchar,
  	"surface" "enum__pages_v_blocks_bz_section_surface" DEFAULT 'default',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"source" varchar,
  	"source_url" varchar,
  	"data" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_section_items" ADD CONSTRAINT "pages_blocks_bz_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_section" ADD CONSTRAINT "pages_blocks_bz_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_section_items" ADD CONSTRAINT "_pages_v_blocks_bz_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_section" ADD CONSTRAINT "_pages_v_blocks_bz_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_section_items_order_idx" ON "pages_blocks_bz_section_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_section_items_parent_id_idx" ON "pages_blocks_bz_section_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_section_order_idx" ON "pages_blocks_bz_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_section_parent_id_idx" ON "pages_blocks_bz_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_section_path_idx" ON "pages_blocks_bz_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_section_items_order_idx" ON "_pages_v_blocks_bz_section_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_section_items_parent_id_idx" ON "_pages_v_blocks_bz_section_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_section_order_idx" ON "_pages_v_blocks_bz_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_section_parent_id_idx" ON "_pages_v_blocks_bz_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_section_path_idx" ON "_pages_v_blocks_bz_section" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_section_items" CASCADE;
  DROP TABLE "pages_blocks_bz_section" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_section_items" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_section" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_section_items_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_section_variant";
  DROP TYPE "public"."enum_pages_blocks_bz_section_surface";
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_variant";
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_surface";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_hero_trust_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_badges_tone" AS ENUM('promo', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_hero_trust_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_badges_tone" AS ENUM('promo', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TABLE "pages_blocks_bz_hero_trust_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_bz_hero_trust_items_icon",
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pill" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"show_phone" boolean DEFAULT true,
  	"wheel_hint" varchar,
  	"plan_link_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_needs_items_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"text" varchar,
  	"tone" "enum_pages_blocks_bz_needs_items_badges_tone" DEFAULT 'accent'
  );
  
  CREATE TABLE "pages_blocks_bz_needs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_needs_items_icon",
  	"tone" "enum_pages_blocks_bz_needs_items_tone" DEFAULT 'blue',
  	"text" varchar,
  	"href" varchar,
  	"tag" varchar,
  	"countdown_to" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_blocks_bz_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_hero_trust_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_bz_hero_trust_items_icon",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pill" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"show_phone" boolean DEFAULT true,
  	"wheel_hint" varchar,
  	"plan_link_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_needs_items_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"text" varchar,
  	"tone" "enum__pages_v_blocks_bz_needs_items_badges_tone" DEFAULT 'accent',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_needs_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_needs_items_icon",
  	"tone" "enum__pages_v_blocks_bz_needs_items_tone" DEFAULT 'blue',
  	"text" varchar,
  	"href" varchar,
  	"tag" varchar,
  	"countdown_to" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "catalog_groups" ADD COLUMN "description" varchar;
  ALTER TABLE "pages_blocks_bz_hero_trust_items" ADD CONSTRAINT "pages_blocks_bz_hero_trust_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_hero" ADD CONSTRAINT "pages_blocks_bz_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_needs_items_badges" ADD CONSTRAINT "pages_blocks_bz_needs_items_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_needs_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_needs_items" ADD CONSTRAINT "pages_blocks_bz_needs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_needs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_needs" ADD CONSTRAINT "pages_blocks_bz_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_hero_trust_items" ADD CONSTRAINT "_pages_v_blocks_bz_hero_trust_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_hero" ADD CONSTRAINT "_pages_v_blocks_bz_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_needs_items_badges" ADD CONSTRAINT "_pages_v_blocks_bz_needs_items_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_needs_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_needs_items" ADD CONSTRAINT "_pages_v_blocks_bz_needs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_needs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_needs" ADD CONSTRAINT "_pages_v_blocks_bz_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_hero_trust_items_order_idx" ON "pages_blocks_bz_hero_trust_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_hero_trust_items_parent_id_idx" ON "pages_blocks_bz_hero_trust_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_hero_order_idx" ON "pages_blocks_bz_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_hero_parent_id_idx" ON "pages_blocks_bz_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_hero_path_idx" ON "pages_blocks_bz_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_needs_items_badges_order_idx" ON "pages_blocks_bz_needs_items_badges" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_needs_items_badges_parent_id_idx" ON "pages_blocks_bz_needs_items_badges" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_needs_items_order_idx" ON "pages_blocks_bz_needs_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_needs_items_parent_id_idx" ON "pages_blocks_bz_needs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_needs_order_idx" ON "pages_blocks_bz_needs" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_needs_parent_id_idx" ON "pages_blocks_bz_needs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_needs_path_idx" ON "pages_blocks_bz_needs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_hero_trust_items_order_idx" ON "_pages_v_blocks_bz_hero_trust_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_hero_trust_items_parent_id_idx" ON "_pages_v_blocks_bz_hero_trust_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_hero_order_idx" ON "_pages_v_blocks_bz_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_hero_parent_id_idx" ON "_pages_v_blocks_bz_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_hero_path_idx" ON "_pages_v_blocks_bz_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_badges_order_idx" ON "_pages_v_blocks_bz_needs_items_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_badges_parent_id_idx" ON "_pages_v_blocks_bz_needs_items_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_order_idx" ON "_pages_v_blocks_bz_needs_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_parent_id_idx" ON "_pages_v_blocks_bz_needs_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_needs_order_idx" ON "_pages_v_blocks_bz_needs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_needs_parent_id_idx" ON "_pages_v_blocks_bz_needs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_needs_path_idx" ON "_pages_v_blocks_bz_needs" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_hero_trust_items" CASCADE;
  DROP TABLE "pages_blocks_bz_hero" CASCADE;
  DROP TABLE "pages_blocks_bz_needs_items_badges" CASCADE;
  DROP TABLE "pages_blocks_bz_needs_items" CASCADE;
  DROP TABLE "pages_blocks_bz_needs" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_hero_trust_items" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_needs_items_badges" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_needs_items" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_needs" CASCADE;
  ALTER TABLE "catalog_groups" DROP COLUMN "description";
  DROP TYPE "public"."enum_pages_blocks_bz_hero_trust_items_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_badges_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_hero_trust_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_badges_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_tone";`)
}

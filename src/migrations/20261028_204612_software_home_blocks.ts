import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_hero_trust_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_hero_intents_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_hero_intents_tone" AS ENUM('www', 'sys', 'app', 'cal', 'plug', 'auto', 'care', 'aud');
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'showcase');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_hero_trust_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_hero_intents_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_hero_intents_tone" AS ENUM('www', 'sys', 'app', 'cal', 'plug', 'auto', 'care', 'aud');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'showcase');
  CREATE TABLE "pages_blocks_sw_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"icon" "enum_pages_blocks_sw_hero_trust_icon"
  );
  
  CREATE TABLE "pages_blocks_sw_hero_intents" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_sw_hero_intents_icon",
  	"tone" "enum_pages_blocks_sw_hero_intents_tone" DEFAULT 'www',
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_hero" (
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
  	"primary_badge" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"response" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_home_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"section" "enum_pages_blocks_sw_home_section_section",
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"icon" "enum__pages_v_blocks_sw_hero_trust_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_hero_intents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_sw_hero_intents_icon",
  	"tone" "enum__pages_v_blocks_sw_hero_intents_tone" DEFAULT 'www',
  	"text" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_hero" (
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
  	"primary_badge" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"response" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_home_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"section" "enum__pages_v_blocks_sw_home_section_section",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_hero_trust" ADD CONSTRAINT "pages_blocks_sw_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_hero_intents" ADD CONSTRAINT "pages_blocks_sw_hero_intents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_hero" ADD CONSTRAINT "pages_blocks_sw_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_home_section" ADD CONSTRAINT "pages_blocks_sw_home_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_hero_trust" ADD CONSTRAINT "_pages_v_blocks_sw_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_hero_intents" ADD CONSTRAINT "_pages_v_blocks_sw_hero_intents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_hero" ADD CONSTRAINT "_pages_v_blocks_sw_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_home_section" ADD CONSTRAINT "_pages_v_blocks_sw_home_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_hero_trust_order_idx" ON "pages_blocks_sw_hero_trust" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_hero_trust_parent_id_idx" ON "pages_blocks_sw_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_hero_intents_order_idx" ON "pages_blocks_sw_hero_intents" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_hero_intents_parent_id_idx" ON "pages_blocks_sw_hero_intents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_hero_order_idx" ON "pages_blocks_sw_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_hero_parent_id_idx" ON "pages_blocks_sw_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_hero_path_idx" ON "pages_blocks_sw_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_home_section_order_idx" ON "pages_blocks_sw_home_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_home_section_parent_id_idx" ON "pages_blocks_sw_home_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_home_section_path_idx" ON "pages_blocks_sw_home_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_hero_trust_order_idx" ON "_pages_v_blocks_sw_hero_trust" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_hero_trust_parent_id_idx" ON "_pages_v_blocks_sw_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_hero_intents_order_idx" ON "_pages_v_blocks_sw_hero_intents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_hero_intents_parent_id_idx" ON "_pages_v_blocks_sw_hero_intents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_hero_order_idx" ON "_pages_v_blocks_sw_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_hero_parent_id_idx" ON "_pages_v_blocks_sw_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_hero_path_idx" ON "_pages_v_blocks_sw_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_home_section_order_idx" ON "_pages_v_blocks_sw_home_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_home_section_parent_id_idx" ON "_pages_v_blocks_sw_home_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_home_section_path_idx" ON "_pages_v_blocks_sw_home_section" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_hero_trust" CASCADE;
  DROP TABLE "pages_blocks_sw_hero_intents" CASCADE;
  DROP TABLE "pages_blocks_sw_hero" CASCADE;
  DROP TABLE "pages_blocks_sw_home_section" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_hero_trust" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_hero_intents" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_home_section" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_sw_hero_trust_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_hero_intents_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_hero_intents_tone";
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  DROP TYPE "public"."enum__pages_v_blocks_sw_hero_trust_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_hero_intents_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_hero_intents_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";`)
}

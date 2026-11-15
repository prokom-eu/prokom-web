import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_plan_scenes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_plan_industries_tiles_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_plan_industries_tiles_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TYPE "public"."enum_pages_blocks_bz_steps_steps_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_one_partner_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_one_partner_phone_watch_tone" AS ENUM('ok', 'accent', 'warn');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_plan_scenes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_plan_industries_tiles_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_plan_industries_tiles_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_steps_steps_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_one_partner_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_one_partner_phone_watch_tone" AS ENUM('ok', 'accent', 'warn');
  CREATE TABLE "pages_blocks_bz_plan_scenes_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tab" varchar,
  	"icon" "enum_pages_blocks_bz_plan_scenes_icon",
  	"title" varchar,
  	"lead" varchar,
  	"more_href" varchar,
  	"inquiry_href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan_industries_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"icon" "enum_pages_blocks_bz_plan_industries_tiles_icon",
  	"tone" "enum_pages_blocks_bz_plan_industries_tiles_tone" DEFAULT 'blue',
  	"visible_first" boolean DEFAULT false,
  	"industry_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_plan_funding_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"scene_note" varchar,
  	"more_label" varchar,
  	"inquiry_label" varchar,
  	"industries_heading" varchar,
  	"industries_lead" varchar,
  	"industries_button_label" varchar,
  	"industries_button_href" varchar,
  	"industries_more_label" varchar,
  	"industries_more_note" varchar,
  	"funding_label" varchar,
  	"funding_heading" varchar,
  	"funding_text" varchar,
  	"funding_button_label" varchar,
  	"funding_button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_steps_steps_icon",
  	"text" varchar,
  	"gets" varchar,
  	"role" varchar,
  	"role_note" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_steps_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"gets_label" varchar DEFAULT 'Dostajesz',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"icon" "enum_pages_blocks_bz_one_partner_rows_icon",
  	"separate" varchar,
  	"one" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_phone_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_phone_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_phone_watch" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum_pages_blocks_bz_one_partner_phone_watch_tone" DEFAULT 'ok'
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_separate_bubbles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner_one_bubbles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_one_partner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow_a" varchar,
  	"eyebrow_b" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"separate_label" varchar,
  	"one_label" varchar,
  	"separate_tag" varchar,
  	"one_tag" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"phone_group_label" varchar,
  	"phone_pro_note" varchar,
  	"phone_watch_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_scenes_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tab" varchar,
  	"icon" "enum__pages_v_blocks_bz_plan_scenes_icon",
  	"title" varchar,
  	"lead" varchar,
  	"more_href" varchar,
  	"inquiry_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_industries_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"icon" "enum__pages_v_blocks_bz_plan_industries_tiles_icon",
  	"tone" "enum__pages_v_blocks_bz_plan_industries_tiles_tone" DEFAULT 'blue',
  	"visible_first" boolean DEFAULT false,
  	"industry_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_funding_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"scene_note" varchar,
  	"more_label" varchar,
  	"inquiry_label" varchar,
  	"industries_heading" varchar,
  	"industries_lead" varchar,
  	"industries_button_label" varchar,
  	"industries_button_href" varchar,
  	"industries_more_label" varchar,
  	"industries_more_note" varchar,
  	"funding_label" varchar,
  	"funding_heading" varchar,
  	"funding_text" varchar,
  	"funding_button_label" varchar,
  	"funding_button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_steps_steps_icon",
  	"text" varchar,
  	"gets" varchar,
  	"role" varchar,
  	"role_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_steps_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"gets_label" varchar DEFAULT 'Dostajesz',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"icon" "enum__pages_v_blocks_bz_one_partner_rows_icon",
  	"separate" varchar,
  	"one" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_phone_contacts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_phone_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_phone_watch" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum__pages_v_blocks_bz_one_partner_phone_watch_tone" DEFAULT 'ok',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_separate_bubbles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner_one_bubbles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_one_partner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow_a" varchar,
  	"eyebrow_b" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"separate_label" varchar,
  	"one_label" varchar,
  	"separate_tag" varchar,
  	"one_tag" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"phone_group_label" varchar,
  	"phone_pro_note" varchar,
  	"phone_watch_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_plan_scenes_points" ADD CONSTRAINT "pages_blocks_bz_plan_scenes_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_scenes" ADD CONSTRAINT "pages_blocks_bz_plan_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_promises" ADD CONSTRAINT "pages_blocks_bz_plan_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_industries_tiles" ADD CONSTRAINT "pages_blocks_bz_plan_industries_tiles_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_industries_tiles" ADD CONSTRAINT "pages_blocks_bz_plan_industries_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_funding_chips" ADD CONSTRAINT "pages_blocks_bz_plan_funding_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan" ADD CONSTRAINT "pages_blocks_bz_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_steps_steps" ADD CONSTRAINT "pages_blocks_bz_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_steps_guarantees" ADD CONSTRAINT "pages_blocks_bz_steps_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_steps" ADD CONSTRAINT "pages_blocks_bz_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_rows" ADD CONSTRAINT "pages_blocks_bz_one_partner_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_contacts" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_chips" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_watch" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_watch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_separate_bubbles" ADD CONSTRAINT "pages_blocks_bz_one_partner_separate_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_one_bubbles" ADD CONSTRAINT "pages_blocks_bz_one_partner_one_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner" ADD CONSTRAINT "pages_blocks_bz_one_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_scenes_points" ADD CONSTRAINT "_pages_v_blocks_bz_plan_scenes_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_scenes" ADD CONSTRAINT "_pages_v_blocks_bz_plan_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_promises" ADD CONSTRAINT "_pages_v_blocks_bz_plan_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_industries_tiles" ADD CONSTRAINT "_pages_v_blocks_bz_plan_industries_tiles_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_industries_tiles" ADD CONSTRAINT "_pages_v_blocks_bz_plan_industries_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_funding_chips" ADD CONSTRAINT "_pages_v_blocks_bz_plan_funding_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan" ADD CONSTRAINT "_pages_v_blocks_bz_plan_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_steps_steps" ADD CONSTRAINT "_pages_v_blocks_bz_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_steps_guarantees" ADD CONSTRAINT "_pages_v_blocks_bz_steps_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_steps" ADD CONSTRAINT "_pages_v_blocks_bz_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_rows" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_contacts" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_chips" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_watch" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_watch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_separate_bubbles" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_separate_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_one_bubbles" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_one_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_plan_scenes_points_order_idx" ON "pages_blocks_bz_plan_scenes_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_scenes_points_parent_id_idx" ON "pages_blocks_bz_plan_scenes_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_scenes_order_idx" ON "pages_blocks_bz_plan_scenes" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_scenes_parent_id_idx" ON "pages_blocks_bz_plan_scenes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_promises_order_idx" ON "pages_blocks_bz_plan_promises" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_promises_parent_id_idx" ON "pages_blocks_bz_plan_promises" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_industries_tiles_order_idx" ON "pages_blocks_bz_plan_industries_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_industries_tiles_parent_id_idx" ON "pages_blocks_bz_plan_industries_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_industries_tiles_industry_idx" ON "pages_blocks_bz_plan_industries_tiles" USING btree ("industry_id");
  CREATE INDEX "pages_blocks_bz_plan_funding_chips_order_idx" ON "pages_blocks_bz_plan_funding_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_funding_chips_parent_id_idx" ON "pages_blocks_bz_plan_funding_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_order_idx" ON "pages_blocks_bz_plan" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_parent_id_idx" ON "pages_blocks_bz_plan" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_path_idx" ON "pages_blocks_bz_plan" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_steps_steps_order_idx" ON "pages_blocks_bz_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_steps_steps_parent_id_idx" ON "pages_blocks_bz_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_steps_guarantees_order_idx" ON "pages_blocks_bz_steps_guarantees" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_steps_guarantees_parent_id_idx" ON "pages_blocks_bz_steps_guarantees" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_steps_order_idx" ON "pages_blocks_bz_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_steps_parent_id_idx" ON "pages_blocks_bz_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_steps_path_idx" ON "pages_blocks_bz_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_one_partner_rows_order_idx" ON "pages_blocks_bz_one_partner_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_rows_parent_id_idx" ON "pages_blocks_bz_one_partner_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_contacts_order_idx" ON "pages_blocks_bz_one_partner_phone_contacts" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_contacts_parent_id_idx" ON "pages_blocks_bz_one_partner_phone_contacts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_chips_order_idx" ON "pages_blocks_bz_one_partner_phone_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_chips_parent_id_idx" ON "pages_blocks_bz_one_partner_phone_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_watch_order_idx" ON "pages_blocks_bz_one_partner_phone_watch" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_phone_watch_parent_id_idx" ON "pages_blocks_bz_one_partner_phone_watch" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_separate_bubbles_order_idx" ON "pages_blocks_bz_one_partner_separate_bubbles" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_separate_bubbles_parent_id_idx" ON "pages_blocks_bz_one_partner_separate_bubbles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_one_bubbles_order_idx" ON "pages_blocks_bz_one_partner_one_bubbles" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_one_bubbles_parent_id_idx" ON "pages_blocks_bz_one_partner_one_bubbles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_order_idx" ON "pages_blocks_bz_one_partner" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_one_partner_parent_id_idx" ON "pages_blocks_bz_one_partner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_one_partner_path_idx" ON "pages_blocks_bz_one_partner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_points_order_idx" ON "_pages_v_blocks_bz_plan_scenes_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_points_parent_id_idx" ON "_pages_v_blocks_bz_plan_scenes_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_order_idx" ON "_pages_v_blocks_bz_plan_scenes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_parent_id_idx" ON "_pages_v_blocks_bz_plan_scenes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_promises_order_idx" ON "_pages_v_blocks_bz_plan_promises" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_promises_parent_id_idx" ON "_pages_v_blocks_bz_plan_promises" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_industries_tiles_order_idx" ON "_pages_v_blocks_bz_plan_industries_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_industries_tiles_parent_id_idx" ON "_pages_v_blocks_bz_plan_industries_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_industries_tiles_industry_idx" ON "_pages_v_blocks_bz_plan_industries_tiles" USING btree ("industry_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_funding_chips_order_idx" ON "_pages_v_blocks_bz_plan_funding_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_funding_chips_parent_id_idx" ON "_pages_v_blocks_bz_plan_funding_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_order_idx" ON "_pages_v_blocks_bz_plan" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_parent_id_idx" ON "_pages_v_blocks_bz_plan" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_path_idx" ON "_pages_v_blocks_bz_plan" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_steps_steps_order_idx" ON "_pages_v_blocks_bz_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_steps_steps_parent_id_idx" ON "_pages_v_blocks_bz_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_steps_guarantees_order_idx" ON "_pages_v_blocks_bz_steps_guarantees" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_steps_guarantees_parent_id_idx" ON "_pages_v_blocks_bz_steps_guarantees" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_steps_order_idx" ON "_pages_v_blocks_bz_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_steps_parent_id_idx" ON "_pages_v_blocks_bz_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_steps_path_idx" ON "_pages_v_blocks_bz_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_rows_order_idx" ON "_pages_v_blocks_bz_one_partner_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_rows_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_contacts_order_idx" ON "_pages_v_blocks_bz_one_partner_phone_contacts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_contacts_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_phone_contacts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_chips_order_idx" ON "_pages_v_blocks_bz_one_partner_phone_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_chips_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_phone_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_watch_order_idx" ON "_pages_v_blocks_bz_one_partner_phone_watch" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_phone_watch_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_phone_watch" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_separate_bubbles_order_idx" ON "_pages_v_blocks_bz_one_partner_separate_bubbles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_separate_bubbles_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_separate_bubbles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_one_bubbles_order_idx" ON "_pages_v_blocks_bz_one_partner_one_bubbles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_one_bubbles_parent_id_idx" ON "_pages_v_blocks_bz_one_partner_one_bubbles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_order_idx" ON "_pages_v_blocks_bz_one_partner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_parent_id_idx" ON "_pages_v_blocks_bz_one_partner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_one_partner_path_idx" ON "_pages_v_blocks_bz_one_partner" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_plan_scenes_points" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_scenes" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_promises" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_industries_tiles" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_funding_chips" CASCADE;
  DROP TABLE "pages_blocks_bz_plan" CASCADE;
  DROP TABLE "pages_blocks_bz_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_steps_guarantees" CASCADE;
  DROP TABLE "pages_blocks_bz_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_rows" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_contacts" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_chips" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_watch" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_separate_bubbles" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_one_bubbles" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_scenes_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_scenes" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_promises" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_industries_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_funding_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_steps_guarantees" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_contacts" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_watch" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_separate_bubbles" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_one_bubbles" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_plan_scenes_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_plan_industries_tiles_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_plan_industries_tiles_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_steps_steps_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_one_partner_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_one_partner_phone_watch_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_plan_scenes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_plan_industries_tiles_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_plan_industries_tiles_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_steps_steps_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_one_partner_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_one_partner_phone_watch_tone";`)
}

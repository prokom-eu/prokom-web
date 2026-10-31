import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_needs_items_badges" CASCADE;
  DROP TABLE "pages_blocks_bz_needs_items" CASCADE;
  DROP TABLE "pages_blocks_bz_featured_wizard_card_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_promises" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_rows" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_contacts" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_chips" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_phone_watch" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_separate_bubbles" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner_one_bubbles" CASCADE;
  DROP TABLE "pages_blocks_bz_one_partner" CASCADE;
  DROP TABLE "pages_blocks_bz_references_kinds" CASCADE;
  DROP TABLE "pages_blocks_bz_news" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_needs_items_badges" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_needs_items" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_promises" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_contacts" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_phone_watch" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_separate_bubbles" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner_one_bubbles" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_one_partner" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_references_kinds" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_news" CASCADE;
  ALTER TABLE "pages_blocks_bz_offer" ADD COLUMN "search_eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_offer" ADD COLUMN "search_heading" varchar;
  ALTER TABLE "pages_blocks_bz_plan" ADD COLUMN "industries_eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_steps_steps" RENAME COLUMN "role_note" TO "label";
  ALTER TABLE "pages_blocks_bz_steps" ADD COLUMN "commitments_eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_steps" ADD COLUMN "commitments_heading" varchar;
  ALTER TABLE "_pages_v_blocks_bz_offer" ADD COLUMN "search_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_offer" ADD COLUMN "search_heading" varchar;
  ALTER TABLE "_pages_v_blocks_bz_plan" ADD COLUMN "industries_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_steps_steps" RENAME COLUMN "role_note" TO "label";
  ALTER TABLE "_pages_v_blocks_bz_steps" ADD COLUMN "commitments_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_steps" ADD COLUMN "commitments_heading" varchar;
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "offer_card_eyebrow";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "offer_card_heading";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "offer_card_text";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "offer_card_button_label";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "offer_card_button_href";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_eyebrow";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_heading";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_text";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_button_label";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_button_href";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_summary_label";
  ALTER TABLE "pages_blocks_bz_featured" DROP COLUMN "wizard_card_summary";
  ALTER TABLE "pages_blocks_bz_plan" DROP COLUMN "industries_button_label";
  ALTER TABLE "pages_blocks_bz_plan" DROP COLUMN "industries_button_href";
  ALTER TABLE "pages_blocks_bz_references" DROP COLUMN "note";
  ALTER TABLE "pages_blocks_bz_facts" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_bz_facts" DROP COLUMN "authorizations_label";
  ALTER TABLE "pages_blocks_bz_facts" DROP COLUMN "area_text";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "offer_card_eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "offer_card_heading";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "offer_card_text";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "offer_card_button_label";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "offer_card_button_href";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_heading";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_text";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_button_label";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_button_href";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_summary_label";
  ALTER TABLE "_pages_v_blocks_bz_featured" DROP COLUMN "wizard_card_summary";
  ALTER TABLE "_pages_v_blocks_bz_plan" DROP COLUMN "industries_button_label";
  ALTER TABLE "_pages_v_blocks_bz_plan" DROP COLUMN "industries_button_href";
  ALTER TABLE "_pages_v_blocks_bz_references" DROP COLUMN "note";
  ALTER TABLE "_pages_v_blocks_bz_facts" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_facts" DROP COLUMN "authorizations_label";
  ALTER TABLE "_pages_v_blocks_bz_facts" DROP COLUMN "area_text";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_badges_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_needs_items_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_one_partner_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_one_partner_phone_watch_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_references_kinds_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_badges_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_needs_items_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_one_partner_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_one_partner_phone_watch_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_references_kinds_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_badges_tone" AS ENUM('promo', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_needs_items_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TYPE "public"."enum_pages_blocks_bz_one_partner_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_one_partner_phone_watch_tone" AS ENUM('ok', 'accent', 'warn');
  CREATE TYPE "public"."enum_pages_blocks_bz_references_kinds_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_badges_tone" AS ENUM('promo', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_needs_items_tone" AS ENUM('green', 'red', 'blue', 'violet');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_one_partner_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_one_partner_phone_watch_tone" AS ENUM('ok', 'accent', 'warn');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_references_kinds_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
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
  
  CREATE TABLE "pages_blocks_bz_featured_wizard_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
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
  
  CREATE TABLE "pages_blocks_bz_references_kinds" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_references_kinds_icon",
  	"examples" varchar,
  	"solutions" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"all_label" varchar,
  	"read_label" varchar DEFAULT 'Czytaj',
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
  
  CREATE TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_bz_references_kinds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_references_kinds_icon",
  	"examples" varchar,
  	"solutions" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"all_label" varchar,
  	"read_label" varchar DEFAULT 'Czytaj',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "offer_card_eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "offer_card_heading" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "offer_card_text" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "offer_card_button_label" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "offer_card_button_href" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_heading" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_text" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_button_label" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_button_href" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_summary_label" varchar;
  ALTER TABLE "pages_blocks_bz_featured" ADD COLUMN "wizard_card_summary" varchar;
  ALTER TABLE "pages_blocks_bz_plan" ADD COLUMN "industries_button_label" varchar;
  ALTER TABLE "pages_blocks_bz_plan" ADD COLUMN "industries_button_href" varchar;
  ALTER TABLE "pages_blocks_bz_steps_steps" RENAME COLUMN "label" TO "role_note";
  ALTER TABLE "pages_blocks_bz_references" ADD COLUMN "note" varchar;
  ALTER TABLE "pages_blocks_bz_facts" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_bz_facts" ADD COLUMN "authorizations_label" varchar;
  ALTER TABLE "pages_blocks_bz_facts" ADD COLUMN "area_text" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "offer_card_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "offer_card_heading" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "offer_card_text" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "offer_card_button_label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "offer_card_button_href" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_heading" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_text" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_button_label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_button_href" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_summary_label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD COLUMN "wizard_card_summary" varchar;
  ALTER TABLE "_pages_v_blocks_bz_plan" ADD COLUMN "industries_button_label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_plan" ADD COLUMN "industries_button_href" varchar;
  ALTER TABLE "_pages_v_blocks_bz_steps_steps" RENAME COLUMN "label" TO "role_note";
  ALTER TABLE "_pages_v_blocks_bz_references" ADD COLUMN "note" varchar;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD COLUMN "authorizations_label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD COLUMN "area_text" varchar;
  ALTER TABLE "pages_blocks_bz_needs_items_badges" ADD CONSTRAINT "pages_blocks_bz_needs_items_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_needs_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_needs_items" ADD CONSTRAINT "pages_blocks_bz_needs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_needs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_featured_wizard_card_steps" ADD CONSTRAINT "pages_blocks_bz_featured_wizard_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_featured"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_promises" ADD CONSTRAINT "pages_blocks_bz_plan_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_rows" ADD CONSTRAINT "pages_blocks_bz_one_partner_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_contacts" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_chips" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_phone_watch" ADD CONSTRAINT "pages_blocks_bz_one_partner_phone_watch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_separate_bubbles" ADD CONSTRAINT "pages_blocks_bz_one_partner_separate_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner_one_bubbles" ADD CONSTRAINT "pages_blocks_bz_one_partner_one_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_one_partner" ADD CONSTRAINT "pages_blocks_bz_one_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_references_kinds" ADD CONSTRAINT "pages_blocks_bz_references_kinds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_news" ADD CONSTRAINT "pages_blocks_bz_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_needs_items_badges" ADD CONSTRAINT "_pages_v_blocks_bz_needs_items_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_needs_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_needs_items" ADD CONSTRAINT "_pages_v_blocks_bz_needs_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_needs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" ADD CONSTRAINT "_pages_v_blocks_bz_featured_wizard_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_featured"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_promises" ADD CONSTRAINT "_pages_v_blocks_bz_plan_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_rows" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_contacts" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_contacts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_chips" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_phone_watch" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_phone_watch_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_separate_bubbles" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_separate_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner_one_bubbles" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_one_bubbles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_one_partner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_one_partner" ADD CONSTRAINT "_pages_v_blocks_bz_one_partner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_references_kinds" ADD CONSTRAINT "_pages_v_blocks_bz_references_kinds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_news" ADD CONSTRAINT "_pages_v_blocks_bz_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_needs_items_badges_order_idx" ON "pages_blocks_bz_needs_items_badges" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_needs_items_badges_parent_id_idx" ON "pages_blocks_bz_needs_items_badges" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_needs_items_order_idx" ON "pages_blocks_bz_needs_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_needs_items_parent_id_idx" ON "pages_blocks_bz_needs_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_featured_wizard_card_steps_order_idx" ON "pages_blocks_bz_featured_wizard_card_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_featured_wizard_card_steps_parent_id_idx" ON "pages_blocks_bz_featured_wizard_card_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_promises_order_idx" ON "pages_blocks_bz_plan_promises" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_promises_parent_id_idx" ON "pages_blocks_bz_plan_promises" USING btree ("_parent_id");
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
  CREATE INDEX "pages_blocks_bz_references_kinds_order_idx" ON "pages_blocks_bz_references_kinds" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_references_kinds_parent_id_idx" ON "pages_blocks_bz_references_kinds" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_news_order_idx" ON "pages_blocks_bz_news" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_news_parent_id_idx" ON "pages_blocks_bz_news" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_news_path_idx" ON "pages_blocks_bz_news" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_badges_order_idx" ON "_pages_v_blocks_bz_needs_items_badges" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_badges_parent_id_idx" ON "_pages_v_blocks_bz_needs_items_badges" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_order_idx" ON "_pages_v_blocks_bz_needs_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_needs_items_parent_id_idx" ON "_pages_v_blocks_bz_needs_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_featured_wizard_card_steps_order_idx" ON "_pages_v_blocks_bz_featured_wizard_card_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_featured_wizard_card_steps_parent_id_idx" ON "_pages_v_blocks_bz_featured_wizard_card_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_promises_order_idx" ON "_pages_v_blocks_bz_plan_promises" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_promises_parent_id_idx" ON "_pages_v_blocks_bz_plan_promises" USING btree ("_parent_id");
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
  CREATE INDEX "_pages_v_blocks_bz_one_partner_path_idx" ON "_pages_v_blocks_bz_one_partner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_references_kinds_order_idx" ON "_pages_v_blocks_bz_references_kinds" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_references_kinds_parent_id_idx" ON "_pages_v_blocks_bz_references_kinds" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_news_order_idx" ON "_pages_v_blocks_bz_news" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_news_parent_id_idx" ON "_pages_v_blocks_bz_news" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_news_path_idx" ON "_pages_v_blocks_bz_news" USING btree ("_path");
  ALTER TABLE "pages_blocks_bz_offer" DROP COLUMN "search_eyebrow";
  ALTER TABLE "pages_blocks_bz_offer" DROP COLUMN "search_heading";
  ALTER TABLE "pages_blocks_bz_plan" DROP COLUMN "industries_eyebrow";
  ALTER TABLE "pages_blocks_bz_steps" DROP COLUMN "commitments_eyebrow";
  ALTER TABLE "pages_blocks_bz_steps" DROP COLUMN "commitments_heading";
  ALTER TABLE "_pages_v_blocks_bz_offer" DROP COLUMN "search_eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_offer" DROP COLUMN "search_heading";
  ALTER TABLE "_pages_v_blocks_bz_plan" DROP COLUMN "industries_eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_steps" DROP COLUMN "commitments_eyebrow";
  ALTER TABLE "_pages_v_blocks_bz_steps" DROP COLUMN "commitments_heading";`)
}

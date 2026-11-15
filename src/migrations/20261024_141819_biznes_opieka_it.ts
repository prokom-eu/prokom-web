import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_variant" AS ENUM('card');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_cards_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_surface" AS ENUM('default', 'muted');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_columns" AS ENUM('3', '4');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_points_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_state" AS ENUM('ok', 'planned', 'wip');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_needs_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_report_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_report_rows_state" AS ENUM('urgent', 'fix', 'watch', 'term', 'ok');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" AS ENUM('card');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_cards_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_surface" AS ENUM('default', 'muted');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_columns" AS ENUM('3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_points_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_state" AS ENUM('ok', 'planned', 'wip');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_needs_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_state" AS ENUM('urgent', 'fix', 'watch', 'term', 'ok');
  CREATE TABLE "pages_blocks_bz_page_hero_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pill" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"parent_label" varchar,
  	"parent_href" varchar,
  	"variant" "enum_pages_blocks_bz_page_hero_variant" DEFAULT 'card',
  	"card_eyebrow" varchar,
  	"card_title" varchar,
  	"card_button_label" varchar,
  	"card_button_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_cards_cards_icon",
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"surface" "enum_pages_blocks_bz_cards_surface" DEFAULT 'default',
  	"columns" "enum_pages_blocks_bz_cards_columns" DEFAULT '3',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_monitoring_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"icon" "enum_pages_blocks_bz_monitoring_points_icon"
  );
  
  CREATE TABLE "pages_blocks_bz_monitoring_panel_kpis" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_monitoring_panel_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"detail" varchar,
  	"icon" "enum_pages_blocks_bz_monitoring_panel_rows_icon",
  	"state" "enum_pages_blocks_bz_monitoring_panel_rows_state" DEFAULT 'ok',
  	"state_label" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_monitoring_panel_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_monitoring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"panel_title" varchar,
  	"panel_subtitle" varchar,
  	"panel_status" varchar,
  	"panel_log_label" varchar,
  	"panel_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_downtime_calc" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"kicker" varchar,
  	"title" varchar,
  	"text" varchar,
  	"revenue_label" varchar DEFAULT 'Dzienny utarg',
  	"hours_label" varchar DEFAULT 'Ile godzin dziennie pracujesz?',
  	"outage_label" varchar DEFAULT 'Ile trwa awaria bez szybkiej pomocy?',
  	"result_kicker" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_audit_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_audit_needs_icon",
  	"text" varchar,
  	"countdown_to" timestamp(3) with time zone
  );
  
  CREATE TABLE "pages_blocks_bz_audit_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_audit_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_audit_report_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"detail" varchar,
  	"icon" "enum_pages_blocks_bz_audit_report_rows_icon",
  	"state" "enum_pages_blocks_bz_audit_report_rows_state" DEFAULT 'ok',
  	"state_label" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_audit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"badge_value" varchar,
  	"badge_label" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"show_phone" boolean DEFAULT true,
  	"report_tag" varchar,
  	"report_title" varchar,
  	"report_subtitle" varchar,
  	"report_plan_title" varchar,
  	"report_plan_note" varchar,
  	"report_signature" varchar,
  	"report_stamp" varchar,
  	"report_float_value" varchar,
  	"report_float_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pill" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"parent_label" varchar,
  	"parent_href" varchar,
  	"variant" "enum__pages_v_blocks_bz_page_hero_variant" DEFAULT 'card',
  	"card_eyebrow" varchar,
  	"card_title" varchar,
  	"card_button_label" varchar,
  	"card_button_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_cards_cards_icon",
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"surface" "enum__pages_v_blocks_bz_cards_surface" DEFAULT 'default',
  	"columns" "enum__pages_v_blocks_bz_cards_columns" DEFAULT '3',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_monitoring_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"icon" "enum__pages_v_blocks_bz_monitoring_points_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_monitoring_panel_kpis" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_monitoring_panel_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"detail" varchar,
  	"icon" "enum__pages_v_blocks_bz_monitoring_panel_rows_icon",
  	"state" "enum__pages_v_blocks_bz_monitoring_panel_rows_state" DEFAULT 'ok',
  	"state_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_monitoring_panel_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"time" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_monitoring" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"text" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"panel_title" varchar,
  	"panel_subtitle" varchar,
  	"panel_status" varchar,
  	"panel_log_label" varchar,
  	"panel_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_downtime_calc" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"kicker" varchar,
  	"title" varchar,
  	"text" varchar,
  	"revenue_label" varchar DEFAULT 'Dzienny utarg',
  	"hours_label" varchar DEFAULT 'Ile godzin dziennie pracujesz?',
  	"outage_label" varchar DEFAULT 'Ile trwa awaria bez szybkiej pomocy?',
  	"result_kicker" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_audit_needs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_audit_needs_icon",
  	"text" varchar,
  	"countdown_to" timestamp(3) with time zone,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_audit_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_audit_guarantees" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_audit_report_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"detail" varchar,
  	"icon" "enum__pages_v_blocks_bz_audit_report_rows_icon",
  	"state" "enum__pages_v_blocks_bz_audit_report_rows_state" DEFAULT 'ok',
  	"state_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_audit" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"badge_value" varchar,
  	"badge_label" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"show_phone" boolean DEFAULT true,
  	"report_tag" varchar,
  	"report_title" varchar,
  	"report_subtitle" varchar,
  	"report_plan_title" varchar,
  	"report_plan_note" varchar,
  	"report_signature" varchar,
  	"report_stamp" varchar,
  	"report_float_value" varchar,
  	"report_float_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_page_hero_chips" ADD CONSTRAINT "pages_blocks_bz_page_hero_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_card_steps" ADD CONSTRAINT "pages_blocks_bz_page_hero_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_cards_cards" ADD CONSTRAINT "pages_blocks_bz_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_cards" ADD CONSTRAINT "pages_blocks_bz_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_monitoring_points" ADD CONSTRAINT "pages_blocks_bz_monitoring_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_kpis" ADD CONSTRAINT "pages_blocks_bz_monitoring_panel_kpis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_rows" ADD CONSTRAINT "pages_blocks_bz_monitoring_panel_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_log" ADD CONSTRAINT "pages_blocks_bz_monitoring_panel_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_monitoring" ADD CONSTRAINT "pages_blocks_bz_monitoring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_downtime_calc" ADD CONSTRAINT "pages_blocks_bz_downtime_calc_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_audit_needs" ADD CONSTRAINT "pages_blocks_bz_audit_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_audit_steps" ADD CONSTRAINT "pages_blocks_bz_audit_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_audit_guarantees" ADD CONSTRAINT "pages_blocks_bz_audit_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_audit_report_rows" ADD CONSTRAINT "pages_blocks_bz_audit_report_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_audit" ADD CONSTRAINT "pages_blocks_bz_audit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_chips" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_card_steps" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" ADD CONSTRAINT "_pages_v_blocks_bz_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_cards" ADD CONSTRAINT "_pages_v_blocks_bz_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_points" ADD CONSTRAINT "_pages_v_blocks_bz_monitoring_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_kpis" ADD CONSTRAINT "_pages_v_blocks_bz_monitoring_panel_kpis_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_rows" ADD CONSTRAINT "_pages_v_blocks_bz_monitoring_panel_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_log" ADD CONSTRAINT "_pages_v_blocks_bz_monitoring_panel_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_monitoring"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_monitoring" ADD CONSTRAINT "_pages_v_blocks_bz_monitoring_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_downtime_calc" ADD CONSTRAINT "_pages_v_blocks_bz_downtime_calc_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_audit_needs" ADD CONSTRAINT "_pages_v_blocks_bz_audit_needs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_audit_steps" ADD CONSTRAINT "_pages_v_blocks_bz_audit_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_audit_guarantees" ADD CONSTRAINT "_pages_v_blocks_bz_audit_guarantees_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_audit_report_rows" ADD CONSTRAINT "_pages_v_blocks_bz_audit_report_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_audit"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_audit" ADD CONSTRAINT "_pages_v_blocks_bz_audit_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_chips_order_idx" ON "pages_blocks_bz_page_hero_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_chips_parent_id_idx" ON "pages_blocks_bz_page_hero_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_card_steps_order_idx" ON "pages_blocks_bz_page_hero_card_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_card_steps_parent_id_idx" ON "pages_blocks_bz_page_hero_card_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_order_idx" ON "pages_blocks_bz_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_parent_id_idx" ON "pages_blocks_bz_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_path_idx" ON "pages_blocks_bz_page_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_cards_cards_order_idx" ON "pages_blocks_bz_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_cards_cards_parent_id_idx" ON "pages_blocks_bz_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_cards_order_idx" ON "pages_blocks_bz_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_cards_parent_id_idx" ON "pages_blocks_bz_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_cards_path_idx" ON "pages_blocks_bz_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_monitoring_points_order_idx" ON "pages_blocks_bz_monitoring_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_monitoring_points_parent_id_idx" ON "pages_blocks_bz_monitoring_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_kpis_order_idx" ON "pages_blocks_bz_monitoring_panel_kpis" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_kpis_parent_id_idx" ON "pages_blocks_bz_monitoring_panel_kpis" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_rows_order_idx" ON "pages_blocks_bz_monitoring_panel_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_rows_parent_id_idx" ON "pages_blocks_bz_monitoring_panel_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_log_order_idx" ON "pages_blocks_bz_monitoring_panel_log" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_monitoring_panel_log_parent_id_idx" ON "pages_blocks_bz_monitoring_panel_log" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_monitoring_order_idx" ON "pages_blocks_bz_monitoring" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_monitoring_parent_id_idx" ON "pages_blocks_bz_monitoring" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_monitoring_path_idx" ON "pages_blocks_bz_monitoring" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_downtime_calc_order_idx" ON "pages_blocks_bz_downtime_calc" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_downtime_calc_parent_id_idx" ON "pages_blocks_bz_downtime_calc" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_downtime_calc_path_idx" ON "pages_blocks_bz_downtime_calc" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_audit_needs_order_idx" ON "pages_blocks_bz_audit_needs" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_audit_needs_parent_id_idx" ON "pages_blocks_bz_audit_needs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_audit_steps_order_idx" ON "pages_blocks_bz_audit_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_audit_steps_parent_id_idx" ON "pages_blocks_bz_audit_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_audit_guarantees_order_idx" ON "pages_blocks_bz_audit_guarantees" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_audit_guarantees_parent_id_idx" ON "pages_blocks_bz_audit_guarantees" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_audit_report_rows_order_idx" ON "pages_blocks_bz_audit_report_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_audit_report_rows_parent_id_idx" ON "pages_blocks_bz_audit_report_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_audit_order_idx" ON "pages_blocks_bz_audit" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_audit_parent_id_idx" ON "pages_blocks_bz_audit" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_audit_path_idx" ON "pages_blocks_bz_audit" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_chips_order_idx" ON "_pages_v_blocks_bz_page_hero_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_chips_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_card_steps_order_idx" ON "_pages_v_blocks_bz_page_hero_card_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_card_steps_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_card_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_order_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_parent_id_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_path_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_cards_cards_order_idx" ON "_pages_v_blocks_bz_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_cards_cards_parent_id_idx" ON "_pages_v_blocks_bz_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_cards_order_idx" ON "_pages_v_blocks_bz_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_cards_parent_id_idx" ON "_pages_v_blocks_bz_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_cards_path_idx" ON "_pages_v_blocks_bz_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_points_order_idx" ON "_pages_v_blocks_bz_monitoring_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_points_parent_id_idx" ON "_pages_v_blocks_bz_monitoring_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_kpis_order_idx" ON "_pages_v_blocks_bz_monitoring_panel_kpis" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_kpis_parent_id_idx" ON "_pages_v_blocks_bz_monitoring_panel_kpis" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_rows_order_idx" ON "_pages_v_blocks_bz_monitoring_panel_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_rows_parent_id_idx" ON "_pages_v_blocks_bz_monitoring_panel_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_log_order_idx" ON "_pages_v_blocks_bz_monitoring_panel_log" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_panel_log_parent_id_idx" ON "_pages_v_blocks_bz_monitoring_panel_log" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_order_idx" ON "_pages_v_blocks_bz_monitoring" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_parent_id_idx" ON "_pages_v_blocks_bz_monitoring" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_monitoring_path_idx" ON "_pages_v_blocks_bz_monitoring" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_downtime_calc_order_idx" ON "_pages_v_blocks_bz_downtime_calc" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_downtime_calc_parent_id_idx" ON "_pages_v_blocks_bz_downtime_calc" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_downtime_calc_path_idx" ON "_pages_v_blocks_bz_downtime_calc" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_audit_needs_order_idx" ON "_pages_v_blocks_bz_audit_needs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_audit_needs_parent_id_idx" ON "_pages_v_blocks_bz_audit_needs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_audit_steps_order_idx" ON "_pages_v_blocks_bz_audit_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_audit_steps_parent_id_idx" ON "_pages_v_blocks_bz_audit_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_audit_guarantees_order_idx" ON "_pages_v_blocks_bz_audit_guarantees" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_audit_guarantees_parent_id_idx" ON "_pages_v_blocks_bz_audit_guarantees" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_audit_report_rows_order_idx" ON "_pages_v_blocks_bz_audit_report_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_audit_report_rows_parent_id_idx" ON "_pages_v_blocks_bz_audit_report_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_audit_order_idx" ON "_pages_v_blocks_bz_audit" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_audit_parent_id_idx" ON "_pages_v_blocks_bz_audit" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_audit_path_idx" ON "_pages_v_blocks_bz_audit" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_page_hero_chips" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_card_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero" CASCADE;
  DROP TABLE "pages_blocks_bz_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_bz_cards" CASCADE;
  DROP TABLE "pages_blocks_bz_monitoring_points" CASCADE;
  DROP TABLE "pages_blocks_bz_monitoring_panel_kpis" CASCADE;
  DROP TABLE "pages_blocks_bz_monitoring_panel_rows" CASCADE;
  DROP TABLE "pages_blocks_bz_monitoring_panel_log" CASCADE;
  DROP TABLE "pages_blocks_bz_monitoring" CASCADE;
  DROP TABLE "pages_blocks_bz_downtime_calc" CASCADE;
  DROP TABLE "pages_blocks_bz_audit_needs" CASCADE;
  DROP TABLE "pages_blocks_bz_audit_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_audit_guarantees" CASCADE;
  DROP TABLE "pages_blocks_bz_audit_report_rows" CASCADE;
  DROP TABLE "pages_blocks_bz_audit" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_card_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_monitoring_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_monitoring_panel_kpis" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_monitoring_panel_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_monitoring_panel_log" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_monitoring" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_downtime_calc" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_audit_needs" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_audit_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_audit_guarantees" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_audit_report_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_audit" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_variant";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_cards_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_surface";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_points_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_state";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_needs_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_report_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_report_rows_state";
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_surface";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_state";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_needs_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_state";`)
}

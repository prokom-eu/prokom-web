import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_shared_header_cta_counter" AS ENUM('none', 'inquiry', 'project');
  CREATE TYPE "public"."enum_site_settings_shared_contact_facts_kind" AS ENUM('text', 'email', 'phone', 'phone2');
  CREATE TYPE "public"."enum_site_settings_shared_contact_place_kind" AS ENUM('salon', 'spotkanie', 'serwis');
  CREATE TYPE "public"."enum_company_data_lines_key" AS ENUM('prokom', 'biznes', 'instalacje', 'software', 'tech', 'zakopane', 'gaming');
  CREATE TYPE "public"."enum_company_data_lines_kind" AS ENUM('linia', 'marka');
  CREATE TYPE "public"."enum_company_data_consent_mode" AS ENUM('checkbox', 'info');
  CREATE TABLE "site_settings_shared_rail_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"anchor_id" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"icon" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_shared_rail_search_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_shared_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_shared_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );
  
  CREATE TABLE "site_settings_shared_contact_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_site_settings_shared_contact_facts_kind" DEFAULT 'text' NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar,
  	"icon" varchar
  );
  
  CREATE TABLE "site_settings_shared_contact_routes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"cta" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings_shared_contact_next_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_settings_shared_contact_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar
  );
  
  CREATE TABLE "site_settings_shared_about_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"flag" varchar
  );
  
  CREATE TABLE "site_settings_shared_about_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_settings_shared_about_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "site_settings_shared_about_verify" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "company_data_holidays" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "company_data_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" "enum_company_data_lines_key" NOT NULL,
  	"name" varchar NOT NULL,
  	"kind" "enum_company_data_lines_kind" DEFAULT 'linia' NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"domain" varchar,
  	"url" varchar,
  	"logo_label" varchar,
  	"color" varchar,
  	"color_on_dark" varchar,
  	"published" boolean DEFAULT false,
  	"description" varchar,
  	"description_long" varchar
  );
  
  CREATE TABLE "company_data_service_zones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"note" varchar
  );
  
  CREATE TABLE "company_data_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "shared_phone_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_hours" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_response_promise" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_brand_bar_slot_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_brand_bar_slot_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_header_cta_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_header_cta_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_header_cta_counter" "enum_site_settings_shared_header_cta_counter" DEFAULT 'none';
  ALTER TABLE "site_settings" ADD COLUMN "shared_tab_bar_second_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_tab_bar_second_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_tab_bar_center_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_tab_bar_center_href" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_tab_bar_center_icon" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_legal_note" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_h1" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_lead" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_write_cta" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_place_kind" "enum_site_settings_shared_contact_place_kind";
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_form_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_placeholder" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_send_label" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_map_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_contact_map_lead" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_about_h1" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_about_lead" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_about_auth_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "shared_about_visit_text" varchar;
  ALTER TABLE "company_data_locations" ADD COLUMN "key" varchar;
  ALTER TABLE "company_data_locations" ADD COLUMN "published" boolean DEFAULT true;
  ALTER TABLE "company_data_locations" ADD COLUMN "geo_lat" numeric;
  ALTER TABLE "company_data_locations" ADD COLUMN "geo_lng" numeric;
  ALTER TABLE "company_data_locations" ADD COLUMN "parking_note" varchar;
  ALTER TABLE "company_data" ADD COLUMN "maps_url" varchar;
  ALTER TABLE "company_data" ADD COLUMN "ceidg_url" varchar;
  ALTER TABLE "company_data" ADD COLUMN "legal_privacy" varchar DEFAULT '/polityka-prywatnosci';
  ALTER TABLE "company_data" ADD COLUMN "legal_cookies" varchar DEFAULT '/cookies';
  ALTER TABLE "company_data" ADD COLUMN "legal_accessibility" varchar DEFAULT '/dostepnosc';
  ALTER TABLE "company_data" ADD COLUMN "legal_sitemap" varchar DEFAULT '/mapa-strony';
  ALTER TABLE "company_data" ADD COLUMN "consent_mode" "enum_company_data_consent_mode" DEFAULT 'checkbox';
  ALTER TABLE "company_data" ADD COLUMN "consent_version" varchar;
  ALTER TABLE "company_data" ADD COLUMN "consent_clause" varchar;
  ALTER TABLE "company_data" ADD COLUMN "recently_viewed" boolean DEFAULT false;
  ALTER TABLE "site_settings_shared_rail_sections" ADD CONSTRAINT "site_settings_shared_rail_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_rail_search_shortcuts" ADD CONSTRAINT "site_settings_shared_rail_search_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_footer_columns_links" ADD CONSTRAINT "site_settings_shared_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings_shared_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_footer_columns" ADD CONSTRAINT "site_settings_shared_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_contact_facts" ADD CONSTRAINT "site_settings_shared_contact_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_contact_routes" ADD CONSTRAINT "site_settings_shared_contact_routes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_contact_next_steps" ADD CONSTRAINT "site_settings_shared_contact_next_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_contact_faq" ADD CONSTRAINT "site_settings_shared_contact_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_about_stats" ADD CONSTRAINT "site_settings_shared_about_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_about_rules" ADD CONSTRAINT "site_settings_shared_about_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_about_steps" ADD CONSTRAINT "site_settings_shared_about_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_shared_about_verify" ADD CONSTRAINT "site_settings_shared_about_verify_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_holidays" ADD CONSTRAINT "company_data_holidays_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_lines" ADD CONSTRAINT "company_data_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_service_zones" ADD CONSTRAINT "company_data_service_zones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "company_data_texts" ADD CONSTRAINT "company_data_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."company_data"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_shared_rail_sections_order_idx" ON "site_settings_shared_rail_sections" USING btree ("_order");
  CREATE INDEX "site_settings_shared_rail_sections_parent_id_idx" ON "site_settings_shared_rail_sections" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_rail_search_shortcuts_order_idx" ON "site_settings_shared_rail_search_shortcuts" USING btree ("_order");
  CREATE INDEX "site_settings_shared_rail_search_shortcuts_parent_id_idx" ON "site_settings_shared_rail_search_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_footer_columns_links_order_idx" ON "site_settings_shared_footer_columns_links" USING btree ("_order");
  CREATE INDEX "site_settings_shared_footer_columns_links_parent_id_idx" ON "site_settings_shared_footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_footer_columns_order_idx" ON "site_settings_shared_footer_columns" USING btree ("_order");
  CREATE INDEX "site_settings_shared_footer_columns_parent_id_idx" ON "site_settings_shared_footer_columns" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_contact_facts_order_idx" ON "site_settings_shared_contact_facts" USING btree ("_order");
  CREATE INDEX "site_settings_shared_contact_facts_parent_id_idx" ON "site_settings_shared_contact_facts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_contact_routes_order_idx" ON "site_settings_shared_contact_routes" USING btree ("_order");
  CREATE INDEX "site_settings_shared_contact_routes_parent_id_idx" ON "site_settings_shared_contact_routes" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_contact_next_steps_order_idx" ON "site_settings_shared_contact_next_steps" USING btree ("_order");
  CREATE INDEX "site_settings_shared_contact_next_steps_parent_id_idx" ON "site_settings_shared_contact_next_steps" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_contact_faq_order_idx" ON "site_settings_shared_contact_faq" USING btree ("_order");
  CREATE INDEX "site_settings_shared_contact_faq_parent_id_idx" ON "site_settings_shared_contact_faq" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_about_stats_order_idx" ON "site_settings_shared_about_stats" USING btree ("_order");
  CREATE INDEX "site_settings_shared_about_stats_parent_id_idx" ON "site_settings_shared_about_stats" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_about_rules_order_idx" ON "site_settings_shared_about_rules" USING btree ("_order");
  CREATE INDEX "site_settings_shared_about_rules_parent_id_idx" ON "site_settings_shared_about_rules" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_about_steps_order_idx" ON "site_settings_shared_about_steps" USING btree ("_order");
  CREATE INDEX "site_settings_shared_about_steps_parent_id_idx" ON "site_settings_shared_about_steps" USING btree ("_parent_id");
  CREATE INDEX "site_settings_shared_about_verify_order_idx" ON "site_settings_shared_about_verify" USING btree ("_order");
  CREATE INDEX "site_settings_shared_about_verify_parent_id_idx" ON "site_settings_shared_about_verify" USING btree ("_parent_id");
  CREATE INDEX "company_data_holidays_order_idx" ON "company_data_holidays" USING btree ("_order");
  CREATE INDEX "company_data_holidays_parent_id_idx" ON "company_data_holidays" USING btree ("_parent_id");
  CREATE INDEX "company_data_lines_order_idx" ON "company_data_lines" USING btree ("_order");
  CREATE INDEX "company_data_lines_parent_id_idx" ON "company_data_lines" USING btree ("_parent_id");
  CREATE INDEX "company_data_service_zones_order_idx" ON "company_data_service_zones" USING btree ("_order");
  CREATE INDEX "company_data_service_zones_parent_id_idx" ON "company_data_service_zones" USING btree ("_parent_id");
  CREATE INDEX "company_data_texts_order_parent" ON "company_data_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_shared_rail_sections" CASCADE;
  DROP TABLE "site_settings_shared_rail_search_shortcuts" CASCADE;
  DROP TABLE "site_settings_shared_footer_columns_links" CASCADE;
  DROP TABLE "site_settings_shared_footer_columns" CASCADE;
  DROP TABLE "site_settings_shared_contact_facts" CASCADE;
  DROP TABLE "site_settings_shared_contact_routes" CASCADE;
  DROP TABLE "site_settings_shared_contact_next_steps" CASCADE;
  DROP TABLE "site_settings_shared_contact_faq" CASCADE;
  DROP TABLE "site_settings_shared_about_stats" CASCADE;
  DROP TABLE "site_settings_shared_about_rules" CASCADE;
  DROP TABLE "site_settings_shared_about_steps" CASCADE;
  DROP TABLE "site_settings_shared_about_verify" CASCADE;
  DROP TABLE "company_data_holidays" CASCADE;
  DROP TABLE "company_data_lines" CASCADE;
  DROP TABLE "company_data_service_zones" CASCADE;
  DROP TABLE "company_data_texts" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "shared_phone_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_hours";
  ALTER TABLE "site_settings" DROP COLUMN "shared_response_promise";
  ALTER TABLE "site_settings" DROP COLUMN "shared_brand_bar_slot_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_brand_bar_slot_href";
  ALTER TABLE "site_settings" DROP COLUMN "shared_header_cta_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_header_cta_href";
  ALTER TABLE "site_settings" DROP COLUMN "shared_header_cta_counter";
  ALTER TABLE "site_settings" DROP COLUMN "shared_tab_bar_second_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_tab_bar_second_href";
  ALTER TABLE "site_settings" DROP COLUMN "shared_tab_bar_center_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_tab_bar_center_href";
  ALTER TABLE "site_settings" DROP COLUMN "shared_tab_bar_center_icon";
  ALTER TABLE "site_settings" DROP COLUMN "shared_legal_note";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_h1";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_lead";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_write_cta";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_place_kind";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_form_title";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_placeholder";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_send_label";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_map_title";
  ALTER TABLE "site_settings" DROP COLUMN "shared_contact_map_lead";
  ALTER TABLE "site_settings" DROP COLUMN "shared_about_h1";
  ALTER TABLE "site_settings" DROP COLUMN "shared_about_lead";
  ALTER TABLE "site_settings" DROP COLUMN "shared_about_auth_title";
  ALTER TABLE "site_settings" DROP COLUMN "shared_about_visit_text";
  ALTER TABLE "company_data_locations" DROP COLUMN "key";
  ALTER TABLE "company_data_locations" DROP COLUMN "published";
  ALTER TABLE "company_data_locations" DROP COLUMN "geo_lat";
  ALTER TABLE "company_data_locations" DROP COLUMN "geo_lng";
  ALTER TABLE "company_data_locations" DROP COLUMN "parking_note";
  ALTER TABLE "company_data" DROP COLUMN "maps_url";
  ALTER TABLE "company_data" DROP COLUMN "ceidg_url";
  ALTER TABLE "company_data" DROP COLUMN "legal_privacy";
  ALTER TABLE "company_data" DROP COLUMN "legal_cookies";
  ALTER TABLE "company_data" DROP COLUMN "legal_accessibility";
  ALTER TABLE "company_data" DROP COLUMN "legal_sitemap";
  ALTER TABLE "company_data" DROP COLUMN "consent_mode";
  ALTER TABLE "company_data" DROP COLUMN "consent_version";
  ALTER TABLE "company_data" DROP COLUMN "consent_clause";
  ALTER TABLE "company_data" DROP COLUMN "recently_viewed";
  DROP TYPE "public"."enum_site_settings_shared_header_cta_counter";
  DROP TYPE "public"."enum_site_settings_shared_contact_facts_kind";
  DROP TYPE "public"."enum_site_settings_shared_contact_place_kind";
  DROP TYPE "public"."enum_company_data_lines_key";
  DROP TYPE "public"."enum_company_data_lines_kind";
  DROP TYPE "public"."enum_company_data_consent_mode";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_shared_page_template" AS ENUM('contact', 'about');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_shared_page_template" AS ENUM('contact', 'about');
  CREATE TABLE "pages_blocks_sw_shared_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"template" "enum_pages_blocks_sw_shared_page_template",
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_shared_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"template" "enum__pages_v_blocks_sw_shared_page_template",
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  DROP TABLE "pages_blocks_sw_contact_page_channels" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_steps" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_shortcuts" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_hints" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_lines" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_places" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page" CASCADE;
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
  DROP TABLE "_pages_v_blocks_sw_contact_page_channels" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_shortcuts" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_hints" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_places" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page" CASCADE;
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
  ALTER TABLE "pages_blocks_sw_shared_page" ADD CONSTRAINT "pages_blocks_sw_shared_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_shared_page" ADD CONSTRAINT "_pages_v_blocks_sw_shared_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_shared_page_order_idx" ON "pages_blocks_sw_shared_page" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_shared_page_parent_id_idx" ON "pages_blocks_sw_shared_page" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_shared_page_path_idx" ON "pages_blocks_sw_shared_page" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_shared_page_order_idx" ON "_pages_v_blocks_sw_shared_page" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_shared_page_parent_id_idx" ON "_pages_v_blocks_sw_shared_page" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_shared_page_path_idx" ON "_pages_v_blocks_sw_shared_page" USING btree ("_path");

  -- SWA5b (data, written by hand): /kontakt and /o-firmie of every Software tenant become one
  -- „szablon wspólny” block — the other blocks left on them (FAQ, CTA, comparison of v23) go, the
  -- texts live in SiteSettings.shared. The published page and its latest version both change;
  -- older versions lose the removed blocks („Przywróć wersję” in the panel gives an empty page).
  CREATE TEMP TABLE swa5_pages AS
    SELECT p.id, CASE p.slug WHEN 'kontakt' THEN 'contact' ELSE 'about' END AS template
    FROM pages p JOIN tenants t ON t.id = p.tenant_id
    WHERE t.line = 'software' AND p.slug IN ('kontakt', 'o-firmie');
  CREATE TEMP TABLE swa5_versions AS
    SELECT v.id, s.template FROM _pages_v v JOIN swa5_pages s ON s.id = v.parent_id
    WHERE v.latest = true;
  DO $swa5$
  DECLARE t text;
  BEGIN
    FOR t IN
      SELECT DISTINCT tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        AND ccu.table_name = 'pages' AND left(tc.table_name, 13) = 'pages_blocks_'
    LOOP
      EXECUTE format('DELETE FROM %I WHERE _parent_id IN (SELECT id FROM swa5_pages)', t);
    END LOOP;
    FOR t IN
      SELECT DISTINCT tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        AND ccu.table_name = '_pages_v' AND left(tc.table_name, 16) = '_pages_v_blocks_'
    LOOP
      EXECUTE format('DELETE FROM %I WHERE _parent_id IN (SELECT id FROM swa5_versions)', t);
    END LOOP;
  END
  $swa5$;
  INSERT INTO "pages_blocks_sw_shared_page" ("_order", "_parent_id", "_path", "id", "template")
    SELECT 1, id, 'layout', replace(gen_random_uuid()::text, '-', ''),
      template::"enum_pages_blocks_sw_shared_page_template"
    FROM swa5_pages;
  INSERT INTO "_pages_v_blocks_sw_shared_page" ("_order", "_parent_id", "_path", "template", "_uuid")
    SELECT 1, id, 'version.layout', template::"enum__pages_v_blocks_sw_shared_page_template",
      replace(gen_random_uuid()::text, '-', '')
    FROM swa5_versions;

  -- /jedna-firma: its content is „Pięć linii” on O firmie (decision D2) — 301 there, page removed.
  INSERT INTO "redirects" ("tenant_id", "from", "to", "updated_at", "created_at")
    SELECT t.id, '/jedna-firma', '/o-firmie#linie', now(), now() FROM tenants t
    WHERE t.line = 'software'
      AND NOT EXISTS (
        SELECT 1 FROM redirects r WHERE r.tenant_id = t.id AND r."from" = '/jedna-firma'
      );
  DELETE FROM _pages_v WHERE parent_id IN (
    SELECT p.id FROM pages p JOIN tenants t ON t.id = p.tenant_id
    WHERE t.line = 'software' AND p.slug = 'jedna-firma'
  );
  DELETE FROM pages p USING tenants t
    WHERE t.id = p.tenant_id AND t.line = 'software' AND p.slug = 'jedna-firma';
  DROP TABLE swa5_pages;
  DROP TABLE swa5_versions;
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_channels_kind";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_shortcuts_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_hints_topic";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line";
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_nodes_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_visual";
  DROP TYPE "public"."enum_pages_blocks_sw_steps_items_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_steps_variant";
  DROP TYPE "public"."enum_pages_blocks_sw_team_variant";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_lines_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_examples_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_lines_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_channels_kind";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_shortcuts_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_hints_topic";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_nodes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_visual";
  DROP TYPE "public"."enum__pages_v_blocks_sw_steps_items_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_steps_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_team_variant";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_lines_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_examples_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_lines_variant";`)
}

// Down brings back the v23 block tables empty: the removed blocks, their texts and `/jedna-firma`
// are not restored (SWA5b, a data-removing migration) — going back = the database backup.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_channels_kind" AS ENUM('phone', 'email', 'salon', 'online');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_shortcuts_icon" AS ENUM('wand', 'search');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_hints_topic" AS ENUM('none', 'all', 'strona', 'system', 'mobile', 'laczenie', 'opieka', 'audyt');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'prokom');
  CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_nodes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_visual" AS ENUM('none', 'photos', 'lines');
  CREATE TYPE "public"."enum_pages_blocks_sw_steps_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_steps_variant" AS ENUM('stats', 'cards', 'timeline');
  CREATE TYPE "public"."enum_pages_blocks_sw_team_variant" AS ENUM('people', 'places');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_lines_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_examples_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_sw_lines_variant" AS ENUM('lines', 'examples');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_channels_kind" AS ENUM('phone', 'email', 'salon', 'online');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_shortcuts_icon" AS ENUM('wand', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_hints_topic" AS ENUM('none', 'all', 'strona', 'system', 'mobile', 'laczenie', 'opieka', 'audyt');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'prokom');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_nodes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_visual" AS ENUM('none', 'photos', 'lines');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_steps_items_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_steps_variant" AS ENUM('stats', 'cards', 'timeline');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_team_variant" AS ENUM('people', 'places');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_lines_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_examples_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_lines_variant" AS ENUM('lines', 'examples');
  CREATE TABLE "pages_blocks_sw_contact_page_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_blocks_sw_contact_page_channels_kind",
  	"label" varchar,
  	"badge" varchar,
  	"value" varchar,
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_sw_contact_page_shortcuts_icon" DEFAULT 'wand',
  	"title" varchar,
  	"href" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" "enum_pages_blocks_sw_contact_page_hints_topic",
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" "enum_pages_blocks_sw_contact_page_lines_line",
  	"label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"hours_note" varchar,
  	"steps_title" varchar,
  	"form_eyebrow" varchar,
  	"form_title" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"project_message_label" varchar,
  	"project_message_placeholder" varchar,
  	"hints_label" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"contact_hint" varchar,
  	"talk_label" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"lines_eyebrow" varchar,
  	"lines_title" varchar,
  	"lines_text" varchar,
  	"lines_more_label" varchar,
  	"lines_more_href" varchar,
  	"meet_eyebrow" varchar,
  	"meet_title" varchar,
  	"meet_lead" varchar,
  	"map_caption" varchar,
  	"navigate_label" varchar,
  	"map_zoom_label" varchar,
  	"map_href" varchar,
  	"entrance_photo_id" integer,
  	"entrance_caption" varchar,
  	"company_title" varchar,
  	"company_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_page_hero_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"photo_caption" varchar
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
  	"photo_caption" varchar
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
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_blocks_sw_contact_page_channels_kind",
  	"label" varchar,
  	"badge" varchar,
  	"value" varchar,
  	"text" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_sw_contact_page_shortcuts_icon" DEFAULT 'wand',
  	"title" varchar,
  	"href" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "enum__pages_v_blocks_sw_contact_page_hints_topic",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" "enum__pages_v_blocks_sw_contact_page_lines_line",
  	"label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"hours_note" varchar,
  	"steps_title" varchar,
  	"form_eyebrow" varchar,
  	"form_title" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"project_message_label" varchar,
  	"project_message_placeholder" varchar,
  	"hints_label" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"contact_hint" varchar,
  	"talk_label" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"lines_eyebrow" varchar,
  	"lines_title" varchar,
  	"lines_text" varchar,
  	"lines_more_label" varchar,
  	"lines_more_href" varchar,
  	"meet_eyebrow" varchar,
  	"meet_title" varchar,
  	"meet_lead" varchar,
  	"map_caption" varchar,
  	"navigate_label" varchar,
  	"map_zoom_label" varchar,
  	"map_href" varchar,
  	"entrance_photo_id" integer,
  	"entrance_caption" varchar,
  	"company_title" varchar,
  	"company_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_page_hero_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"photo_id" integer,
  	"photo_caption" varchar,
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
  
  DROP TABLE "pages_blocks_sw_shared_page" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_shared_page" CASCADE;
  ALTER TABLE "pages_blocks_sw_contact_page_channels" ADD CONSTRAINT "pages_blocks_sw_contact_page_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_steps" ADD CONSTRAINT "pages_blocks_sw_contact_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_shortcuts" ADD CONSTRAINT "pages_blocks_sw_contact_page_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_hints" ADD CONSTRAINT "pages_blocks_sw_contact_page_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_lines" ADD CONSTRAINT "pages_blocks_sw_contact_page_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_places" ADD CONSTRAINT "pages_blocks_sw_contact_page_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD CONSTRAINT "pages_blocks_sw_contact_page_entrance_photo_id_media_id_fk" FOREIGN KEY ("entrance_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD CONSTRAINT "pages_blocks_sw_contact_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "_pages_v_blocks_sw_contact_page_channels" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_steps" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_shortcuts" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_hints" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_lines" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_places" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_entrance_photo_id_media_id_fk" FOREIGN KEY ("entrance_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
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
  CREATE INDEX "pages_blocks_sw_contact_page_channels_order_idx" ON "pages_blocks_sw_contact_page_channels" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_channels_parent_id_idx" ON "pages_blocks_sw_contact_page_channels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_steps_order_idx" ON "pages_blocks_sw_contact_page_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_steps_parent_id_idx" ON "pages_blocks_sw_contact_page_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_shortcuts_order_idx" ON "pages_blocks_sw_contact_page_shortcuts" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_shortcuts_parent_id_idx" ON "pages_blocks_sw_contact_page_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_hints_order_idx" ON "pages_blocks_sw_contact_page_hints" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_hints_parent_id_idx" ON "pages_blocks_sw_contact_page_hints" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_lines_order_idx" ON "pages_blocks_sw_contact_page_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_lines_parent_id_idx" ON "pages_blocks_sw_contact_page_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_places_order_idx" ON "pages_blocks_sw_contact_page_places" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_places_parent_id_idx" ON "pages_blocks_sw_contact_page_places" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_order_idx" ON "pages_blocks_sw_contact_page" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_parent_id_idx" ON "pages_blocks_sw_contact_page" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_path_idx" ON "pages_blocks_sw_contact_page" USING btree ("_path");
  CREATE INDEX "pages_blocks_sw_contact_page_entrance_photo_idx" ON "pages_blocks_sw_contact_page" USING btree ("entrance_photo_id");
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
  CREATE INDEX "_pages_v_blocks_sw_contact_page_channels_order_idx" ON "_pages_v_blocks_sw_contact_page_channels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_channels_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_channels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_steps_order_idx" ON "_pages_v_blocks_sw_contact_page_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_steps_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_shortcuts_order_idx" ON "_pages_v_blocks_sw_contact_page_shortcuts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_shortcuts_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_hints_order_idx" ON "_pages_v_blocks_sw_contact_page_hints" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_hints_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_hints" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_lines_order_idx" ON "_pages_v_blocks_sw_contact_page_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_lines_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_places_order_idx" ON "_pages_v_blocks_sw_contact_page_places" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_places_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_places" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_order_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_parent_id_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_path_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_entrance_photo_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("entrance_photo_id");
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
  CREATE INDEX "_pages_v_blocks_sw_lines_path_idx" ON "_pages_v_blocks_sw_lines" USING btree ("_path");
  DROP TYPE "public"."enum_pages_blocks_sw_shared_page_template";
  DROP TYPE "public"."enum__pages_v_blocks_sw_shared_page_template";`)
}

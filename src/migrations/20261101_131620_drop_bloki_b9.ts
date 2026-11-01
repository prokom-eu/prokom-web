import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * After K4hij (decyzja Krystiana 01.11): the B9/B11 blocks of the Biznes subpages go — `bzAudit`,
 * `bzBrands`, `bzCards`, `bzContactInfo`, `bzDowntimeCalc`, `bzKits`, `bzLines`, `bzModules`,
 * `bzMonitoring`, `bzPageHero`, `bzPanels`, `bzProgramPicker`, `bzQuickCards`. Their rows are lost
 * (the K4 pages use `bzSection`), and so are the page links to products only they had
 * (`pages_rels.products_id`). `down` brings the tables back empty, without the data.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_quick_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_quick_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero_figures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero_card_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero_photo_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero_screen_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_page_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_monitoring_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_kpis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_monitoring_panel_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_monitoring" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_downtime_calc" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_audit_needs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_audit_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_audit_guarantees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_audit_report_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_audit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules_modules_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_kits_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker_options_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_lines_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_brands" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_contact_info" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_figures" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_card_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_photo_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_screen_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_kpis" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_monitoring_panel_log" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_monitoring" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_downtime_calc" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_audit_needs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_audit_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_audit_guarantees" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_audit_report_rows" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_audit" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_kits_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_kits" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_panels_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_panels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_lines_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_lines" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_brands" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_bz_contact_info" CASCADE;
  DROP TABLE "pages_blocks_bz_quick_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_bz_quick_cards" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_chips" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_figures" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_card_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_photo_stats" CASCADE;
  DROP TABLE "pages_blocks_bz_page_hero_screen_notes" CASCADE;
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
  DROP TABLE "pages_blocks_bz_modules_modules_points" CASCADE;
  DROP TABLE "pages_blocks_bz_modules_modules" CASCADE;
  DROP TABLE "pages_blocks_bz_modules" CASCADE;
  DROP TABLE "pages_blocks_bz_kits_kits" CASCADE;
  DROP TABLE "pages_blocks_bz_kits" CASCADE;
  DROP TABLE "pages_blocks_bz_panels_panels" CASCADE;
  DROP TABLE "pages_blocks_bz_panels" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker_options_points" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker_options" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker" CASCADE;
  DROP TABLE "pages_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "pages_blocks_bz_lines" CASCADE;
  DROP TABLE "pages_blocks_bz_brands" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_contact_info" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_quick_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_quick_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_figures" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_card_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_photo_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_screen_notes" CASCADE;
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
  DROP TABLE "_pages_v_blocks_bz_modules_modules_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_modules_modules" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_modules" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_kits_kits" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_kits" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_panels_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker_options_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker_options" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_brands" CASCADE;
  DELETE FROM "pages_rels" WHERE "products_id" IS NOT NULL;
  DELETE FROM "_pages_v_rels" WHERE "products_id" IS NOT NULL;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_products_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_products_fk";
  
  DROP INDEX "pages_rels_products_id_idx";
  DROP INDEX "_pages_v_rels_products_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "products_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "products_id";
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_screen_notes_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_variant";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_cards_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_cards_monogram_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_surface";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_columns";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_points_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_state";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_needs_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_report_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_audit_report_rows_state";
  DROP TYPE "public"."enum_pages_blocks_bz_modules_modules_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_panels_panels_style";
  DROP TYPE "public"."enum_pages_blocks_bz_program_picker_options_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_screen_notes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_cards_monogram_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_surface";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_columns";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_points_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_state";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_needs_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_state";
  DROP TYPE "public"."enum__pages_v_blocks_bz_modules_modules_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_panels_panels_style";
  DROP TYPE "public"."enum__pages_v_blocks_bz_program_picker_options_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_screen_notes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_variant" AS ENUM('card', 'photo', 'screen', 'stats');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_cards_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_cards_monogram_tone" AS ENUM('blue', 'green', 'violet', 'red', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_surface" AS ENUM('default', 'muted');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_columns" AS ENUM('3', '4');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_tone" AS ENUM('accent', 'green');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_points_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_monitoring_panel_rows_state" AS ENUM('ok', 'planned', 'wip');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_needs_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_report_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_audit_report_rows_state" AS ENUM('urgent', 'fix', 'watch', 'term', 'ok');
  CREATE TYPE "public"."enum_pages_blocks_bz_modules_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum_pages_blocks_bz_panels_panels_style" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_bz_program_picker_options_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_screen_notes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" AS ENUM('card', 'photo', 'screen', 'stats');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_cards_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_cards_monogram_tone" AS ENUM('blue', 'green', 'violet', 'red', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_surface" AS ENUM('default', 'muted');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_columns" AS ENUM('3', '4');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_tone" AS ENUM('accent', 'green');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_points_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_monitoring_panel_rows_state" AS ENUM('ok', 'planned', 'wip');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_needs_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_audit_report_rows_state" AS ENUM('urgent', 'fix', 'watch', 'term', 'ok');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_modules_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_panels_panels_style" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_program_picker_options_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TABLE "pages_blocks_bz_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"email_note" varchar,
  	"address_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_quick_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_quick_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_photo_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero_screen_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum_pages_blocks_bz_page_hero_screen_notes_icon"
  );
  
  CREATE TABLE "pages_blocks_bz_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pill" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"since_year" numeric,
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
  	"photo_image_id" integer,
  	"photo_partner_id" integer,
  	"screen_partner_id" integer,
  	"screen_screen_image_id" integer,
  	"screen_box_image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_cards_cards_icon",
  	"monogram" varchar,
  	"monogram_tone" "enum_pages_blocks_bz_cards_cards_monogram_tone" DEFAULT 'blue',
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
  	"tone" "enum_pages_blocks_bz_cards_tone" DEFAULT 'accent',
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
  
  CREATE TABLE "pages_blocks_bz_program_picker_options_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_program_picker_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"trait" varchar,
  	"icon" "enum_pages_blocks_bz_program_picker_options_icon",
  	"trait_text" varchar,
  	"program" varchar,
  	"caption" varchar,
  	"description" varchar,
  	"screen_image_id" integer,
  	"box_image_id" integer,
  	"product_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_program_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"result_label" varchar DEFAULT 'Polecamy na start',
  	"initial" numeric DEFAULT 1,
  	"talk_label" varchar,
  	"talk_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"current" boolean DEFAULT false
  );
  
  CREATE TABLE "pages_blocks_bz_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_brands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"email_note" varchar,
  	"address_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_quick_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_quick_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_figures" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
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
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_photo_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"source" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_screen_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum__pages_v_blocks_bz_page_hero_screen_notes_icon",
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
  	"since_year" numeric,
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
  	"photo_image_id" integer,
  	"photo_partner_id" integer,
  	"screen_partner_id" integer,
  	"screen_screen_image_id" integer,
  	"screen_box_image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_cards_cards_icon",
  	"monogram" varchar,
  	"monogram_tone" "enum__pages_v_blocks_bz_cards_cards_monogram_tone" DEFAULT 'blue',
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
  	"tone" "enum__pages_v_blocks_bz_cards_tone" DEFAULT 'accent',
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
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker_options_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"trait" varchar,
  	"icon" "enum__pages_v_blocks_bz_program_picker_options_icon",
  	"trait_text" varchar,
  	"program" varchar,
  	"caption" varchar,
  	"description" varchar,
  	"screen_image_id" integer,
  	"box_image_id" integer,
  	"product_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"result_label" varchar DEFAULT 'Polecamy na start',
  	"initial" numeric DEFAULT 1,
  	"talk_label" varchar,
  	"talk_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"current" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines" (
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
  
  CREATE TABLE "_pages_v_blocks_bz_brands" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "pages_blocks_bz_contact_info" ADD CONSTRAINT "pages_blocks_bz_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_quick_cards_cards" ADD CONSTRAINT "pages_blocks_bz_quick_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_quick_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_quick_cards" ADD CONSTRAINT "pages_blocks_bz_quick_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_chips" ADD CONSTRAINT "pages_blocks_bz_page_hero_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_figures" ADD CONSTRAINT "pages_blocks_bz_page_hero_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_card_steps" ADD CONSTRAINT "pages_blocks_bz_page_hero_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_photo_stats" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero_screen_notes" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_image_id_media_id_fk" FOREIGN KEY ("photo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_photo_partner_id_partners_id_fk" FOREIGN KEY ("photo_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_partner_id_partners_id_fk" FOREIGN KEY ("screen_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_screen_image_id_media_id_fk" FOREIGN KEY ("screen_screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_box_image_id_media_id_fk" FOREIGN KEY ("screen_box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "pages_blocks_bz_modules_modules_points" ADD CONSTRAINT "pages_blocks_bz_modules_modules_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_modules_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules_modules" ADD CONSTRAINT "pages_blocks_bz_modules_modules_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules_modules" ADD CONSTRAINT "pages_blocks_bz_modules_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_modules" ADD CONSTRAINT "pages_blocks_bz_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_kits_kits" ADD CONSTRAINT "pages_blocks_bz_kits_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_kits" ADD CONSTRAINT "pages_blocks_bz_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_panels_panels" ADD CONSTRAINT "pages_blocks_bz_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_panels" ADD CONSTRAINT "pages_blocks_bz_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options_points" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_program_picker_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_screen_image_id_media_id_fk" FOREIGN KEY ("screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_box_image_id_media_id_fk" FOREIGN KEY ("box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_program_picker"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker" ADD CONSTRAINT "pages_blocks_bz_program_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_lines_lines" ADD CONSTRAINT "pages_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_lines" ADD CONSTRAINT "pages_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_brands" ADD CONSTRAINT "pages_blocks_bz_brands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_contact_info" ADD CONSTRAINT "_pages_v_blocks_bz_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards_cards" ADD CONSTRAINT "_pages_v_blocks_bz_quick_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_quick_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards" ADD CONSTRAINT "_pages_v_blocks_bz_quick_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_chips" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_figures" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_figures_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_card_steps" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_photo_stats" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_screen_notes" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_image_id_media_id_fk" FOREIGN KEY ("photo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_photo_partner_id_partners_id_fk" FOREIGN KEY ("photo_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_partner_id_partners_id_fk" FOREIGN KEY ("screen_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_screen_image_id_media_id_fk" FOREIGN KEY ("screen_screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_box_image_id_media_id_fk" FOREIGN KEY ("screen_box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "_pages_v_blocks_bz_modules_modules_points" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_modules_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_modules" ADD CONSTRAINT "_pages_v_blocks_bz_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_kits_kits" ADD CONSTRAINT "_pages_v_blocks_bz_kits_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_kits"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_kits" ADD CONSTRAINT "_pages_v_blocks_bz_kits_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_panels_panels" ADD CONSTRAINT "_pages_v_blocks_bz_panels_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_panels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_panels" ADD CONSTRAINT "_pages_v_blocks_bz_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options_points" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_program_picker_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_screen_image_id_media_id_fk" FOREIGN KEY ("screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_box_image_id_media_id_fk" FOREIGN KEY ("box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_program_picker"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_brands" ADD CONSTRAINT "_pages_v_blocks_bz_brands_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_contact_info_order_idx" ON "pages_blocks_bz_contact_info" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_contact_info_parent_id_idx" ON "pages_blocks_bz_contact_info" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_contact_info_path_idx" ON "pages_blocks_bz_contact_info" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_quick_cards_cards_order_idx" ON "pages_blocks_bz_quick_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_quick_cards_cards_parent_id_idx" ON "pages_blocks_bz_quick_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_quick_cards_order_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_quick_cards_parent_id_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_quick_cards_path_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_page_hero_chips_order_idx" ON "pages_blocks_bz_page_hero_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_chips_parent_id_idx" ON "pages_blocks_bz_page_hero_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_figures_order_idx" ON "pages_blocks_bz_page_hero_figures" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_figures_parent_id_idx" ON "pages_blocks_bz_page_hero_figures" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_card_steps_order_idx" ON "pages_blocks_bz_page_hero_card_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_card_steps_parent_id_idx" ON "pages_blocks_bz_page_hero_card_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_stats_order_idx" ON "pages_blocks_bz_page_hero_photo_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_stats_parent_id_idx" ON "pages_blocks_bz_page_hero_photo_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_notes_order_idx" ON "pages_blocks_bz_page_hero_screen_notes" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_notes_parent_id_idx" ON "pages_blocks_bz_page_hero_screen_notes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_order_idx" ON "pages_blocks_bz_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_parent_id_idx" ON "pages_blocks_bz_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_page_hero_path_idx" ON "pages_blocks_bz_page_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_photo_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("photo_image_id");
  CREATE INDEX "pages_blocks_bz_page_hero_photo_photo_partner_idx" ON "pages_blocks_bz_page_hero" USING btree ("photo_partner_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_partner_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_partner_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_screen_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_screen_image_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_box_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_box_image_id");
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
  CREATE INDEX "pages_blocks_bz_modules_modules_points_order_idx" ON "pages_blocks_bz_modules_modules_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_modules_points_parent_id_idx" ON "pages_blocks_bz_modules_modules_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_modules_order_idx" ON "pages_blocks_bz_modules_modules" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_modules_parent_id_idx" ON "pages_blocks_bz_modules_modules" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_modules_image_idx" ON "pages_blocks_bz_modules_modules" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_modules_order_idx" ON "pages_blocks_bz_modules" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_modules_parent_id_idx" ON "pages_blocks_bz_modules" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_modules_path_idx" ON "pages_blocks_bz_modules" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_kits_kits_order_idx" ON "pages_blocks_bz_kits_kits" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_kits_kits_parent_id_idx" ON "pages_blocks_bz_kits_kits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_kits_order_idx" ON "pages_blocks_bz_kits" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_kits_parent_id_idx" ON "pages_blocks_bz_kits" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_kits_path_idx" ON "pages_blocks_bz_kits" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_panels_panels_order_idx" ON "pages_blocks_bz_panels_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_panels_panels_parent_id_idx" ON "pages_blocks_bz_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_panels_order_idx" ON "pages_blocks_bz_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_panels_parent_id_idx" ON "pages_blocks_bz_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_panels_path_idx" ON "pages_blocks_bz_panels" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_program_picker_options_points_order_idx" ON "pages_blocks_bz_program_picker_options_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_options_points_parent_id_idx" ON "pages_blocks_bz_program_picker_options_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_order_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_options_parent_id_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_screen_image_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("screen_image_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_box_image_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("box_image_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_product_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("product_id");
  CREATE INDEX "pages_blocks_bz_program_picker_order_idx" ON "pages_blocks_bz_program_picker" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_parent_id_idx" ON "pages_blocks_bz_program_picker" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_path_idx" ON "pages_blocks_bz_program_picker" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_lines_lines_order_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_lines_parent_id_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_order_idx" ON "pages_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_parent_id_idx" ON "pages_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_path_idx" ON "pages_blocks_bz_lines" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_brands_order_idx" ON "pages_blocks_bz_brands" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_brands_parent_id_idx" ON "pages_blocks_bz_brands" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_brands_path_idx" ON "pages_blocks_bz_brands" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_order_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_parent_id_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_path_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_cards_order_idx" ON "_pages_v_blocks_bz_quick_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_cards_parent_id_idx" ON "_pages_v_blocks_bz_quick_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_order_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_parent_id_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_path_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_chips_order_idx" ON "_pages_v_blocks_bz_page_hero_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_chips_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_figures_order_idx" ON "_pages_v_blocks_bz_page_hero_figures" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_figures_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_figures" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_card_steps_order_idx" ON "_pages_v_blocks_bz_page_hero_card_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_card_steps_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_card_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_stats_order_idx" ON "_pages_v_blocks_bz_page_hero_photo_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_stats_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_photo_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_notes_order_idx" ON "_pages_v_blocks_bz_page_hero_screen_notes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_notes_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_screen_notes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_order_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_parent_id_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_path_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_photo_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("photo_image_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_photo_photo_partner_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("photo_partner_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_partner_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_partner_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_screen_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_screen_image_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_box_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_box_image_id");
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
  CREATE INDEX "_pages_v_blocks_bz_audit_path_idx" ON "_pages_v_blocks_bz_audit" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_points_order_idx" ON "_pages_v_blocks_bz_modules_modules_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_points_parent_id_idx" ON "_pages_v_blocks_bz_modules_modules_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_order_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_parent_id_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_modules_image_idx" ON "_pages_v_blocks_bz_modules_modules" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_order_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_modules_parent_id_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_modules_path_idx" ON "_pages_v_blocks_bz_modules" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_kits_kits_order_idx" ON "_pages_v_blocks_bz_kits_kits" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_kits_kits_parent_id_idx" ON "_pages_v_blocks_bz_kits_kits" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_kits_order_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_kits_parent_id_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_kits_path_idx" ON "_pages_v_blocks_bz_kits" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_panels_panels_order_idx" ON "_pages_v_blocks_bz_panels_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_panels_panels_parent_id_idx" ON "_pages_v_blocks_bz_panels_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_panels_order_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_panels_parent_id_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_panels_path_idx" ON "_pages_v_blocks_bz_panels" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_points_order_idx" ON "_pages_v_blocks_bz_program_picker_options_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_points_parent_id_idx" ON "_pages_v_blocks_bz_program_picker_options_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_order_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_parent_id_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_screen_image_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("screen_image_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_box_image_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("box_image_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_product_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("product_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_order_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_parent_id_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_path_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_order_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_order_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_path_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_brands_order_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_brands_parent_id_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_brands_path_idx" ON "_pages_v_blocks_bz_brands" USING btree ("_path");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_products_id_idx" ON "pages_rels" USING btree ("products_id");
  CREATE INDEX "_pages_v_rels_products_id_idx" ON "_pages_v_rels" USING btree ("products_id");`)
}

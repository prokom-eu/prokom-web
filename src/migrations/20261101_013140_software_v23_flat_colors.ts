import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWV1 (ADR-015 „Rozstrzygnięcia v23”, decision of Krystian 01.11): Software has one flat accent,
 * so the colour keys go — the intents' area colour, the tone of photo placeholders and the
 * unused card gradient of solutions. Only colour keys are lost, no content; `down` brings the
 * columns back with their defaults.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_hero_intents" DROP COLUMN "tone";
  ALTER TABLE "pages_blocks_sw_page_hero_photos" DROP COLUMN "tone";
  ALTER TABLE "pages_blocks_sw_team_members" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_sw_hero_intents" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_sw_page_hero_photos" DROP COLUMN "tone";
  ALTER TABLE "_pages_v_blocks_sw_team_members" DROP COLUMN "tone";
  ALTER TABLE "solutions" DROP COLUMN "card_gradient";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_card_gradient";
  DROP TYPE "public"."enum_pages_blocks_sw_hero_intents_tone";
  DROP TYPE "public"."enum_pages_blocks_sw_page_hero_photos_tone";
  DROP TYPE "public"."enum_pages_blocks_sw_team_members_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_hero_intents_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_page_hero_photos_tone";
  DROP TYPE "public"."enum__pages_v_blocks_sw_team_members_tone";
  DROP TYPE "public"."enum_solutions_card_gradient";
  DROP TYPE "public"."enum__solutions_v_version_card_gradient";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_hero_intents_tone" AS ENUM('www', 'sys', 'app', 'cal', 'plug', 'auto', 'care', 'aud');
  CREATE TYPE "public"."enum_pages_blocks_sw_page_hero_photos_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum_pages_blocks_sw_team_members_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_hero_intents_tone" AS ENUM('www', 'sys', 'app', 'cal', 'plug', 'auto', 'care', 'aud');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_page_hero_photos_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_team_members_tone" AS ENUM('violet', 'teal', 'copper');
  CREATE TYPE "public"."enum_solutions_card_gradient" AS ENUM('peach', 'sand', 'sage');
  CREATE TYPE "public"."enum__solutions_v_version_card_gradient" AS ENUM('peach', 'sand', 'sage');
  ALTER TABLE "pages_blocks_sw_hero_intents" ADD COLUMN "tone" "enum_pages_blocks_sw_hero_intents_tone" DEFAULT 'www';
  ALTER TABLE "pages_blocks_sw_page_hero_photos" ADD COLUMN "tone" "enum_pages_blocks_sw_page_hero_photos_tone" DEFAULT 'violet';
  ALTER TABLE "pages_blocks_sw_team_members" ADD COLUMN "tone" "enum_pages_blocks_sw_team_members_tone" DEFAULT 'violet';
  ALTER TABLE "_pages_v_blocks_sw_hero_intents" ADD COLUMN "tone" "enum__pages_v_blocks_sw_hero_intents_tone" DEFAULT 'www';
  ALTER TABLE "_pages_v_blocks_sw_page_hero_photos" ADD COLUMN "tone" "enum__pages_v_blocks_sw_page_hero_photos_tone" DEFAULT 'violet';
  ALTER TABLE "_pages_v_blocks_sw_team_members" ADD COLUMN "tone" "enum__pages_v_blocks_sw_team_members_tone" DEFAULT 'violet';
  ALTER TABLE "solutions" ADD COLUMN "card_gradient" "enum_solutions_card_gradient";
  ALTER TABLE "_solutions_v" ADD COLUMN "version_card_gradient" "enum__solutions_v_version_card_gradient";`)
}

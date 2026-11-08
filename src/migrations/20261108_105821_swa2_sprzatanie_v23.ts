import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWA2 clean-up (decision D6, Krystian 08.11 — removes data): the v23 start page sections go.
 * 1. Their `swHomeSection` blocks are deleted from pages and page versions (they rendered nothing
 *    since v24) — they would not fit the new type.
 * 2. Their texts are cut out of `software_settings.home` (top-level keys and `sections.*`): the
 *    home schema is strict, so a stored key it no longer knows would fail the whole home.
 * 3. The enum of the block loses the v23 values.
 * `down` brings back only the enum values: the deleted blocks and texts are not restored (a
 * rollback of the data = the database backup taken before the deploy, `docs/runbook.md`).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "pages_blocks_sw_home_section" WHERE "section"::text IN ('areas', 'popular', 'livePreviews', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies');
  DELETE FROM "_pages_v_blocks_sw_home_section" WHERE "section"::text IN ('areas', 'popular', 'livePreviews', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies');
  UPDATE "software_settings" SET "home" = "home" - 'processShort' - 'guarantees' - 'heroModules' - 'livePreviews' - 'whyNotWordpress' - 'proceduralMock' - 'technologies' - 'popular' WHERE jsonb_typeof("home") = 'object';
  UPDATE "software_settings" SET "home" = jsonb_set("home", '{sections}', ("home"->'sections') - 'areas' - 'popular' - 'livePreviews' - 'process' - 'guarantees' - 'howWeBuild' - 'technologies' - 'heroPanel') WHERE jsonb_typeof("home"->'sections') = 'object';
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('process', 'wizard', 'compare', 'promises', 'situations', 'bento', 'showroom', 'tech', 'pricing');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_blocks_sw_home_section_section" USING "section"::"public"."enum_pages_blocks_sw_home_section_section";
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('process', 'wizard', 'compare', 'promises', 'situations', 'bento', 'showroom', 'tech', 'pricing');
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum__pages_v_blocks_sw_home_section_section" USING "section"::"public"."enum__pages_v_blocks_sw_home_section_section";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'areas' BEFORE 'process';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'popular' BEFORE 'process';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'livePreviews' BEFORE 'process';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'whyNotWordpress' BEFORE 'compare';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'guarantees' BEFORE 'compare';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'howWeBuild' BEFORE 'compare';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'technologies' BEFORE 'compare';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'areas' BEFORE 'process';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'popular' BEFORE 'process';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'livePreviews' BEFORE 'process';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'whyNotWordpress' BEFORE 'compare';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'guarantees' BEFORE 'compare';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'howWeBuild' BEFORE 'compare';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'technologies' BEFORE 'compare';`)
}

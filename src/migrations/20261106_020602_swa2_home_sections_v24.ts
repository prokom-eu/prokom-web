import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWA2 (ZMIANY-v24 §4): the v24 start page sections as values of the `swHomeSection` block — only
 * added; the v23 values stay until the clean-up decided by Krystian (D6).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'promises';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'situations';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'bento';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'showroom';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'promises';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'situations';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'bento';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'showroom';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Going back: blocks of the v24 sections have no place in the old type, so they go first.
  await db.execute(sql`
   DELETE FROM "pages_blocks_sw_home_section" WHERE "section" IN ('promises', 'situations', 'bento', 'showroom');
  DELETE FROM "_pages_v_blocks_sw_home_section" WHERE "section" IN ('promises', 'situations', 'bento', 'showroom');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_blocks_sw_home_section_section" USING "section"::"public"."enum_pages_blocks_sw_home_section_section";
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare');
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum__pages_v_blocks_sw_home_section_section" USING "section"::"public"."enum__pages_v_blocks_sw_home_section_section";`)
}

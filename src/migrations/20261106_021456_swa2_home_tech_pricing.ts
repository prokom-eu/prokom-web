import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/** SWA2c-2 (ZMIANY-v24 §4.2): the tech section and the price list as `swHomeSection` values — only added. */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'tech';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'pricing';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'tech';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'pricing';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Going back: blocks of the two sections have no place in the old type, so they go first.
  await db.execute(sql`
   DELETE FROM "pages_blocks_sw_home_section" WHERE "section" IN ('tech', 'pricing');
  DELETE FROM "_pages_v_blocks_sw_home_section" WHERE "section" IN ('tech', 'pricing');
   ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare', 'promises', 'situations', 'bento', 'showroom');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_blocks_sw_home_section_section" USING "section"::"public"."enum_pages_blocks_sw_home_section_section";
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare', 'promises', 'situations', 'bento', 'showroom');
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum__pages_v_blocks_sw_home_section_section" USING "section"::"public"."enum__pages_v_blocks_sw_home_section_section";`)
}

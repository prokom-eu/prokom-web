import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWR5: „Jak robimy”, „Z czego budujemy” and (for SW11b) „compare” as sections of the
 * `swHomeSection` block. `down` fails while a page still has a block with one of them — change or
 * remove those blocks first (as with the earlier enum migrations).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'howWeBuild';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'technologies';
  ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'compare';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'howWeBuild';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'technologies';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'compare';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'showcase');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_blocks_sw_home_section_section" USING "section"::"public"."enum_pages_blocks_sw_home_section_section";
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'showcase');
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum__pages_v_blocks_sw_home_section_section" USING "section"::"public"."enum__pages_v_blocks_sw_home_section_section";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWV2 (prokomsoftware ZMIANY-v23 §1–2, decisions of Krystian 01.11):
 * - the second phone of a line (`site_settings.phone2`);
 * - „Realizacje” leaves the start page: its `swHomeSection` blocks go, then the enum value;
 *   the `showcase` texts leave the saved home JSON (strict schema — the start page would vanish);
 * - Zakopane leaves the Software line: the contact page's line cards and the footer cards of the
 *   saved navigation JSON (strict schema — the frame would fall back to the generic one), the
 *   „Realizacje” footer link and the old footer title.
 * Only these rows and keys are removed; `down` brings the enum values back, empty.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DELETE FROM "pages_blocks_sw_home_section" WHERE "section" = 'showcase';
  DROP TYPE "public"."enum_pages_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum_pages_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare');
  ALTER TABLE "pages_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum_pages_blocks_sw_home_section_section" USING "section"::"public"."enum_pages_blocks_sw_home_section_section";
  ALTER TABLE "pages_blocks_sw_contact_page_lines" ALTER COLUMN "line" SET DATA TYPE text;
  DELETE FROM "pages_blocks_sw_contact_page_lines" WHERE "line" = 'zakopane';
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line";
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'prokom');
  ALTER TABLE "pages_blocks_sw_contact_page_lines" ALTER COLUMN "line" SET DATA TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line" USING "line"::"public"."enum_pages_blocks_sw_contact_page_lines_line";
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE text;
  DELETE FROM "_pages_v_blocks_sw_home_section" WHERE "section" = 'showcase';
  DROP TYPE "public"."enum__pages_v_blocks_sw_home_section_section";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_home_section_section" AS ENUM('areas', 'popular', 'livePreviews', 'process', 'wizard', 'whyNotWordpress', 'guarantees', 'howWeBuild', 'technologies', 'compare');
  ALTER TABLE "_pages_v_blocks_sw_home_section" ALTER COLUMN "section" SET DATA TYPE "public"."enum__pages_v_blocks_sw_home_section_section" USING "section"::"public"."enum__pages_v_blocks_sw_home_section_section";
  ALTER TABLE "_pages_v_blocks_sw_contact_page_lines" ALTER COLUMN "line" SET DATA TYPE text;
  DELETE FROM "_pages_v_blocks_sw_contact_page_lines" WHERE "line" = 'zakopane';
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line";
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'prokom');
  ALTER TABLE "_pages_v_blocks_sw_contact_page_lines" ALTER COLUMN "line" SET DATA TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line" USING "line"::"public"."enum__pages_v_blocks_sw_contact_page_lines_line";
  ALTER TABLE "site_settings" ADD COLUMN "phone2" varchar;
  UPDATE "software_settings"
  SET "home" = ("home" - 'showcase') #- '{sections,showcase}'
  WHERE jsonb_typeof("home") = 'object';
  UPDATE "site_settings"
  SET "software_navigation" = jsonb_set(
    "software_navigation",
    '{footer,lines}',
    (
      SELECT coalesce(jsonb_agg(card ORDER BY n), '[]'::jsonb)
      FROM jsonb_array_elements("software_navigation"->'footer'->'lines') WITH ORDINALITY AS l(card, n)
      WHERE card->>'color' IS DISTINCT FROM 'zakopane'
    )
  )
  WHERE jsonb_typeof("software_navigation"->'footer'->'lines') = 'array';
  UPDATE "site_settings"
  SET "software_navigation" = jsonb_set("software_navigation", '{footer,linesTitle}', '"Jedna firma, pięć linii"')
  WHERE "software_navigation"->'footer'->>'linesTitle' = 'Jedna firma, sześć adresów';
  UPDATE "site_settings"
  SET "software_navigation" = jsonb_set(
    "software_navigation",
    '{footer,columns}',
    (
      SELECT coalesce(jsonb_agg(
        CASE
          WHEN jsonb_typeof(col->'links') = 'array' THEN jsonb_set(
            col,
            '{links}',
            (
              SELECT coalesce(jsonb_agg(link ORDER BY m), '[]'::jsonb)
              FROM jsonb_array_elements(col->'links') WITH ORDINALITY AS k(link, m)
              WHERE link->>1 IS DISTINCT FROM '/#realizacje'
            )
          )
          ELSE col
        END
        ORDER BY n
      ), '[]'::jsonb)
      FROM jsonb_array_elements("software_navigation"->'footer'->'columns') WITH ORDINALITY AS c(col, n)
    )
  )
  WHERE jsonb_typeof("software_navigation"->'footer'->'columns') = 'array';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_sw_home_section_section" ADD VALUE 'showcase' BEFORE 'howWeBuild';
  ALTER TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line" ADD VALUE 'zakopane' BEFORE 'prokom';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_home_section_section" ADD VALUE 'showcase' BEFORE 'howWeBuild';
  ALTER TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line" ADD VALUE 'zakopane' BEFORE 'prokom';
  ALTER TABLE "site_settings" DROP COLUMN "phone2";`)
}

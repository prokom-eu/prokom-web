import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SW10b: texts of the Software industry page (`Industries.software.page`) — new columns and a
 * table only. `down` drops them with the texts typed in the panel.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "industries" ADD COLUMN "software_page_hero_accent" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_hub_title" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_hub_caption" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_problems_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_solutions_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_faq_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_problems_lead" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_title" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_accent" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_lead" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_note_label" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_note_value" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_offline_box_note_caption" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_contact_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_contact_title" varchar;
  ALTER TABLE "industries" ADD COLUMN "software_page_contact_lead" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "industries" DROP COLUMN "software_page_hero_accent";
  ALTER TABLE "industries" DROP COLUMN "software_page_hub_title";
  ALTER TABLE "industries" DROP COLUMN "software_page_hub_caption";
  ALTER TABLE "industries" DROP COLUMN "software_page_problems_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "software_page_solutions_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "software_page_faq_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "software_page_problems_lead";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_title";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_accent";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_lead";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_note_label";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_note_value";
  ALTER TABLE "industries" DROP COLUMN "software_page_offline_box_note_caption";
  ALTER TABLE "industries" DROP COLUMN "software_page_contact_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "software_page_contact_title";
  ALTER TABLE "industries" DROP COLUMN "software_page_contact_lead";`)
}

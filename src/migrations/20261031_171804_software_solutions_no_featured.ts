import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWR5 (decyzja 8): the „12 rzeczy” card fields of `Solutions` go — the cards take the catalog
 * fields. `featured.features` (hasMany text) lives in the `*_texts` tables, not in a column: its
 * rows are deleted here too. `down` brings the columns back empty (the texts are in the seed).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DELETE FROM "solutions_texts" WHERE "path" = 'featured.features';
  DELETE FROM "_solutions_v_texts" WHERE "path" = 'version.featured.features';
  ALTER TABLE "solutions" DROP COLUMN "featured_name";
  ALTER TABLE "solutions" DROP COLUMN "featured_tag";
  ALTER TABLE "solutions" DROP COLUMN "featured_lead";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_featured_name";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_featured_tag";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_featured_lead";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solutions" ADD COLUMN "featured_name" varchar;
  ALTER TABLE "solutions" ADD COLUMN "featured_tag" varchar;
  ALTER TABLE "solutions" ADD COLUMN "featured_lead" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_featured_name" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_featured_tag" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_featured_lead" varchar;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings_extra_phones" ADD COLUMN "tech_point" varchar;`)
  // Runda 1811 D5: the Rabka Tech number (already in staging and production since H18) is the
  // Rabka point — marked once here, so later edits in the panel are never overwritten by a seed.
  await db.execute(sql`
   UPDATE "hub_settings_extra_phones" SET "tech_point" = 'Rabka-Zdrój'
   WHERE regexp_replace("number", '[^0-9]', '', 'g') IN ('185412055', '48185412055')
     AND "tech_point" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings_extra_phones" DROP COLUMN "tech_point";`)
}

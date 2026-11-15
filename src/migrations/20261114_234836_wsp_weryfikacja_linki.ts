/**
 * Runda 1411 (R1): the line switch „Pokazuj linki weryfikacji (CEIDG)” in `SiteSettings.shared`.
 * Adds a column only; on by default, so every line keeps its CEIDG links until it turns them off.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN "shared_verify_links" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN "shared_verify_links";`)
}

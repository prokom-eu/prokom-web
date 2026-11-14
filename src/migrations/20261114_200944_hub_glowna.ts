import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings" ADD COLUMN "home" jsonb;
  ALTER TABLE "hub_settings" ADD COLUMN "brands" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings" DROP COLUMN "home";
  ALTER TABLE "hub_settings" DROP COLUMN "brands";`)
}

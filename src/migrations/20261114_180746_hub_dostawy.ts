import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings" ADD COLUMN "deliveries" jsonb;
  ALTER TABLE "hub_settings" ADD COLUMN "cooperation" jsonb;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings" DROP COLUMN "deliveries";
  ALTER TABLE "hub_settings" DROP COLUMN "cooperation";`)
}

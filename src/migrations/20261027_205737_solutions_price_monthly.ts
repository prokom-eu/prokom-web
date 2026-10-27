import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solutions" ADD COLUMN "price_monthly" boolean DEFAULT false;
  ALTER TABLE "solutions" ADD COLUMN "size_names_start" varchar;
  ALTER TABLE "solutions" ADD COLUMN "size_names_std" varchar;
  ALTER TABLE "solutions" ADD COLUMN "size_names_full" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_price_monthly" boolean DEFAULT false;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_start" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_std" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_size_names_full" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solutions" DROP COLUMN "price_monthly";
  ALTER TABLE "solutions" DROP COLUMN "size_names_start";
  ALTER TABLE "solutions" DROP COLUMN "size_names_std";
  ALTER TABLE "solutions" DROP COLUMN "size_names_full";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_price_monthly";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_start";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_std";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_size_names_full";`)
}

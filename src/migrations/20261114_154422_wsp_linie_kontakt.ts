import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company_data_lines" ADD COLUMN "phone" varchar;
  ALTER TABLE "company_data_lines" ADD COLUMN "email" varchar;
  ALTER TABLE "company_data_lines" ADD COLUMN "hours" varchar;
  ALTER TABLE "company_data_lines" ADD COLUMN "promise" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "company_data_lines" DROP COLUMN "phone";
  ALTER TABLE "company_data_lines" DROP COLUMN "email";
  ALTER TABLE "company_data_lines" DROP COLUMN "hours";
  ALTER TABLE "company_data_lines" DROP COLUMN "promise";`)
}

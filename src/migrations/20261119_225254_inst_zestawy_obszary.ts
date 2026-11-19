import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_bundles_area" ADD VALUE IF NOT EXISTS 'dom';
  ALTER TYPE "public"."enum_bundles_area" ADD VALUE IF NOT EXISTS 'firma';
  ALTER TYPE "public"."enum_bundles_area" ADD VALUE IF NOT EXISTS 'kosciol';
  ALTER TYPE "public"."enum_bundles_area" ADD VALUE IF NOT EXISTS 'gmina';
  ALTER TYPE "public"."enum_bundles_area" ADD VALUE IF NOT EXISTS 'budowa';`)
}

// Down rebuilds the enum without the Instalacje areas: it fails (and rolls back) while bundles of
// Instalacje still use them — remove those bundles first.
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "bundles" ALTER COLUMN "area" SET DATA TYPE text;
  DROP TYPE "public"."enum_bundles_area";
  CREATE TYPE "public"."enum_bundles_area" AS ENUM('sklep', 'gastronomia', 'noclegi', 'biuro', 'gabinet', 'szkola', 'siec', 'ekrany');
  ALTER TABLE "bundles" ALTER COLUMN "area" SET DATA TYPE "public"."enum_bundles_area" USING "area"::"public"."enum_bundles_area";`)
}

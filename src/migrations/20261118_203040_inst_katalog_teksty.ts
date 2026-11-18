import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "biznes_settings" ADD COLUMN "catalog_offer_title" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "catalog_offer_meta_title" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "catalog_offer_description" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "catalog_offer_lead" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "catalog_brands_title" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "catalog_brands_description" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_offer_title" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_offer_meta_title" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_offer_description" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_offer_lead" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_brands_title" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "catalog_brands_description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "biznes_settings" DROP COLUMN "catalog_offer_title";
  ALTER TABLE "biznes_settings" DROP COLUMN "catalog_offer_meta_title";
  ALTER TABLE "biznes_settings" DROP COLUMN "catalog_offer_description";
  ALTER TABLE "biznes_settings" DROP COLUMN "catalog_offer_lead";
  ALTER TABLE "biznes_settings" DROP COLUMN "catalog_brands_title";
  ALTER TABLE "biznes_settings" DROP COLUMN "catalog_brands_description";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_offer_title";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_offer_meta_title";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_offer_description";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_offer_lead";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_brands_title";
  ALTER TABLE "instalacje_settings" DROP COLUMN "catalog_brands_description";`)
}

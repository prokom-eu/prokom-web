import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_catalog_categories_subcategories_help_action" AS ENUM('inquiry', 'vending');
  CREATE TYPE "public"."enum_catalog_categories_help_action" AS ENUM('inquiry', 'vending');
  ALTER TABLE "catalog_categories_subcategories" ADD COLUMN "help_title" varchar;
  ALTER TABLE "catalog_categories_subcategories" ADD COLUMN "help_text" varchar;
  ALTER TABLE "catalog_categories_subcategories" ADD COLUMN "help_button" varchar;
  ALTER TABLE "catalog_categories_subcategories" ADD COLUMN "help_action" "enum_catalog_categories_subcategories_help_action";
  ALTER TABLE "catalog_categories" ADD COLUMN "help_button" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "help_action" "enum_catalog_categories_help_action";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_categories_subcategories" DROP COLUMN "help_title";
  ALTER TABLE "catalog_categories_subcategories" DROP COLUMN "help_text";
  ALTER TABLE "catalog_categories_subcategories" DROP COLUMN "help_button";
  ALTER TABLE "catalog_categories_subcategories" DROP COLUMN "help_action";
  ALTER TABLE "catalog_categories" DROP COLUMN "help_button";
  ALTER TABLE "catalog_categories" DROP COLUMN "help_action";
  DROP TYPE "public"."enum_catalog_categories_subcategories_help_action";
  DROP TYPE "public"."enum_catalog_categories_help_action";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_content_status" AS ENUM('ready', 'needs-review');
  CREATE TYPE "public"."enum_products_batch" AS ENUM('0', '1', '2');
  CREATE TYPE "public"."enum__products_v_version_content_status" AS ENUM('ready', 'needs-review');
  CREATE TYPE "public"."enum__products_v_version_batch" AS ENUM('0', '1', '2');
  ALTER TABLE "products" ADD COLUMN "subcategory" varchar;
  ALTER TABLE "products" ADD COLUMN "sources_checked_at" timestamp(3) with time zone;
  ALTER TABLE "products" ADD COLUMN "content_status" "enum_products_content_status" DEFAULT 'ready';
  ALTER TABLE "products" ADD COLUMN "batch" "enum_products_batch";
  ALTER TABLE "_products_v" ADD COLUMN "version_subcategory" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_sources_checked_at" timestamp(3) with time zone;
  ALTER TABLE "_products_v" ADD COLUMN "version_content_status" "enum__products_v_version_content_status" DEFAULT 'ready';
  ALTER TABLE "_products_v" ADD COLUMN "version_batch" "enum__products_v_version_batch";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "subcategory";
  ALTER TABLE "products" DROP COLUMN "sources_checked_at";
  ALTER TABLE "products" DROP COLUMN "content_status";
  ALTER TABLE "products" DROP COLUMN "batch";
  ALTER TABLE "_products_v" DROP COLUMN "version_subcategory";
  ALTER TABLE "_products_v" DROP COLUMN "version_sources_checked_at";
  ALTER TABLE "_products_v" DROP COLUMN "version_content_status";
  ALTER TABLE "_products_v" DROP COLUMN "version_batch";
  DROP TYPE "public"."enum_products_content_status";
  DROP TYPE "public"."enum_products_batch";
  DROP TYPE "public"."enum__products_v_version_content_status";
  DROP TYPE "public"."enum__products_v_version_batch";`)
}

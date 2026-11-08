import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_categories" ADD COLUMN "menu_image_id" integer;
  ALTER TABLE "catalog_categories" ADD CONSTRAINT "catalog_categories_menu_image_id_media_id_fk" FOREIGN KEY ("menu_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "catalog_categories_menu_image_idx" ON "catalog_categories" USING btree ("menu_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_categories" DROP CONSTRAINT "catalog_categories_menu_image_id_media_id_fk";
  
  DROP INDEX "catalog_categories_menu_image_idx";
  ALTER TABLE "catalog_categories" DROP COLUMN "menu_image_id";`)
}

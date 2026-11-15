/**
 * Runda 1411 (R2): a photo for the extra page bubble of the hero wheel (`wheelLink.image`).
 * Adds a nullable column only; without a photo the bubble keeps its icon.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_groups" ADD COLUMN "wheel_link_image_id" integer;
  ALTER TABLE "catalog_groups" ADD CONSTRAINT "catalog_groups_wheel_link_image_id_media_id_fk" FOREIGN KEY ("wheel_link_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "catalog_groups_wheel_link_wheel_link_image_idx" ON "catalog_groups" USING btree ("wheel_link_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "catalog_groups" DROP CONSTRAINT "catalog_groups_wheel_link_image_id_media_id_fk";
  
  DROP INDEX "catalog_groups_wheel_link_wheel_link_image_idx";
  ALTER TABLE "catalog_groups" DROP COLUMN "wheel_link_image_id";`)
}

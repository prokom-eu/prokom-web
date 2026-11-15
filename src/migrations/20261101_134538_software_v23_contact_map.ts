import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_contact_page" ADD COLUMN "meet_lead" varchar;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD COLUMN "map_zoom_label" varchar;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD COLUMN "entrance_photo_id" integer;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD COLUMN "entrance_caption" varchar;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD COLUMN "meet_lead" varchar;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD COLUMN "map_zoom_label" varchar;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD COLUMN "entrance_photo_id" integer;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD COLUMN "entrance_caption" varchar;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD CONSTRAINT "pages_blocks_sw_contact_page_entrance_photo_id_media_id_fk" FOREIGN KEY ("entrance_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_entrance_photo_id_media_id_fk" FOREIGN KEY ("entrance_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_contact_page_entrance_photo_idx" ON "pages_blocks_sw_contact_page" USING btree ("entrance_photo_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_entrance_photo_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("entrance_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_sw_contact_page" DROP CONSTRAINT "pages_blocks_sw_contact_page_entrance_photo_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_sw_contact_page" DROP CONSTRAINT "_pages_v_blocks_sw_contact_page_entrance_photo_id_media_id_fk";
  
  DROP INDEX "pages_blocks_sw_contact_page_entrance_photo_idx";
  DROP INDEX "_pages_v_blocks_sw_contact_page_entrance_photo_idx";
  ALTER TABLE "pages_blocks_sw_contact_page" DROP COLUMN "meet_lead";
  ALTER TABLE "pages_blocks_sw_contact_page" DROP COLUMN "map_zoom_label";
  ALTER TABLE "pages_blocks_sw_contact_page" DROP COLUMN "entrance_photo_id";
  ALTER TABLE "pages_blocks_sw_contact_page" DROP COLUMN "entrance_caption";
  ALTER TABLE "_pages_v_blocks_sw_contact_page" DROP COLUMN "meet_lead";
  ALTER TABLE "_pages_v_blocks_sw_contact_page" DROP COLUMN "map_zoom_label";
  ALTER TABLE "_pages_v_blocks_sw_contact_page" DROP COLUMN "entrance_photo_id";
  ALTER TABLE "_pages_v_blocks_sw_contact_page" DROP COLUMN "entrance_caption";`)
}

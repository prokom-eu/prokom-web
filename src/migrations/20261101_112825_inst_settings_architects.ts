import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instalacje_settings" ADD COLUMN "architects_name" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_role" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_photo_id" integer;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_phone" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_email" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_quote" varchar;
  ALTER TABLE "instalacje_settings" ADD COLUMN "architects_response_text" varchar;
  ALTER TABLE "instalacje_settings" ADD CONSTRAINT "instalacje_settings_architects_photo_id_media_id_fk" FOREIGN KEY ("architects_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "instalacje_settings_architects_architects_photo_idx" ON "instalacje_settings" USING btree ("architects_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instalacje_settings" DROP CONSTRAINT "instalacje_settings_architects_photo_id_media_id_fk";
  
  DROP INDEX "instalacje_settings_architects_architects_photo_idx";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_name";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_role";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_photo_id";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_phone";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_email";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_quote";
  ALTER TABLE "instalacje_settings" DROP COLUMN "architects_response_text";`)
}

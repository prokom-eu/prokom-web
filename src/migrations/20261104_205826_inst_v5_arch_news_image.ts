import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inst_arch_news" ADD COLUMN "image_id" integer;
  ALTER TABLE "_inst_arch_news_v" ADD COLUMN "version_image_id" integer;
  ALTER TABLE "inst_arch_news" ADD CONSTRAINT "inst_arch_news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_inst_arch_news_v" ADD CONSTRAINT "_inst_arch_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "inst_arch_news_image_idx" ON "inst_arch_news" USING btree ("image_id");
  CREATE INDEX "_inst_arch_news_v_version_version_image_idx" ON "_inst_arch_news_v" USING btree ("version_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "inst_arch_news" DROP CONSTRAINT "inst_arch_news_image_id_media_id_fk";
  
  ALTER TABLE "_inst_arch_news_v" DROP CONSTRAINT "_inst_arch_news_v_version_image_id_media_id_fk";
  
  DROP INDEX "inst_arch_news_image_idx";
  DROP INDEX "_inst_arch_news_v_version_version_image_idx";
  ALTER TABLE "inst_arch_news" DROP COLUMN "image_id";
  ALTER TABLE "_inst_arch_news_v" DROP COLUMN "version_image_id";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "author_name" varchar;
  ALTER TABLE "posts" ADD COLUMN "author_role" varchar;
  ALTER TABLE "posts" ADD COLUMN "author_bio" varchar;
  ALTER TABLE "posts" ADD COLUMN "author_photo_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_name" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_role" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_bio" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_author_photo_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_author_photo_id_media_id_fk" FOREIGN KEY ("author_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_author_photo_id_media_id_fk" FOREIGN KEY ("version_author_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_author_author_photo_idx" ON "posts" USING btree ("author_photo_id");
  CREATE INDEX "_posts_v_version_author_version_author_photo_idx" ON "_posts_v" USING btree ("version_author_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP CONSTRAINT "posts_author_photo_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_author_photo_id_media_id_fk";
  
  DROP INDEX "posts_author_author_photo_idx";
  DROP INDEX "_posts_v_version_author_version_author_photo_idx";
  ALTER TABLE "posts" DROP COLUMN "author_name";
  ALTER TABLE "posts" DROP COLUMN "author_role";
  ALTER TABLE "posts" DROP COLUMN "author_bio";
  ALTER TABLE "posts" DROP COLUMN "author_photo_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_name";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_role";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_bio";
  ALTER TABLE "_posts_v" DROP COLUMN "version_author_photo_id";`)
}

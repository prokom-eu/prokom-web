import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_videos_match" AS ENUM('model', 'series', 'brand');
  CREATE TYPE "public"."enum__products_v_version_videos_match" AS ENUM('model', 'series', 'brand');
  CREATE TABLE "products_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"match" "enum_products_videos_match" DEFAULT 'model',
  	"active" boolean DEFAULT true,
  	"title" varchar,
  	"channel" varchar,
  	"lang" varchar
  );
  
  CREATE TABLE "_products_v_version_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"youtube_id" varchar,
  	"match" "enum__products_v_version_videos_match" DEFAULT 'model',
  	"active" boolean DEFAULT true,
  	"title" varchar,
  	"channel" varchar,
  	"lang" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "short_name" varchar;
  ALTER TABLE "products" ADD COLUMN "series" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_short_name" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_series" varchar;
  ALTER TABLE "products_videos" ADD CONSTRAINT "products_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_videos" ADD CONSTRAINT "_products_v_version_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_videos_order_idx" ON "products_videos" USING btree ("_order");
  CREATE INDEX "products_videos_parent_id_idx" ON "products_videos" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_videos_order_idx" ON "_products_v_version_videos" USING btree ("_order");
  CREATE INDEX "_products_v_version_videos_parent_id_idx" ON "_products_v_version_videos" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_videos" CASCADE;
  DROP TABLE "_products_v_version_videos" CASCADE;
  ALTER TABLE "products" DROP COLUMN "short_name";
  ALTER TABLE "products" DROP COLUMN "series";
  ALTER TABLE "_products_v" DROP COLUMN "version_short_name";
  ALTER TABLE "_products_v" DROP COLUMN "version_series";
  DROP TYPE "public"."enum_products_videos_match";
  DROP TYPE "public"."enum__products_v_version_videos_match";`)
}

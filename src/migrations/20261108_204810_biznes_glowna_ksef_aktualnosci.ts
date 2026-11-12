import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_ksef_variant" AS ENUM('full', 'band');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_ksef_variant" AS ENUM('full', 'band');
  CREATE TABLE "pages_blocks_bz_news_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"all_label" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_news_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"all_label" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "biznes_ksef_deadline" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_ksef_href" varchar DEFAULT '/ksef';
  ALTER TABLE "site_settings" ADD COLUMN "biznes_ksef_text_before" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "biznes_ksef_text_after" varchar;
  ALTER TABLE "pages_blocks_bz_ksef" ADD COLUMN "variant" "enum_pages_blocks_bz_ksef_variant" DEFAULT 'full';
  ALTER TABLE "_pages_v_blocks_bz_ksef" ADD COLUMN "variant" "enum__pages_v_blocks_bz_ksef_variant" DEFAULT 'full';
  ALTER TABLE "pages_blocks_bz_news_home" ADD CONSTRAINT "pages_blocks_bz_news_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_news_home" ADD CONSTRAINT "_pages_v_blocks_bz_news_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_news_home_order_idx" ON "pages_blocks_bz_news_home" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_news_home_parent_id_idx" ON "pages_blocks_bz_news_home" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_news_home_path_idx" ON "pages_blocks_bz_news_home" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_news_home_order_idx" ON "_pages_v_blocks_bz_news_home" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_news_home_parent_id_idx" ON "_pages_v_blocks_bz_news_home" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_news_home_path_idx" ON "_pages_v_blocks_bz_news_home" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_news_home" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_news_home" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "biznes_ksef_deadline";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_ksef_href";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_ksef_text_before";
  ALTER TABLE "site_settings" DROP COLUMN "biznes_ksef_text_after";
  ALTER TABLE "pages_blocks_bz_ksef" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_bz_ksef" DROP COLUMN "variant";
  DROP TYPE "public"."enum_pages_blocks_bz_ksef_variant";
  DROP TYPE "public"."enum__pages_v_blocks_bz_ksef_variant";`)
}

/**
 * Runda 1411 (R3): the block „Systemy, które u Ciebie wdrożymy” (`bzSystems`) — new tables only.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_systems_systems_statuses_tone" AS ENUM('ok', 'warn');
  CREATE TYPE "public"."enum_pages_blocks_bz_systems_systems_mode" AS ENUM('image', 'statuses');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_systems_systems_statuses_tone" AS ENUM('ok', 'warn');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_systems_systems_mode" AS ENUM('image', 'statuses');
  CREATE TABLE "pages_blocks_bz_systems_systems_statuses" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum_pages_blocks_bz_systems_systems_statuses_tone" DEFAULT 'ok'
  );
  
  CREATE TABLE "pages_blocks_bz_systems_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"badge" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"mode" "enum_pages_blocks_bz_systems_systems_mode" DEFAULT 'image',
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_systems_systems_statuses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum__pages_v_blocks_bz_systems_systems_statuses_tone" DEFAULT 'ok',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_systems_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"badge" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"mode" "enum__pages_v_blocks_bz_systems_systems_mode" DEFAULT 'image',
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_systems_systems_statuses" ADD CONSTRAINT "pages_blocks_bz_systems_systems_statuses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_systems_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_systems_systems" ADD CONSTRAINT "pages_blocks_bz_systems_systems_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_systems_systems" ADD CONSTRAINT "pages_blocks_bz_systems_systems_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_systems_systems" ADD CONSTRAINT "pages_blocks_bz_systems_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_systems" ADD CONSTRAINT "pages_blocks_bz_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_systems_systems_statuses" ADD CONSTRAINT "_pages_v_blocks_bz_systems_systems_statuses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_systems_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_systems_systems" ADD CONSTRAINT "_pages_v_blocks_bz_systems_systems_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_systems_systems" ADD CONSTRAINT "_pages_v_blocks_bz_systems_systems_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_systems_systems" ADD CONSTRAINT "_pages_v_blocks_bz_systems_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_systems" ADD CONSTRAINT "_pages_v_blocks_bz_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_systems_systems_statuses_order_idx" ON "pages_blocks_bz_systems_systems_statuses" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_systems_systems_statuses_parent_id_idx" ON "pages_blocks_bz_systems_systems_statuses" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_systems_systems_order_idx" ON "pages_blocks_bz_systems_systems" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_systems_systems_parent_id_idx" ON "pages_blocks_bz_systems_systems" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_systems_systems_partner_idx" ON "pages_blocks_bz_systems_systems" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_bz_systems_systems_image_idx" ON "pages_blocks_bz_systems_systems" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_systems_order_idx" ON "pages_blocks_bz_systems" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_systems_parent_id_idx" ON "pages_blocks_bz_systems" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_systems_path_idx" ON "pages_blocks_bz_systems" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_statuses_order_idx" ON "_pages_v_blocks_bz_systems_systems_statuses" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_statuses_parent_id_idx" ON "_pages_v_blocks_bz_systems_systems_statuses" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_order_idx" ON "_pages_v_blocks_bz_systems_systems" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_parent_id_idx" ON "_pages_v_blocks_bz_systems_systems" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_partner_idx" ON "_pages_v_blocks_bz_systems_systems" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_bz_systems_systems_image_idx" ON "_pages_v_blocks_bz_systems_systems" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_systems_order_idx" ON "_pages_v_blocks_bz_systems" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_systems_parent_id_idx" ON "_pages_v_blocks_bz_systems" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_systems_path_idx" ON "_pages_v_blocks_bz_systems" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_systems_systems_statuses" CASCADE;
  DROP TABLE "pages_blocks_bz_systems_systems" CASCADE;
  DROP TABLE "pages_blocks_bz_systems" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_systems_systems_statuses" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_systems_systems" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_systems" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_systems_systems_statuses_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_systems_systems_mode";
  DROP TYPE "public"."enum__pages_v_blocks_bz_systems_systems_statuses_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_systems_systems_mode";`)
}

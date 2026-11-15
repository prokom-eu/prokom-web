/**
 * Runda 1411 (R4): the block „Inne linie PRO-KOM” (`bzLines`) — new tables only.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_lines_lines_line" AS ENUM('instalacje', 'software', 'tech');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_lines_lines_line" AS ENUM('instalacje', 'software', 'tech');
  CREATE TABLE "pages_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" "enum_pages_blocks_bz_lines_lines_line",
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" "enum__pages_v_blocks_bz_lines_lines_line",
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_lines" (
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
  
  ALTER TABLE "pages_blocks_bz_lines_lines" ADD CONSTRAINT "pages_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_lines" ADD CONSTRAINT "pages_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_lines" ADD CONSTRAINT "_pages_v_blocks_bz_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_lines_lines_order_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_lines_parent_id_idx" ON "pages_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_order_idx" ON "pages_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_lines_parent_id_idx" ON "pages_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_lines_path_idx" ON "pages_blocks_bz_lines" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_order_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_order_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_lines_parent_id_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_lines_path_idx" ON "_pages_v_blocks_bz_lines" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "pages_blocks_bz_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_lines" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_lines_lines_line";
  DROP TYPE "public"."enum__pages_v_blocks_bz_lines_lines_line";`)
}

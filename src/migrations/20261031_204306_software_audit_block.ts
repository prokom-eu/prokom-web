import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_audit_form_report_rows_icon" AS ENUM('clock', 'phone', 'search', 'shield', 'users', 'doc');
  CREATE TYPE "public"."enum_pages_blocks_sw_audit_form_report_rows_status" AS ENUM('good', 'fix');
  CREATE TYPE "public"."enum_pages_blocks_sw_audit_form_checks_icon" AS ENUM('clock', 'phone', 'search', 'shield', 'users', 'doc');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_audit_form_report_rows_icon" AS ENUM('clock', 'phone', 'search', 'shield', 'users', 'doc');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_audit_form_report_rows_status" AS ENUM('good', 'fix');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_audit_form_checks_icon" AS ENUM('clock', 'phone', 'search', 'shield', 'users', 'doc');
  CREATE TABLE "pages_blocks_sw_audit_form_report_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_sw_audit_form_report_rows_icon",
  	"title" varchar,
  	"status" "enum_pages_blocks_sw_audit_form_report_rows_status",
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_audit_form_checks" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_sw_audit_form_checks_icon",
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_audit_form_level_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_audit_form_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_audit_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"form_label" varchar,
  	"url_label" varchar,
  	"url_placeholder" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"report_title" varchar,
  	"report_subtitle" varchar,
  	"report_badge" varchar,
  	"checks_eyebrow" varchar,
  	"checks_title" varchar,
  	"checks_lead" varchar,
  	"levels_eyebrow" varchar,
  	"levels_title" varchar,
  	"levels_lead" varchar,
  	"steps_eyebrow" varchar,
  	"steps_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_primary_label" varchar,
  	"cta_primary_href" varchar,
  	"cta_secondary_label" varchar,
  	"cta_secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_audit_form_report_rows" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_sw_audit_form_report_rows_icon",
  	"title" varchar,
  	"status" "enum__pages_v_blocks_sw_audit_form_report_rows_status",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_audit_form_checks" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_sw_audit_form_checks_icon",
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_audit_form_level_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_audit_form_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_audit_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"form_label" varchar,
  	"url_label" varchar,
  	"url_placeholder" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"report_title" varchar,
  	"report_subtitle" varchar,
  	"report_badge" varchar,
  	"checks_eyebrow" varchar,
  	"checks_title" varchar,
  	"checks_lead" varchar,
  	"levels_eyebrow" varchar,
  	"levels_title" varchar,
  	"levels_lead" varchar,
  	"steps_eyebrow" varchar,
  	"steps_title" varchar,
  	"cta_title" varchar,
  	"cta_text" varchar,
  	"cta_primary_label" varchar,
  	"cta_primary_href" varchar,
  	"cta_secondary_label" varchar,
  	"cta_secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_audit_form_report_rows" ADD CONSTRAINT "pages_blocks_sw_audit_form_report_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_audit_form_checks" ADD CONSTRAINT "pages_blocks_sw_audit_form_checks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_audit_form_level_buttons" ADD CONSTRAINT "pages_blocks_sw_audit_form_level_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_audit_form_steps" ADD CONSTRAINT "pages_blocks_sw_audit_form_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_audit_form" ADD CONSTRAINT "pages_blocks_sw_audit_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_audit_form_report_rows" ADD CONSTRAINT "_pages_v_blocks_sw_audit_form_report_rows_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_audit_form_checks" ADD CONSTRAINT "_pages_v_blocks_sw_audit_form_checks_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_audit_form_level_buttons" ADD CONSTRAINT "_pages_v_blocks_sw_audit_form_level_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_audit_form_steps" ADD CONSTRAINT "_pages_v_blocks_sw_audit_form_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_audit_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_audit_form" ADD CONSTRAINT "_pages_v_blocks_sw_audit_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_audit_form_report_rows_order_idx" ON "pages_blocks_sw_audit_form_report_rows" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_audit_form_report_rows_parent_id_idx" ON "pages_blocks_sw_audit_form_report_rows" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_audit_form_checks_order_idx" ON "pages_blocks_sw_audit_form_checks" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_audit_form_checks_parent_id_idx" ON "pages_blocks_sw_audit_form_checks" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_audit_form_level_buttons_order_idx" ON "pages_blocks_sw_audit_form_level_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_audit_form_level_buttons_parent_id_idx" ON "pages_blocks_sw_audit_form_level_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_audit_form_steps_order_idx" ON "pages_blocks_sw_audit_form_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_audit_form_steps_parent_id_idx" ON "pages_blocks_sw_audit_form_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_audit_form_order_idx" ON "pages_blocks_sw_audit_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_audit_form_parent_id_idx" ON "pages_blocks_sw_audit_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_audit_form_path_idx" ON "pages_blocks_sw_audit_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_report_rows_order_idx" ON "_pages_v_blocks_sw_audit_form_report_rows" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_report_rows_parent_id_idx" ON "_pages_v_blocks_sw_audit_form_report_rows" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_checks_order_idx" ON "_pages_v_blocks_sw_audit_form_checks" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_checks_parent_id_idx" ON "_pages_v_blocks_sw_audit_form_checks" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_level_buttons_order_idx" ON "_pages_v_blocks_sw_audit_form_level_buttons" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_level_buttons_parent_id_idx" ON "_pages_v_blocks_sw_audit_form_level_buttons" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_steps_order_idx" ON "_pages_v_blocks_sw_audit_form_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_steps_parent_id_idx" ON "_pages_v_blocks_sw_audit_form_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_order_idx" ON "_pages_v_blocks_sw_audit_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_parent_id_idx" ON "_pages_v_blocks_sw_audit_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_audit_form_path_idx" ON "_pages_v_blocks_sw_audit_form" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_audit_form_report_rows" CASCADE;
  DROP TABLE "pages_blocks_sw_audit_form_checks" CASCADE;
  DROP TABLE "pages_blocks_sw_audit_form_level_buttons" CASCADE;
  DROP TABLE "pages_blocks_sw_audit_form_steps" CASCADE;
  DROP TABLE "pages_blocks_sw_audit_form" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_audit_form_report_rows" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_audit_form_checks" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_audit_form_level_buttons" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_audit_form_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_audit_form" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_sw_audit_form_report_rows_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_audit_form_report_rows_status";
  DROP TYPE "public"."enum_pages_blocks_sw_audit_form_checks_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_audit_form_report_rows_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_audit_form_report_rows_status";
  DROP TYPE "public"."enum__pages_v_blocks_sw_audit_form_checks_icon";`)
}

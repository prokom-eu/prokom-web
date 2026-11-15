import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_channels_kind" AS ENUM('phone', 'email', 'salon', 'online');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_shortcuts_icon" AS ENUM('wand', 'search');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_hints_topic" AS ENUM('none', 'all', 'strona', 'system', 'mobile', 'laczenie', 'opieka', 'audyt');
  CREATE TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'zakopane', 'prokom');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_channels_kind" AS ENUM('phone', 'email', 'salon', 'online');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_shortcuts_icon" AS ENUM('wand', 'search');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_hints_topic" AS ENUM('none', 'all', 'strona', 'system', 'mobile', 'laczenie', 'opieka', 'audyt');
  CREATE TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line" AS ENUM('biznes', 'instalacje', 'tech', 'zakopane', 'prokom');
  CREATE TABLE "pages_blocks_sw_contact_page_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_blocks_sw_contact_page_channels_kind",
  	"label" varchar,
  	"badge" varchar,
  	"value" varchar,
  	"text" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_sw_contact_page_shortcuts_icon" DEFAULT 'wand',
  	"title" varchar,
  	"href" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" "enum_pages_blocks_sw_contact_page_hints_topic",
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" "enum_pages_blocks_sw_contact_page_lines_line",
  	"label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"hours_note" varchar,
  	"steps_title" varchar,
  	"form_eyebrow" varchar,
  	"form_title" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"project_message_label" varchar,
  	"project_message_placeholder" varchar,
  	"hints_label" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"contact_hint" varchar,
  	"talk_label" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"lines_eyebrow" varchar,
  	"lines_title" varchar,
  	"lines_text" varchar,
  	"lines_more_label" varchar,
  	"lines_more_href" varchar,
  	"meet_eyebrow" varchar,
  	"meet_title" varchar,
  	"map_caption" varchar,
  	"navigate_label" varchar,
  	"map_href" varchar,
  	"company_title" varchar,
  	"company_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_blocks_sw_contact_page_channels_kind",
  	"label" varchar,
  	"badge" varchar,
  	"value" varchar,
  	"text" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"when" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_sw_contact_page_shortcuts_icon" DEFAULT 'wand',
  	"title" varchar,
  	"href" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"topic" "enum__pages_v_blocks_sw_contact_page_hints_topic",
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"line" "enum__pages_v_blocks_sw_contact_page_lines_line",
  	"label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page_places" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"title_accent" varchar,
  	"lead" varchar,
  	"hours_note" varchar,
  	"steps_title" varchar,
  	"form_eyebrow" varchar,
  	"form_title" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"project_message_label" varchar,
  	"project_message_placeholder" varchar,
  	"hints_label" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"contact_hint" varchar,
  	"talk_label" varchar,
  	"submit" varchar,
  	"submit_note" varchar,
  	"lines_eyebrow" varchar,
  	"lines_title" varchar,
  	"lines_text" varchar,
  	"lines_more_label" varchar,
  	"lines_more_href" varchar,
  	"meet_eyebrow" varchar,
  	"meet_title" varchar,
  	"map_caption" varchar,
  	"navigate_label" varchar,
  	"map_href" varchar,
  	"company_title" varchar,
  	"company_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_contact_page_channels" ADD CONSTRAINT "pages_blocks_sw_contact_page_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_steps" ADD CONSTRAINT "pages_blocks_sw_contact_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_shortcuts" ADD CONSTRAINT "pages_blocks_sw_contact_page_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_hints" ADD CONSTRAINT "pages_blocks_sw_contact_page_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_lines" ADD CONSTRAINT "pages_blocks_sw_contact_page_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page_places" ADD CONSTRAINT "pages_blocks_sw_contact_page_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact_page" ADD CONSTRAINT "pages_blocks_sw_contact_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_channels" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_steps" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_shortcuts" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_hints" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_lines" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page_places" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_places_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_page" ADD CONSTRAINT "_pages_v_blocks_sw_contact_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_contact_page_channels_order_idx" ON "pages_blocks_sw_contact_page_channels" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_channels_parent_id_idx" ON "pages_blocks_sw_contact_page_channels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_steps_order_idx" ON "pages_blocks_sw_contact_page_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_steps_parent_id_idx" ON "pages_blocks_sw_contact_page_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_shortcuts_order_idx" ON "pages_blocks_sw_contact_page_shortcuts" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_shortcuts_parent_id_idx" ON "pages_blocks_sw_contact_page_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_hints_order_idx" ON "pages_blocks_sw_contact_page_hints" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_hints_parent_id_idx" ON "pages_blocks_sw_contact_page_hints" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_lines_order_idx" ON "pages_blocks_sw_contact_page_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_lines_parent_id_idx" ON "pages_blocks_sw_contact_page_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_places_order_idx" ON "pages_blocks_sw_contact_page_places" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_places_parent_id_idx" ON "pages_blocks_sw_contact_page_places" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_order_idx" ON "pages_blocks_sw_contact_page" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_page_parent_id_idx" ON "pages_blocks_sw_contact_page" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_page_path_idx" ON "pages_blocks_sw_contact_page" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_channels_order_idx" ON "_pages_v_blocks_sw_contact_page_channels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_channels_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_channels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_steps_order_idx" ON "_pages_v_blocks_sw_contact_page_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_steps_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_shortcuts_order_idx" ON "_pages_v_blocks_sw_contact_page_shortcuts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_shortcuts_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_hints_order_idx" ON "_pages_v_blocks_sw_contact_page_hints" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_hints_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_hints" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_lines_order_idx" ON "_pages_v_blocks_sw_contact_page_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_lines_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_places_order_idx" ON "_pages_v_blocks_sw_contact_page_places" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_places_parent_id_idx" ON "_pages_v_blocks_sw_contact_page_places" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_order_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_parent_id_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_page_path_idx" ON "_pages_v_blocks_sw_contact_page" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_contact_page_channels" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_steps" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_shortcuts" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_hints" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_lines" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page_places" CASCADE;
  DROP TABLE "pages_blocks_sw_contact_page" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_channels" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_shortcuts" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_hints" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page_places" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_page" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_channels_kind";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_shortcuts_icon";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_hints_topic";
  DROP TYPE "public"."enum_pages_blocks_sw_contact_page_lines_line";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_channels_kind";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_shortcuts_icon";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_hints_topic";
  DROP TYPE "public"."enum__pages_v_blocks_sw_contact_page_lines_line";`)
}

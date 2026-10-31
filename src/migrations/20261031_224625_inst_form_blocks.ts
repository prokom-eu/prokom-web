import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_inst_planner_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_planner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_contact_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_service_desk_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_service_desk" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_planner_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_planner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_contact_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_service_desk_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_service_desk" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"cta_eyebrow" varchar,
  	"cta_heading" varchar,
  	"cta_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "pages_blocks_inst_planner_hero_facts" ADD CONSTRAINT "pages_blocks_inst_planner_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_planner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_planner" ADD CONSTRAINT "pages_blocks_inst_planner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_contact_hero_facts" ADD CONSTRAINT "pages_blocks_inst_contact_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_contact" ADD CONSTRAINT "pages_blocks_inst_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_service_desk_hero_facts" ADD CONSTRAINT "pages_blocks_inst_service_desk_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_service_desk"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_service_desk" ADD CONSTRAINT "pages_blocks_inst_service_desk_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_texts" ADD CONSTRAINT "pages_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_planner_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_planner_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_planner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_planner" ADD CONSTRAINT "_pages_v_blocks_inst_planner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_contact_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_contact_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_contact" ADD CONSTRAINT "_pages_v_blocks_inst_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_service_desk_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_service_desk_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_service_desk"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_service_desk" ADD CONSTRAINT "_pages_v_blocks_inst_service_desk_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_texts" ADD CONSTRAINT "_pages_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_inst_planner_hero_facts_order_idx" ON "pages_blocks_inst_planner_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_planner_hero_facts_parent_id_idx" ON "pages_blocks_inst_planner_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_planner_order_idx" ON "pages_blocks_inst_planner" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_planner_parent_id_idx" ON "pages_blocks_inst_planner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_planner_path_idx" ON "pages_blocks_inst_planner" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_contact_hero_facts_order_idx" ON "pages_blocks_inst_contact_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_contact_hero_facts_parent_id_idx" ON "pages_blocks_inst_contact_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_contact_order_idx" ON "pages_blocks_inst_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_contact_parent_id_idx" ON "pages_blocks_inst_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_contact_path_idx" ON "pages_blocks_inst_contact" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_service_desk_hero_facts_order_idx" ON "pages_blocks_inst_service_desk_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_service_desk_hero_facts_parent_id_idx" ON "pages_blocks_inst_service_desk_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_service_desk_order_idx" ON "pages_blocks_inst_service_desk" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_service_desk_parent_id_idx" ON "pages_blocks_inst_service_desk" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_service_desk_path_idx" ON "pages_blocks_inst_service_desk" USING btree ("_path");
  CREATE INDEX "pages_texts_order_parent" ON "pages_texts" USING btree ("order","parent_id");
  CREATE INDEX "_pages_v_blocks_inst_planner_hero_facts_order_idx" ON "_pages_v_blocks_inst_planner_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_planner_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_planner_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_planner_order_idx" ON "_pages_v_blocks_inst_planner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_planner_parent_id_idx" ON "_pages_v_blocks_inst_planner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_planner_path_idx" ON "_pages_v_blocks_inst_planner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_contact_hero_facts_order_idx" ON "_pages_v_blocks_inst_contact_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_contact_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_contact_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_contact_order_idx" ON "_pages_v_blocks_inst_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_contact_parent_id_idx" ON "_pages_v_blocks_inst_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_contact_path_idx" ON "_pages_v_blocks_inst_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_service_desk_hero_facts_order_idx" ON "_pages_v_blocks_inst_service_desk_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_service_desk_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_service_desk_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_service_desk_order_idx" ON "_pages_v_blocks_inst_service_desk" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_service_desk_parent_id_idx" ON "_pages_v_blocks_inst_service_desk" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_service_desk_path_idx" ON "_pages_v_blocks_inst_service_desk" USING btree ("_path");
  CREATE INDEX "_pages_v_texts_order_parent" ON "_pages_v_texts" USING btree ("order","parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_inst_planner_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_planner" CASCADE;
  DROP TABLE "pages_blocks_inst_contact_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_contact" CASCADE;
  DROP TABLE "pages_blocks_inst_service_desk_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_service_desk" CASCADE;
  DROP TABLE "pages_texts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_planner_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_planner" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_contact_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_service_desk_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_service_desk" CASCADE;
  DROP TABLE "_pages_v_texts" CASCADE;`)
}

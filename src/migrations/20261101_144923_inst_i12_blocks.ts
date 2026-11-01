import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_realizations_kind" AS ENUM('firma', 'kosciol', 'gastro', 'sklep', 'szkola', 'dom');
  CREATE TYPE "public"."enum__realizations_v_version_kind" AS ENUM('firma', 'kosciol', 'gastro', 'sklep', 'szkola', 'dom');
  CREATE TABLE "pages_blocks_inst_offer_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_offer" (
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
  
  CREATE TABLE "pages_blocks_inst_realizations_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_realizations" (
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
  
  CREATE TABLE "pages_blocks_inst_about_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_about" (
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
  
  CREATE TABLE "pages_blocks_inst_guide_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_guide" (
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
  
  CREATE TABLE "_pages_v_blocks_inst_offer_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_offer" (
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
  
  CREATE TABLE "_pages_v_blocks_inst_realizations_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_realizations" (
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
  
  CREATE TABLE "_pages_v_blocks_inst_about_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_about" (
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
  
  CREATE TABLE "_pages_v_blocks_inst_guide_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_guide" (
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
  
  ALTER TABLE "realizations" ADD COLUMN "kind" "enum_realizations_kind";
  ALTER TABLE "_realizations_v" ADD COLUMN "version_kind" "enum__realizations_v_version_kind";
  ALTER TABLE "pages_blocks_inst_offer_hero_facts" ADD CONSTRAINT "pages_blocks_inst_offer_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_offer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_offer" ADD CONSTRAINT "pages_blocks_inst_offer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_realizations_hero_facts" ADD CONSTRAINT "pages_blocks_inst_realizations_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_realizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_realizations" ADD CONSTRAINT "pages_blocks_inst_realizations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_about_hero_facts" ADD CONSTRAINT "pages_blocks_inst_about_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_about" ADD CONSTRAINT "pages_blocks_inst_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_guide_hero_facts" ADD CONSTRAINT "pages_blocks_inst_guide_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_guide" ADD CONSTRAINT "pages_blocks_inst_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_offer_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_offer_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_offer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_offer" ADD CONSTRAINT "_pages_v_blocks_inst_offer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_realizations_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_realizations_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_realizations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_realizations" ADD CONSTRAINT "_pages_v_blocks_inst_realizations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_about_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_about_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_about"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_about" ADD CONSTRAINT "_pages_v_blocks_inst_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_guide_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_guide_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_guide" ADD CONSTRAINT "_pages_v_blocks_inst_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_inst_offer_hero_facts_order_idx" ON "pages_blocks_inst_offer_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_offer_hero_facts_parent_id_idx" ON "pages_blocks_inst_offer_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_offer_order_idx" ON "pages_blocks_inst_offer" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_offer_parent_id_idx" ON "pages_blocks_inst_offer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_offer_path_idx" ON "pages_blocks_inst_offer" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_realizations_hero_facts_order_idx" ON "pages_blocks_inst_realizations_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_realizations_hero_facts_parent_id_idx" ON "pages_blocks_inst_realizations_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_realizations_order_idx" ON "pages_blocks_inst_realizations" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_realizations_parent_id_idx" ON "pages_blocks_inst_realizations" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_realizations_path_idx" ON "pages_blocks_inst_realizations" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_about_hero_facts_order_idx" ON "pages_blocks_inst_about_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_about_hero_facts_parent_id_idx" ON "pages_blocks_inst_about_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_about_order_idx" ON "pages_blocks_inst_about" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_about_parent_id_idx" ON "pages_blocks_inst_about" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_about_path_idx" ON "pages_blocks_inst_about" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_guide_hero_facts_order_idx" ON "pages_blocks_inst_guide_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_guide_hero_facts_parent_id_idx" ON "pages_blocks_inst_guide_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_guide_order_idx" ON "pages_blocks_inst_guide" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_guide_parent_id_idx" ON "pages_blocks_inst_guide" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_guide_path_idx" ON "pages_blocks_inst_guide" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_offer_hero_facts_order_idx" ON "_pages_v_blocks_inst_offer_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_offer_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_offer_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_offer_order_idx" ON "_pages_v_blocks_inst_offer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_offer_parent_id_idx" ON "_pages_v_blocks_inst_offer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_offer_path_idx" ON "_pages_v_blocks_inst_offer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_realizations_hero_facts_order_idx" ON "_pages_v_blocks_inst_realizations_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_realizations_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_realizations_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_realizations_order_idx" ON "_pages_v_blocks_inst_realizations" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_realizations_parent_id_idx" ON "_pages_v_blocks_inst_realizations" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_realizations_path_idx" ON "_pages_v_blocks_inst_realizations" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_about_hero_facts_order_idx" ON "_pages_v_blocks_inst_about_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_about_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_about_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_about_order_idx" ON "_pages_v_blocks_inst_about" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_about_parent_id_idx" ON "_pages_v_blocks_inst_about" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_about_path_idx" ON "_pages_v_blocks_inst_about" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_guide_hero_facts_order_idx" ON "_pages_v_blocks_inst_guide_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_guide_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_guide_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_guide_order_idx" ON "_pages_v_blocks_inst_guide" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_guide_parent_id_idx" ON "_pages_v_blocks_inst_guide" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_guide_path_idx" ON "_pages_v_blocks_inst_guide" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_inst_offer_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_offer" CASCADE;
  DROP TABLE "pages_blocks_inst_realizations_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_realizations" CASCADE;
  DROP TABLE "pages_blocks_inst_about_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_about" CASCADE;
  DROP TABLE "pages_blocks_inst_guide_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_guide" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_offer_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_offer" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_realizations_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_realizations" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_about_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_about" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_guide_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_guide" CASCADE;
  ALTER TABLE "realizations" DROP COLUMN "kind";
  ALTER TABLE "_realizations_v" DROP COLUMN "version_kind";
  DROP TYPE "public"."enum_realizations_kind";
  DROP TYPE "public"."enum__realizations_v_version_kind";`)
}

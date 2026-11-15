import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_references_kinds_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_references_kinds_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TABLE "pages_blocks_bz_references_kinds" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum_pages_blocks_bz_references_kinds_icon",
  	"examples" varchar,
  	"solutions" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_references_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"source" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_facts_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"owner_label" varchar,
  	"owner_quote" varchar,
  	"owner_highlight" varchar,
  	"owner_name" varchar,
  	"owner_role" varchar,
  	"owner_year" varchar,
  	"owner_year_text" varchar,
  	"owner_photo_placeholder" boolean DEFAULT false,
  	"authorizations_label" varchar,
  	"area_text" varchar,
  	"contact_link_label" varchar,
  	"contact_link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"all_label" varchar,
  	"read_label" varchar DEFAULT 'Czytaj',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_contact_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"form_heading" varchar,
  	"form_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"partners_id" integer
  );
  
  CREATE TABLE "_pages_v_blocks_bz_references_kinds" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"icon" "enum__pages_v_blocks_bz_references_kinds_icon",
  	"examples" varchar,
  	"solutions" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_references_reviews" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"quote" varchar,
  	"author" varchar,
  	"source" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_references" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_facts_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"owner_label" varchar,
  	"owner_quote" varchar,
  	"owner_highlight" varchar,
  	"owner_name" varchar,
  	"owner_role" varchar,
  	"owner_year" varchar,
  	"owner_year_text" varchar,
  	"owner_photo_placeholder" boolean DEFAULT false,
  	"authorizations_label" varchar,
  	"area_text" varchar,
  	"contact_link_label" varchar,
  	"contact_link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"all_label" varchar,
  	"read_label" varchar DEFAULT 'Czytaj',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_contact_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"form_heading" varchar,
  	"form_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"partners_id" integer
  );
  
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_faq" ADD COLUMN "lead" varchar;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_faq" ADD COLUMN "lead" varchar;
  ALTER TABLE "pages_blocks_bz_references_kinds" ADD CONSTRAINT "pages_blocks_bz_references_kinds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_references_reviews" ADD CONSTRAINT "pages_blocks_bz_references_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_references" ADD CONSTRAINT "pages_blocks_bz_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_facts_stats" ADD CONSTRAINT "pages_blocks_bz_facts_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_facts" ADD CONSTRAINT "pages_blocks_bz_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_news" ADD CONSTRAINT "pages_blocks_bz_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_contact_promises" ADD CONSTRAINT "pages_blocks_bz_contact_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_contact" ADD CONSTRAINT "pages_blocks_bz_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_references_kinds" ADD CONSTRAINT "_pages_v_blocks_bz_references_kinds_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_references_reviews" ADD CONSTRAINT "_pages_v_blocks_bz_references_reviews_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_references"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_references" ADD CONSTRAINT "_pages_v_blocks_bz_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_facts_stats" ADD CONSTRAINT "_pages_v_blocks_bz_facts_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD CONSTRAINT "_pages_v_blocks_bz_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_news" ADD CONSTRAINT "_pages_v_blocks_bz_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_contact_promises" ADD CONSTRAINT "_pages_v_blocks_bz_contact_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_contact" ADD CONSTRAINT "_pages_v_blocks_bz_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_references_kinds_order_idx" ON "pages_blocks_bz_references_kinds" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_references_kinds_parent_id_idx" ON "pages_blocks_bz_references_kinds" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_references_reviews_order_idx" ON "pages_blocks_bz_references_reviews" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_references_reviews_parent_id_idx" ON "pages_blocks_bz_references_reviews" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_references_order_idx" ON "pages_blocks_bz_references" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_references_parent_id_idx" ON "pages_blocks_bz_references" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_references_path_idx" ON "pages_blocks_bz_references" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_facts_stats_order_idx" ON "pages_blocks_bz_facts_stats" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_facts_stats_parent_id_idx" ON "pages_blocks_bz_facts_stats" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_facts_order_idx" ON "pages_blocks_bz_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_facts_parent_id_idx" ON "pages_blocks_bz_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_facts_path_idx" ON "pages_blocks_bz_facts" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_news_order_idx" ON "pages_blocks_bz_news" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_news_parent_id_idx" ON "pages_blocks_bz_news" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_news_path_idx" ON "pages_blocks_bz_news" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_contact_promises_order_idx" ON "pages_blocks_bz_contact_promises" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_contact_promises_parent_id_idx" ON "pages_blocks_bz_contact_promises" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_contact_order_idx" ON "pages_blocks_bz_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_contact_parent_id_idx" ON "pages_blocks_bz_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_contact_path_idx" ON "pages_blocks_bz_contact" USING btree ("_path");
  CREATE INDEX "pages_rels_order_idx" ON "pages_rels" USING btree ("order");
  CREATE INDEX "pages_rels_parent_idx" ON "pages_rels" USING btree ("parent_id");
  CREATE INDEX "pages_rels_path_idx" ON "pages_rels" USING btree ("path");
  CREATE INDEX "pages_rels_media_id_idx" ON "pages_rels" USING btree ("media_id");
  CREATE INDEX "pages_rels_partners_id_idx" ON "pages_rels" USING btree ("partners_id");
  CREATE INDEX "_pages_v_blocks_bz_references_kinds_order_idx" ON "_pages_v_blocks_bz_references_kinds" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_references_kinds_parent_id_idx" ON "_pages_v_blocks_bz_references_kinds" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_references_reviews_order_idx" ON "_pages_v_blocks_bz_references_reviews" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_references_reviews_parent_id_idx" ON "_pages_v_blocks_bz_references_reviews" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_references_order_idx" ON "_pages_v_blocks_bz_references" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_references_parent_id_idx" ON "_pages_v_blocks_bz_references" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_references_path_idx" ON "_pages_v_blocks_bz_references" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_facts_stats_order_idx" ON "_pages_v_blocks_bz_facts_stats" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_facts_stats_parent_id_idx" ON "_pages_v_blocks_bz_facts_stats" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_facts_order_idx" ON "_pages_v_blocks_bz_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_facts_parent_id_idx" ON "_pages_v_blocks_bz_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_facts_path_idx" ON "_pages_v_blocks_bz_facts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_news_order_idx" ON "_pages_v_blocks_bz_news" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_news_parent_id_idx" ON "_pages_v_blocks_bz_news" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_news_path_idx" ON "_pages_v_blocks_bz_news" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_contact_promises_order_idx" ON "_pages_v_blocks_bz_contact_promises" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_contact_promises_parent_id_idx" ON "_pages_v_blocks_bz_contact_promises" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_contact_order_idx" ON "_pages_v_blocks_bz_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_contact_parent_id_idx" ON "_pages_v_blocks_bz_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_contact_path_idx" ON "_pages_v_blocks_bz_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_rels_order_idx" ON "_pages_v_rels" USING btree ("order");
  CREATE INDEX "_pages_v_rels_parent_idx" ON "_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX "_pages_v_rels_path_idx" ON "_pages_v_rels" USING btree ("path");
  CREATE INDEX "_pages_v_rels_media_id_idx" ON "_pages_v_rels" USING btree ("media_id");
  CREATE INDEX "_pages_v_rels_partners_id_idx" ON "_pages_v_rels" USING btree ("partners_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_references_kinds" CASCADE;
  DROP TABLE "pages_blocks_bz_references_reviews" CASCADE;
  DROP TABLE "pages_blocks_bz_references" CASCADE;
  DROP TABLE "pages_blocks_bz_facts_stats" CASCADE;
  DROP TABLE "pages_blocks_bz_facts" CASCADE;
  DROP TABLE "pages_blocks_bz_news" CASCADE;
  DROP TABLE "pages_blocks_bz_contact_promises" CASCADE;
  DROP TABLE "pages_blocks_bz_contact" CASCADE;
  DROP TABLE "pages_rels" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_references_kinds" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_references_reviews" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_references" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_facts_stats" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_news" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_contact_promises" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_contact" CASCADE;
  DROP TABLE "_pages_v_rels" CASCADE;
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_faq" DROP COLUMN "lead";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_faq" DROP COLUMN "lead";
  DROP TYPE "public"."enum_pages_blocks_bz_references_kinds_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_references_kinds_icon";`)
}

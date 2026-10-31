import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SW10: tab „Strona” of `Solutions` (`page`, ADR-014 SW2a pkt 5) — new columns and tables only.
 * `down` drops them with the page texts typed in the panel (the card, prices and the offer window
 * stay).
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_solutions_page_deliverables_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__solutions_v_version_page_deliverables_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TABLE "solutions_page_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "solutions_page_compare" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "solutions_page_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum_solutions_page_deliverables_icon"
  );
  
  CREATE TABLE "solutions_page_choice_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"caption" varchar
  );
  
  CREATE TABLE "solutions_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "_solutions_v_version_page_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_page_compare" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_page_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum__solutions_v_version_page_deliverables_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_page_choice_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_solutions_v_version_page_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "solutions" ADD COLUMN "page_eyebrow" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_title" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_title_accent" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_lead" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_price_caption" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_demo" jsonb;
  ALTER TABLE "solutions" ADD COLUMN "page_deliverables_title" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_choice_title" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_choice_note" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_faq_eyebrow" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_contact_eyebrow" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_contact_title" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_contact_lead" varchar;
  ALTER TABLE "solutions" ADD COLUMN "page_contact_quote_caption" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_eyebrow" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_title" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_title_accent" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_lead" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_price_caption" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_demo" jsonb;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_deliverables_title" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_choice_title" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_choice_note" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_faq_eyebrow" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_contact_eyebrow" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_contact_title" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_contact_lead" varchar;
  ALTER TABLE "_solutions_v" ADD COLUMN "version_page_contact_quote_caption" varchar;
  ALTER TABLE "solutions_page_tiles" ADD CONSTRAINT "solutions_page_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_page_compare" ADD CONSTRAINT "solutions_page_compare_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_page_deliverables" ADD CONSTRAINT "solutions_page_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_page_choice_options" ADD CONSTRAINT "solutions_page_choice_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "solutions_page_faq" ADD CONSTRAINT "solutions_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."solutions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_page_tiles" ADD CONSTRAINT "_solutions_v_version_page_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_page_compare" ADD CONSTRAINT "_solutions_v_version_page_compare_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_page_deliverables" ADD CONSTRAINT "_solutions_v_version_page_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_page_choice_options" ADD CONSTRAINT "_solutions_v_version_page_choice_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_solutions_v_version_page_faq" ADD CONSTRAINT "_solutions_v_version_page_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_solutions_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "solutions_page_tiles_order_idx" ON "solutions_page_tiles" USING btree ("_order");
  CREATE INDEX "solutions_page_tiles_parent_id_idx" ON "solutions_page_tiles" USING btree ("_parent_id");
  CREATE INDEX "solutions_page_compare_order_idx" ON "solutions_page_compare" USING btree ("_order");
  CREATE INDEX "solutions_page_compare_parent_id_idx" ON "solutions_page_compare" USING btree ("_parent_id");
  CREATE INDEX "solutions_page_deliverables_order_idx" ON "solutions_page_deliverables" USING btree ("_order");
  CREATE INDEX "solutions_page_deliverables_parent_id_idx" ON "solutions_page_deliverables" USING btree ("_parent_id");
  CREATE INDEX "solutions_page_choice_options_order_idx" ON "solutions_page_choice_options" USING btree ("_order");
  CREATE INDEX "solutions_page_choice_options_parent_id_idx" ON "solutions_page_choice_options" USING btree ("_parent_id");
  CREATE INDEX "solutions_page_faq_order_idx" ON "solutions_page_faq" USING btree ("_order");
  CREATE INDEX "solutions_page_faq_parent_id_idx" ON "solutions_page_faq" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_page_tiles_order_idx" ON "_solutions_v_version_page_tiles" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_page_tiles_parent_id_idx" ON "_solutions_v_version_page_tiles" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_page_compare_order_idx" ON "_solutions_v_version_page_compare" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_page_compare_parent_id_idx" ON "_solutions_v_version_page_compare" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_page_deliverables_order_idx" ON "_solutions_v_version_page_deliverables" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_page_deliverables_parent_id_idx" ON "_solutions_v_version_page_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_page_choice_options_order_idx" ON "_solutions_v_version_page_choice_options" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_page_choice_options_parent_id_idx" ON "_solutions_v_version_page_choice_options" USING btree ("_parent_id");
  CREATE INDEX "_solutions_v_version_page_faq_order_idx" ON "_solutions_v_version_page_faq" USING btree ("_order");
  CREATE INDEX "_solutions_v_version_page_faq_parent_id_idx" ON "_solutions_v_version_page_faq" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "solutions_page_tiles" CASCADE;
  DROP TABLE "solutions_page_compare" CASCADE;
  DROP TABLE "solutions_page_deliverables" CASCADE;
  DROP TABLE "solutions_page_choice_options" CASCADE;
  DROP TABLE "solutions_page_faq" CASCADE;
  DROP TABLE "_solutions_v_version_page_tiles" CASCADE;
  DROP TABLE "_solutions_v_version_page_compare" CASCADE;
  DROP TABLE "_solutions_v_version_page_deliverables" CASCADE;
  DROP TABLE "_solutions_v_version_page_choice_options" CASCADE;
  DROP TABLE "_solutions_v_version_page_faq" CASCADE;
  ALTER TABLE "solutions" DROP COLUMN "page_eyebrow";
  ALTER TABLE "solutions" DROP COLUMN "page_title";
  ALTER TABLE "solutions" DROP COLUMN "page_title_accent";
  ALTER TABLE "solutions" DROP COLUMN "page_lead";
  ALTER TABLE "solutions" DROP COLUMN "page_price_caption";
  ALTER TABLE "solutions" DROP COLUMN "page_demo";
  ALTER TABLE "solutions" DROP COLUMN "page_deliverables_title";
  ALTER TABLE "solutions" DROP COLUMN "page_choice_title";
  ALTER TABLE "solutions" DROP COLUMN "page_choice_note";
  ALTER TABLE "solutions" DROP COLUMN "page_faq_eyebrow";
  ALTER TABLE "solutions" DROP COLUMN "page_contact_eyebrow";
  ALTER TABLE "solutions" DROP COLUMN "page_contact_title";
  ALTER TABLE "solutions" DROP COLUMN "page_contact_lead";
  ALTER TABLE "solutions" DROP COLUMN "page_contact_quote_caption";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_eyebrow";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_title";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_title_accent";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_lead";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_price_caption";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_demo";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_deliverables_title";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_choice_title";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_choice_note";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_faq_eyebrow";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_contact_eyebrow";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_contact_title";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_contact_lead";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_page_contact_quote_caption";
  DROP TYPE "public"."enum_solutions_page_deliverables_icon";
  DROP TYPE "public"."enum__solutions_v_version_page_deliverables_icon";`)
}

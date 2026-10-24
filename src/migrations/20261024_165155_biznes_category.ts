import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_catalog_categories_included_section_cards_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TABLE "catalog_categories_included_section_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_catalog_categories_included_section_cards_icon",
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "catalog_categories_facts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"source" varchar,
  	"source_url" varchar,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  ALTER TABLE "catalog_categories" ADD COLUMN "included_section_eyebrow" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "included_section_title" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "facts_eyebrow" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "facts_title" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "faq_intro_eyebrow" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "faq_intro_title" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "faq_intro_lead" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "help_title" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "help_text" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "contact_heading" varchar;
  ALTER TABLE "catalog_categories" ADD COLUMN "contact_lead" varchar;
  ALTER TABLE "catalog_categories_included_section_cards" ADD CONSTRAINT "catalog_categories_included_section_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_categories_facts_items" ADD CONSTRAINT "catalog_categories_facts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "catalog_categories_included_section_cards_order_idx" ON "catalog_categories_included_section_cards" USING btree ("_order");
  CREATE INDEX "catalog_categories_included_section_cards_parent_id_idx" ON "catalog_categories_included_section_cards" USING btree ("_parent_id");
  CREATE INDEX "catalog_categories_facts_items_order_idx" ON "catalog_categories_facts_items" USING btree ("_order");
  CREATE INDEX "catalog_categories_facts_items_parent_id_idx" ON "catalog_categories_facts_items" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "catalog_categories_included_section_cards" CASCADE;
  DROP TABLE "catalog_categories_facts_items" CASCADE;
  ALTER TABLE "catalog_categories" DROP COLUMN "included_section_eyebrow";
  ALTER TABLE "catalog_categories" DROP COLUMN "included_section_title";
  ALTER TABLE "catalog_categories" DROP COLUMN "facts_eyebrow";
  ALTER TABLE "catalog_categories" DROP COLUMN "facts_title";
  ALTER TABLE "catalog_categories" DROP COLUMN "faq_intro_eyebrow";
  ALTER TABLE "catalog_categories" DROP COLUMN "faq_intro_title";
  ALTER TABLE "catalog_categories" DROP COLUMN "faq_intro_lead";
  ALTER TABLE "catalog_categories" DROP COLUMN "help_title";
  ALTER TABLE "catalog_categories" DROP COLUMN "help_text";
  ALTER TABLE "catalog_categories" DROP COLUMN "contact_heading";
  ALTER TABLE "catalog_categories" DROP COLUMN "contact_lead";
  DROP TYPE "public"."enum_catalog_categories_included_section_cards_icon";`)
}

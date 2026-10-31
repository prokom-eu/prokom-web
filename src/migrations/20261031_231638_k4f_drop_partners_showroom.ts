import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * K4f-2 (ADR-017 D-K4-3, decision of Krystian 31.10): the K31c showroom of Lenovo and Dell
 * (`Partners.showroom`) is replaced by the salons 2.0 (`Showrooms`) and its films are not
 * carried over. Removes its tables, columns and rows; `down` brings the structure back, empty.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "partners_showroom_segments_series" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_segments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_wizard_rules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "partners_showroom_videos" DISABLE ROW LEVEL SECURITY;
  -- Rows of the old showroom in the shared tables: product relations and the rules' texts.
  DELETE FROM "partners_rels" WHERE "path" LIKE 'showroom.%';
  DELETE FROM "partners_texts" WHERE "path" LIKE 'showroom.%';
  DROP TABLE "partners_showroom_segments_series" CASCADE;
  DROP TABLE "partners_showroom_segments" CASCADE;
  DROP TABLE "partners_showroom_wizard_options" CASCADE;
  DROP TABLE "partners_showroom_wizard" CASCADE;
  DROP TABLE "partners_showroom_wizard_rules" CASCADE;
  DROP TABLE "partners_showroom_services" CASCADE;
  DROP TABLE "partners_showroom_videos" CASCADE;
  ALTER TABLE "partners_rels" DROP CONSTRAINT "partners_rels_products_fk";
  
  DROP INDEX "partners_rels_products_id_idx";
  ALTER TABLE "partners" DROP COLUMN "showroom_h1";
  ALTER TABLE "partners" DROP COLUMN "showroom_lead";
  ALTER TABLE "partners" DROP COLUMN "showroom_compare_title";
  ALTER TABLE "partners" DROP COLUMN "showroom_wizard_title";
  ALTER TABLE "partners_rels" DROP COLUMN "products_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "partners_showroom_segments_series" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tier" varchar,
  	"audience" varchar,
  	"highlight" varchar,
  	"image_product_id" integer
  );
  
  CREATE TABLE "partners_showroom_segments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"key" varchar NOT NULL,
  	"icon_path" varchar
  );
  
  CREATE TABLE "partners_showroom_wizard_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"key" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_wizard" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_wizard_rules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series" varchar NOT NULL,
  	"why" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"icon_path" varchar,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "partners_showroom_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"series" varchar NOT NULL,
  	"youtube_id" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"title" varchar NOT NULL,
  	"channel" varchar,
  	"lang" varchar
  );
  
  ALTER TABLE "partners" ADD COLUMN "showroom_h1" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_lead" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_compare_title" varchar;
  ALTER TABLE "partners" ADD COLUMN "showroom_wizard_title" varchar;
  ALTER TABLE "partners_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "partners_showroom_segments_series" ADD CONSTRAINT "partners_showroom_segments_series_image_product_id_products_id_fk" FOREIGN KEY ("image_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners_showroom_segments_series" ADD CONSTRAINT "partners_showroom_segments_series_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_showroom_segments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_segments" ADD CONSTRAINT "partners_showroom_segments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard_options" ADD CONSTRAINT "partners_showroom_wizard_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners_showroom_wizard"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard" ADD CONSTRAINT "partners_showroom_wizard_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_wizard_rules" ADD CONSTRAINT "partners_showroom_wizard_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_services" ADD CONSTRAINT "partners_showroom_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_showroom_videos" ADD CONSTRAINT "partners_showroom_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partners_showroom_segments_series_order_idx" ON "partners_showroom_segments_series" USING btree ("_order");
  CREATE INDEX "partners_showroom_segments_series_parent_id_idx" ON "partners_showroom_segments_series" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_segments_series_image_product_idx" ON "partners_showroom_segments_series" USING btree ("image_product_id");
  CREATE INDEX "partners_showroom_segments_order_idx" ON "partners_showroom_segments" USING btree ("_order");
  CREATE INDEX "partners_showroom_segments_parent_id_idx" ON "partners_showroom_segments" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_options_order_idx" ON "partners_showroom_wizard_options" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_options_parent_id_idx" ON "partners_showroom_wizard_options" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_order_idx" ON "partners_showroom_wizard" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_parent_id_idx" ON "partners_showroom_wizard" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_wizard_rules_order_idx" ON "partners_showroom_wizard_rules" USING btree ("_order");
  CREATE INDEX "partners_showroom_wizard_rules_parent_id_idx" ON "partners_showroom_wizard_rules" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_services_order_idx" ON "partners_showroom_services" USING btree ("_order");
  CREATE INDEX "partners_showroom_services_parent_id_idx" ON "partners_showroom_services" USING btree ("_parent_id");
  CREATE INDEX "partners_showroom_videos_order_idx" ON "partners_showroom_videos" USING btree ("_order");
  CREATE INDEX "partners_showroom_videos_parent_id_idx" ON "partners_showroom_videos" USING btree ("_parent_id");
  ALTER TABLE "partners_rels" ADD CONSTRAINT "partners_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partners_rels_products_id_idx" ON "partners_rels" USING btree ("products_id");`)
}

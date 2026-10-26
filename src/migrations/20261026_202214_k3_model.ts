import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "partners_brand_page_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"source_url" varchar
  );
  
  CREATE TABLE "partners_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "catalog_categories_subcategories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar
  );
  
  CREATE TABLE "products_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"difference" varchar
  );
  
  CREATE TABLE "products_configurator_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "products_configurator_popular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"configuration" varchar
  );
  
  CREATE TABLE "products_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"audience" varchar
  );
  
  CREATE TABLE "_products_v_version_variants" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"difference" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_configurator_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_configurator_popular" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"configuration" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_packages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"audience" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "partners" ADD COLUMN "brand_page_has_page" boolean DEFAULT false;
  ALTER TABLE "partners" ADD COLUMN "brand_page_country" varchar;
  ALTER TABLE "partners" ADD COLUMN "brand_page_short_description" varchar;
  ALTER TABLE "partners" ADD COLUMN "brand_page_description" jsonb;
  ALTER TABLE "products" ADD COLUMN "subtitle" varchar;
  ALTER TABLE "products" ADD COLUMN "configurator_description" varchar;
  ALTER TABLE "products" ADD COLUMN "internal_notes" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_subtitle" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_configurator_description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_internal_notes" varchar;
  ALTER TABLE "partners_brand_page_facts" ADD CONSTRAINT "partners_brand_page_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partners_texts" ADD CONSTRAINT "partners_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_categories_subcategories" ADD CONSTRAINT "catalog_categories_subcategories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_variants" ADD CONSTRAINT "products_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configurator_options" ADD CONSTRAINT "products_configurator_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configurator_popular" ADD CONSTRAINT "products_configurator_popular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_packages" ADD CONSTRAINT "products_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_variants" ADD CONSTRAINT "_products_v_version_variants_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_configurator_options" ADD CONSTRAINT "_products_v_version_configurator_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_configurator_popular" ADD CONSTRAINT "_products_v_version_configurator_popular_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_packages" ADD CONSTRAINT "_products_v_version_packages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "partners_brand_page_facts_order_idx" ON "partners_brand_page_facts" USING btree ("_order");
  CREATE INDEX "partners_brand_page_facts_parent_id_idx" ON "partners_brand_page_facts" USING btree ("_parent_id");
  CREATE INDEX "partners_texts_order_parent" ON "partners_texts" USING btree ("order","parent_id");
  CREATE INDEX "catalog_categories_subcategories_order_idx" ON "catalog_categories_subcategories" USING btree ("_order");
  CREATE INDEX "catalog_categories_subcategories_parent_id_idx" ON "catalog_categories_subcategories" USING btree ("_parent_id");
  CREATE INDEX "products_variants_order_idx" ON "products_variants" USING btree ("_order");
  CREATE INDEX "products_variants_parent_id_idx" ON "products_variants" USING btree ("_parent_id");
  CREATE INDEX "products_configurator_options_order_idx" ON "products_configurator_options" USING btree ("_order");
  CREATE INDEX "products_configurator_options_parent_id_idx" ON "products_configurator_options" USING btree ("_parent_id");
  CREATE INDEX "products_configurator_popular_order_idx" ON "products_configurator_popular" USING btree ("_order");
  CREATE INDEX "products_configurator_popular_parent_id_idx" ON "products_configurator_popular" USING btree ("_parent_id");
  CREATE INDEX "products_packages_order_idx" ON "products_packages" USING btree ("_order");
  CREATE INDEX "products_packages_parent_id_idx" ON "products_packages" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_variants_order_idx" ON "_products_v_version_variants" USING btree ("_order");
  CREATE INDEX "_products_v_version_variants_parent_id_idx" ON "_products_v_version_variants" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_configurator_options_order_idx" ON "_products_v_version_configurator_options" USING btree ("_order");
  CREATE INDEX "_products_v_version_configurator_options_parent_id_idx" ON "_products_v_version_configurator_options" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_configurator_popular_order_idx" ON "_products_v_version_configurator_popular" USING btree ("_order");
  CREATE INDEX "_products_v_version_configurator_popular_parent_id_idx" ON "_products_v_version_configurator_popular" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_packages_order_idx" ON "_products_v_version_packages" USING btree ("_order");
  CREATE INDEX "_products_v_version_packages_parent_id_idx" ON "_products_v_version_packages" USING btree ("_parent_id");`)

  // `variants` was a list of texts (katalog v2); now rows {name, difference}. Move each text to
  // `name` (drafts and versions too) and drop the old rows, so nothing stays orphaned.
  await db.execute(sql`
   INSERT INTO "products_variants" ("_order", "_parent_id", "id", "name")
    SELECT "order", "parent_id", substr(md5(random()::text || "id"::text), 1, 24), "text"
    FROM "products_texts" WHERE "path" = 'variants';
  DELETE FROM "products_texts" WHERE "path" = 'variants';
  INSERT INTO "_products_v_version_variants" ("_order", "_parent_id", "name", "_uuid")
    SELECT "order", "parent_id", "text", substr(md5(random()::text || "id"::text), 1, 24)
    FROM "_products_v_texts" WHERE "path" = 'version.variants';
  DELETE FROM "_products_v_texts" WHERE "path" = 'version.variants';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Back to a list of texts: the version name survives, its difference is lost.
  await db.execute(sql`
   INSERT INTO "products_texts" ("order", "parent_id", "path", "text")
    SELECT "_order", "_parent_id", 'variants', "name"
    FROM "products_variants" WHERE "name" IS NOT NULL;
  INSERT INTO "_products_v_texts" ("order", "parent_id", "path", "text")
    SELECT "_order", "_parent_id", 'version.variants', "name"
    FROM "_products_v_version_variants" WHERE "name" IS NOT NULL;`)

  await db.execute(sql`
   DROP TABLE "partners_brand_page_facts" CASCADE;
  DROP TABLE "partners_texts" CASCADE;
  DROP TABLE "catalog_categories_subcategories" CASCADE;
  DROP TABLE "products_variants" CASCADE;
  DROP TABLE "products_configurator_options" CASCADE;
  DROP TABLE "products_configurator_popular" CASCADE;
  DROP TABLE "products_packages" CASCADE;
  DROP TABLE "_products_v_version_variants" CASCADE;
  DROP TABLE "_products_v_version_configurator_options" CASCADE;
  DROP TABLE "_products_v_version_configurator_popular" CASCADE;
  DROP TABLE "_products_v_version_packages" CASCADE;
  ALTER TABLE "partners" DROP COLUMN "brand_page_has_page";
  ALTER TABLE "partners" DROP COLUMN "brand_page_country";
  ALTER TABLE "partners" DROP COLUMN "brand_page_short_description";
  ALTER TABLE "partners" DROP COLUMN "brand_page_description";
  ALTER TABLE "products" DROP COLUMN "subtitle";
  ALTER TABLE "products" DROP COLUMN "configurator_description";
  ALTER TABLE "products" DROP COLUMN "internal_notes";
  ALTER TABLE "_products_v" DROP COLUMN "version_subtitle";
  ALTER TABLE "_products_v" DROP COLUMN "version_configurator_description";
  ALTER TABLE "_products_v" DROP COLUMN "version_internal_notes";`)
}

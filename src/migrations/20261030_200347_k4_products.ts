import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"hex" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "products_configurator_fixed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "products_recommended" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"label" varchar
  );
  
  CREATE TABLE "products_sources_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "_products_v_version_colors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"hex" varchar,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_configurator_fixed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_recommended" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_sources_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"url" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products_configurator_options" ADD COLUMN "help" varchar;
  ALTER TABLE "products_configurator_options" ADD COLUMN "long_values" boolean DEFAULT false;
  ALTER TABLE "_products_v_version_configurator_options" ADD COLUMN "help" varchar;
  ALTER TABLE "_products_v_version_configurator_options" ADD COLUMN "long_values" boolean DEFAULT false;
  ALTER TABLE "products_colors" ADD CONSTRAINT "products_colors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_colors" ADD CONSTRAINT "products_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_configurator_fixed" ADD CONSTRAINT "products_configurator_fixed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_recommended" ADD CONSTRAINT "products_recommended_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_recommended" ADD CONSTRAINT "products_recommended_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_sources_links" ADD CONSTRAINT "products_sources_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_colors" ADD CONSTRAINT "_products_v_version_colors_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_colors" ADD CONSTRAINT "_products_v_version_colors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_configurator_fixed" ADD CONSTRAINT "_products_v_version_configurator_fixed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_recommended" ADD CONSTRAINT "_products_v_version_recommended_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_recommended" ADD CONSTRAINT "_products_v_version_recommended_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_sources_links" ADD CONSTRAINT "_products_v_version_sources_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_colors_order_idx" ON "products_colors" USING btree ("_order");
  CREATE INDEX "products_colors_parent_id_idx" ON "products_colors" USING btree ("_parent_id");
  CREATE INDEX "products_colors_image_idx" ON "products_colors" USING btree ("image_id");
  CREATE INDEX "products_configurator_fixed_order_idx" ON "products_configurator_fixed" USING btree ("_order");
  CREATE INDEX "products_configurator_fixed_parent_id_idx" ON "products_configurator_fixed" USING btree ("_parent_id");
  CREATE INDEX "products_recommended_order_idx" ON "products_recommended" USING btree ("_order");
  CREATE INDEX "products_recommended_parent_id_idx" ON "products_recommended" USING btree ("_parent_id");
  CREATE INDEX "products_recommended_product_idx" ON "products_recommended" USING btree ("product_id");
  CREATE INDEX "products_sources_links_order_idx" ON "products_sources_links" USING btree ("_order");
  CREATE INDEX "products_sources_links_parent_id_idx" ON "products_sources_links" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_colors_order_idx" ON "_products_v_version_colors" USING btree ("_order");
  CREATE INDEX "_products_v_version_colors_parent_id_idx" ON "_products_v_version_colors" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_colors_image_idx" ON "_products_v_version_colors" USING btree ("image_id");
  CREATE INDEX "_products_v_version_configurator_fixed_order_idx" ON "_products_v_version_configurator_fixed" USING btree ("_order");
  CREATE INDEX "_products_v_version_configurator_fixed_parent_id_idx" ON "_products_v_version_configurator_fixed" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_recommended_order_idx" ON "_products_v_version_recommended" USING btree ("_order");
  CREATE INDEX "_products_v_version_recommended_parent_id_idx" ON "_products_v_version_recommended" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_recommended_product_idx" ON "_products_v_version_recommended" USING btree ("product_id");
  CREATE INDEX "_products_v_version_sources_links_order_idx" ON "_products_v_version_sources_links" USING btree ("_order");
  CREATE INDEX "_products_v_version_sources_links_parent_id_idx" ON "_products_v_version_sources_links" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_colors" CASCADE;
  DROP TABLE "products_configurator_fixed" CASCADE;
  DROP TABLE "products_recommended" CASCADE;
  DROP TABLE "products_sources_links" CASCADE;
  DROP TABLE "_products_v_version_colors" CASCADE;
  DROP TABLE "_products_v_version_configurator_fixed" CASCADE;
  DROP TABLE "_products_v_version_recommended" CASCADE;
  DROP TABLE "_products_v_version_sources_links" CASCADE;
  ALTER TABLE "products_configurator_options" DROP COLUMN "help";
  ALTER TABLE "products_configurator_options" DROP COLUMN "long_values";
  ALTER TABLE "_products_v_version_configurator_options" DROP COLUMN "help";
  ALTER TABLE "_products_v_version_configurator_options" DROP COLUMN "long_values";`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_offer_systems_statuses_tone" AS ENUM('ok', 'warn');
  CREATE TYPE "public"."enum_pages_blocks_bz_offer_systems_mode" AS ENUM('image', 'statuses');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_offer_systems_statuses_tone" AS ENUM('ok', 'warn');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_offer_systems_mode" AS ENUM('image', 'statuses');
  CREATE TYPE "public"."enum_catalog_groups_showcase_statuses_tone" AS ENUM('ok', 'warn');
  CREATE TYPE "public"."enum_catalog_groups_showcase_mode" AS ENUM('images', 'statuses');
  CREATE TABLE "pages_blocks_bz_offer_systems_statuses" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum_pages_blocks_bz_offer_systems_statuses_tone" DEFAULT 'ok'
  );
  
  CREATE TABLE "pages_blocks_bz_offer_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"badge" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"mode" "enum_pages_blocks_bz_offer_systems_mode" DEFAULT 'image',
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_offer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"catalog_label" varchar,
  	"systems_heading" varchar,
  	"systems_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_featured_wizard_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_featured" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"catalog_label" varchar,
  	"offer_card_eyebrow" varchar,
  	"offer_card_heading" varchar,
  	"offer_card_text" varchar,
  	"offer_card_button_label" varchar,
  	"offer_card_button_href" varchar,
  	"wizard_card_eyebrow" varchar,
  	"wizard_card_heading" varchar,
  	"wizard_card_text" varchar,
  	"wizard_card_button_label" varchar,
  	"wizard_card_button_href" varchar,
  	"wizard_card_summary_label" varchar,
  	"wizard_card_summary" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_offer_systems_statuses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum__pages_v_blocks_bz_offer_systems_statuses_tone" DEFAULT 'ok',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_offer_systems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"partner_id" integer,
  	"badge" varchar,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"mode" "enum__pages_v_blocks_bz_offer_systems_mode" DEFAULT 'image',
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_offer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"catalog_label" varchar,
  	"systems_heading" varchar,
  	"systems_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_featured" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"catalog_label" varchar,
  	"offer_card_eyebrow" varchar,
  	"offer_card_heading" varchar,
  	"offer_card_text" varchar,
  	"offer_card_button_label" varchar,
  	"offer_card_button_href" varchar,
  	"wizard_card_eyebrow" varchar,
  	"wizard_card_heading" varchar,
  	"wizard_card_text" varchar,
  	"wizard_card_button_label" varchar,
  	"wizard_card_button_href" varchar,
  	"wizard_card_summary_label" varchar,
  	"wizard_card_summary" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "catalog_groups_showcase_statuses" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"tone" "enum_catalog_groups_showcase_statuses_tone" DEFAULT 'ok'
  );
  
  CREATE TABLE "catalog_groups_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  ALTER TABLE "catalog_groups" ADD COLUMN "showcase_mode" "enum_catalog_groups_showcase_mode" DEFAULT 'images';
  ALTER TABLE "pages_blocks_bz_offer_systems_statuses" ADD CONSTRAINT "pages_blocks_bz_offer_systems_statuses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_offer_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_offer_systems" ADD CONSTRAINT "pages_blocks_bz_offer_systems_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_offer_systems" ADD CONSTRAINT "pages_blocks_bz_offer_systems_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_offer_systems" ADD CONSTRAINT "pages_blocks_bz_offer_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_offer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_offer" ADD CONSTRAINT "pages_blocks_bz_offer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_featured_wizard_card_steps" ADD CONSTRAINT "pages_blocks_bz_featured_wizard_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_featured"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_featured" ADD CONSTRAINT "pages_blocks_bz_featured_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_offer_systems_statuses" ADD CONSTRAINT "_pages_v_blocks_bz_offer_systems_statuses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_offer_systems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_offer_systems" ADD CONSTRAINT "_pages_v_blocks_bz_offer_systems_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_offer_systems" ADD CONSTRAINT "_pages_v_blocks_bz_offer_systems_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_offer_systems" ADD CONSTRAINT "_pages_v_blocks_bz_offer_systems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_offer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_offer" ADD CONSTRAINT "_pages_v_blocks_bz_offer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" ADD CONSTRAINT "_pages_v_blocks_bz_featured_wizard_card_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_featured"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_featured" ADD CONSTRAINT "_pages_v_blocks_bz_featured_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_groups_showcase_statuses" ADD CONSTRAINT "catalog_groups_showcase_statuses_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."catalog_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_groups_rels" ADD CONSTRAINT "catalog_groups_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."catalog_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "catalog_groups_rels" ADD CONSTRAINT "catalog_groups_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_offer_systems_statuses_order_idx" ON "pages_blocks_bz_offer_systems_statuses" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_offer_systems_statuses_parent_id_idx" ON "pages_blocks_bz_offer_systems_statuses" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_offer_systems_order_idx" ON "pages_blocks_bz_offer_systems" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_offer_systems_parent_id_idx" ON "pages_blocks_bz_offer_systems" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_offer_systems_partner_idx" ON "pages_blocks_bz_offer_systems" USING btree ("partner_id");
  CREATE INDEX "pages_blocks_bz_offer_systems_image_idx" ON "pages_blocks_bz_offer_systems" USING btree ("image_id");
  CREATE INDEX "pages_blocks_bz_offer_order_idx" ON "pages_blocks_bz_offer" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_offer_parent_id_idx" ON "pages_blocks_bz_offer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_offer_path_idx" ON "pages_blocks_bz_offer" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_featured_wizard_card_steps_order_idx" ON "pages_blocks_bz_featured_wizard_card_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_featured_wizard_card_steps_parent_id_idx" ON "pages_blocks_bz_featured_wizard_card_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_featured_order_idx" ON "pages_blocks_bz_featured" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_featured_parent_id_idx" ON "pages_blocks_bz_featured" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_featured_path_idx" ON "pages_blocks_bz_featured" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_statuses_order_idx" ON "_pages_v_blocks_bz_offer_systems_statuses" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_statuses_parent_id_idx" ON "_pages_v_blocks_bz_offer_systems_statuses" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_order_idx" ON "_pages_v_blocks_bz_offer_systems" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_parent_id_idx" ON "_pages_v_blocks_bz_offer_systems" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_partner_idx" ON "_pages_v_blocks_bz_offer_systems" USING btree ("partner_id");
  CREATE INDEX "_pages_v_blocks_bz_offer_systems_image_idx" ON "_pages_v_blocks_bz_offer_systems" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_bz_offer_order_idx" ON "_pages_v_blocks_bz_offer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_offer_parent_id_idx" ON "_pages_v_blocks_bz_offer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_offer_path_idx" ON "_pages_v_blocks_bz_offer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_featured_wizard_card_steps_order_idx" ON "_pages_v_blocks_bz_featured_wizard_card_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_featured_wizard_card_steps_parent_id_idx" ON "_pages_v_blocks_bz_featured_wizard_card_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_featured_order_idx" ON "_pages_v_blocks_bz_featured" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_featured_parent_id_idx" ON "_pages_v_blocks_bz_featured" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_featured_path_idx" ON "_pages_v_blocks_bz_featured" USING btree ("_path");
  CREATE INDEX "catalog_groups_showcase_statuses_order_idx" ON "catalog_groups_showcase_statuses" USING btree ("_order");
  CREATE INDEX "catalog_groups_showcase_statuses_parent_id_idx" ON "catalog_groups_showcase_statuses" USING btree ("_parent_id");
  CREATE INDEX "catalog_groups_rels_order_idx" ON "catalog_groups_rels" USING btree ("order");
  CREATE INDEX "catalog_groups_rels_parent_idx" ON "catalog_groups_rels" USING btree ("parent_id");
  CREATE INDEX "catalog_groups_rels_path_idx" ON "catalog_groups_rels" USING btree ("path");
  CREATE INDEX "catalog_groups_rels_media_id_idx" ON "catalog_groups_rels" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_offer_systems_statuses" CASCADE;
  DROP TABLE "pages_blocks_bz_offer_systems" CASCADE;
  DROP TABLE "pages_blocks_bz_offer" CASCADE;
  DROP TABLE "pages_blocks_bz_featured_wizard_card_steps" CASCADE;
  DROP TABLE "pages_blocks_bz_featured" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_offer_systems_statuses" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_offer_systems" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_offer" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_featured_wizard_card_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_featured" CASCADE;
  DROP TABLE "catalog_groups_showcase_statuses" CASCADE;
  DROP TABLE "catalog_groups_rels" CASCADE;
  ALTER TABLE "catalog_groups" DROP COLUMN "showcase_mode";
  DROP TYPE "public"."enum_pages_blocks_bz_offer_systems_statuses_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_offer_systems_mode";
  DROP TYPE "public"."enum__pages_v_blocks_bz_offer_systems_statuses_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_offer_systems_mode";
  DROP TYPE "public"."enum_catalog_groups_showcase_statuses_tone";
  DROP TYPE "public"."enum_catalog_groups_showcase_mode";`)
}

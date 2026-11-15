import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_screen_notes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum_pages_blocks_bz_cards_cards_monogram_tone" AS ENUM('blue', 'green', 'violet', 'red', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_bz_program_picker_options_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_screen_notes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_cards_cards_monogram_tone" AS ENUM('blue', 'green', 'violet', 'red', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_program_picker_options_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass');
  ALTER TYPE "public"."enum_pages_blocks_bz_page_hero_variant" ADD VALUE 'screen';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" ADD VALUE 'screen';
  CREATE TABLE "pages_blocks_bz_page_hero_screen_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum_pages_blocks_bz_page_hero_screen_notes_icon"
  );
  
  CREATE TABLE "pages_blocks_bz_program_picker_options_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_program_picker_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"trait" varchar,
  	"icon" "enum_pages_blocks_bz_program_picker_options_icon",
  	"trait_text" varchar,
  	"program" varchar,
  	"caption" varchar,
  	"description" varchar,
  	"screen_image_id" integer,
  	"box_image_id" integer,
  	"product_id" integer
  );
  
  CREATE TABLE "pages_blocks_bz_program_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"result_label" varchar DEFAULT 'Polecamy na start',
  	"initial" numeric DEFAULT 1,
  	"talk_label" varchar,
  	"talk_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_ksef_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_ksef" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"date" timestamp(3) with time zone,
  	"date_label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_page_hero_screen_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"icon" "enum__pages_v_blocks_bz_page_hero_screen_notes_icon",
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker_options_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"trait" varchar,
  	"icon" "enum__pages_v_blocks_bz_program_picker_options_icon",
  	"trait_text" varchar,
  	"program" varchar,
  	"caption" varchar,
  	"description" varchar,
  	"screen_image_id" integer,
  	"box_image_id" integer,
  	"product_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_program_picker" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lead" varchar,
  	"result_label" varchar DEFAULT 'Polecamy na start',
  	"initial" numeric DEFAULT 1,
  	"talk_label" varchar,
  	"talk_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_ksef_checklist" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_ksef" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"date" timestamp(3) with time zone,
  	"date_label" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "screen_partner_id" integer;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "screen_screen_image_id" integer;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD COLUMN "screen_box_image_id" integer;
  ALTER TABLE "pages_blocks_bz_cards_cards" ADD COLUMN "monogram" varchar;
  ALTER TABLE "pages_blocks_bz_cards_cards" ADD COLUMN "monogram_tone" "enum_pages_blocks_bz_cards_cards_monogram_tone" DEFAULT 'blue';
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "screen_partner_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "screen_screen_image_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD COLUMN "screen_box_image_id" integer;
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" ADD COLUMN "monogram" varchar;
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" ADD COLUMN "monogram_tone" "enum__pages_v_blocks_bz_cards_cards_monogram_tone" DEFAULT 'blue';
  ALTER TABLE "pages_blocks_bz_page_hero_screen_notes" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options_points" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_program_picker_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_screen_image_id_media_id_fk" FOREIGN KEY ("screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_box_image_id_media_id_fk" FOREIGN KEY ("box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker_options" ADD CONSTRAINT "pages_blocks_bz_program_picker_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_program_picker"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_program_picker" ADD CONSTRAINT "pages_blocks_bz_program_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_ksef_checklist" ADD CONSTRAINT "pages_blocks_bz_ksef_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_ksef"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_ksef" ADD CONSTRAINT "pages_blocks_bz_ksef_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_screen_notes" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_page_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options_points" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_program_picker_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_screen_image_id_media_id_fk" FOREIGN KEY ("screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_box_image_id_media_id_fk" FOREIGN KEY ("box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_program_picker"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_program_picker" ADD CONSTRAINT "_pages_v_blocks_bz_program_picker_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_ksef_checklist" ADD CONSTRAINT "_pages_v_blocks_bz_ksef_checklist_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_ksef"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_ksef" ADD CONSTRAINT "_pages_v_blocks_bz_ksef_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_screen_notes_order_idx" ON "pages_blocks_bz_page_hero_screen_notes" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_notes_parent_id_idx" ON "pages_blocks_bz_page_hero_screen_notes" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_points_order_idx" ON "pages_blocks_bz_program_picker_options_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_options_points_parent_id_idx" ON "pages_blocks_bz_program_picker_options_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_order_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_options_parent_id_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_screen_image_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("screen_image_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_box_image_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("box_image_id");
  CREATE INDEX "pages_blocks_bz_program_picker_options_product_idx" ON "pages_blocks_bz_program_picker_options" USING btree ("product_id");
  CREATE INDEX "pages_blocks_bz_program_picker_order_idx" ON "pages_blocks_bz_program_picker" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_program_picker_parent_id_idx" ON "pages_blocks_bz_program_picker" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_program_picker_path_idx" ON "pages_blocks_bz_program_picker" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_ksef_checklist_order_idx" ON "pages_blocks_bz_ksef_checklist" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_ksef_checklist_parent_id_idx" ON "pages_blocks_bz_ksef_checklist" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_ksef_order_idx" ON "pages_blocks_bz_ksef" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_ksef_parent_id_idx" ON "pages_blocks_bz_ksef" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_ksef_path_idx" ON "pages_blocks_bz_ksef" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_notes_order_idx" ON "_pages_v_blocks_bz_page_hero_screen_notes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_notes_parent_id_idx" ON "_pages_v_blocks_bz_page_hero_screen_notes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_points_order_idx" ON "_pages_v_blocks_bz_program_picker_options_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_points_parent_id_idx" ON "_pages_v_blocks_bz_program_picker_options_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_order_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_parent_id_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_screen_image_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("screen_image_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_box_image_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("box_image_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_options_product_idx" ON "_pages_v_blocks_bz_program_picker_options" USING btree ("product_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_order_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_parent_id_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_program_picker_path_idx" ON "_pages_v_blocks_bz_program_picker" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_ksef_checklist_order_idx" ON "_pages_v_blocks_bz_ksef_checklist" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_ksef_checklist_parent_id_idx" ON "_pages_v_blocks_bz_ksef_checklist" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_ksef_order_idx" ON "_pages_v_blocks_bz_ksef" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_ksef_parent_id_idx" ON "_pages_v_blocks_bz_ksef" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_ksef_path_idx" ON "_pages_v_blocks_bz_ksef" USING btree ("_path");
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_partner_id_partners_id_fk" FOREIGN KEY ("screen_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_screen_image_id_media_id_fk" FOREIGN KEY ("screen_screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_page_hero" ADD CONSTRAINT "pages_blocks_bz_page_hero_screen_box_image_id_media_id_fk" FOREIGN KEY ("screen_box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_partner_id_partners_id_fk" FOREIGN KEY ("screen_partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_screen_image_id_media_id_fk" FOREIGN KEY ("screen_screen_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ADD CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_box_image_id_media_id_fk" FOREIGN KEY ("screen_box_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_partner_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_partner_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_screen_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_screen_image_id");
  CREATE INDEX "pages_blocks_bz_page_hero_screen_screen_box_image_idx" ON "pages_blocks_bz_page_hero" USING btree ("screen_box_image_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_partner_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_partner_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_screen_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_screen_image_id");
  CREATE INDEX "_pages_v_blocks_bz_page_hero_screen_screen_box_image_idx" ON "_pages_v_blocks_bz_page_hero" USING btree ("screen_box_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_page_hero_screen_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker_options_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_program_picker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_ksef_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_bz_ksef" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_page_hero_screen_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_program_picker" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_ksef_checklist" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_bz_ksef" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_bz_page_hero_screen_notes" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker_options_points" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker_options" CASCADE;
  DROP TABLE "pages_blocks_bz_program_picker" CASCADE;
  DROP TABLE "pages_blocks_bz_ksef_checklist" CASCADE;
  DROP TABLE "pages_blocks_bz_ksef" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_page_hero_screen_notes" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker_options_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker_options" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_program_picker" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_ksef_checklist" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_ksef" CASCADE;
  ALTER TABLE "pages_blocks_bz_page_hero" DROP CONSTRAINT "pages_blocks_bz_page_hero_screen_partner_id_partners_id_fk";
  
  ALTER TABLE "pages_blocks_bz_page_hero" DROP CONSTRAINT "pages_blocks_bz_page_hero_screen_screen_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_bz_page_hero" DROP CONSTRAINT "pages_blocks_bz_page_hero_screen_box_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_partner_id_partners_id_fk";
  
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_screen_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP CONSTRAINT "_pages_v_blocks_bz_page_hero_screen_box_image_id_media_id_fk";
  
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_page_hero_variant" AS ENUM('card', 'photo');
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "pages_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_page_hero_variant" USING "variant"::"public"."enum_pages_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" AS ENUM('card', 'photo');
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DEFAULT 'card'::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_page_hero_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_page_hero_variant";
  DROP INDEX "pages_blocks_bz_page_hero_screen_screen_partner_idx";
  DROP INDEX "pages_blocks_bz_page_hero_screen_screen_screen_image_idx";
  DROP INDEX "pages_blocks_bz_page_hero_screen_screen_box_image_idx";
  DROP INDEX "_pages_v_blocks_bz_page_hero_screen_screen_partner_idx";
  DROP INDEX "_pages_v_blocks_bz_page_hero_screen_screen_screen_image_idx";
  DROP INDEX "_pages_v_blocks_bz_page_hero_screen_screen_box_image_idx";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "screen_partner_id";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "screen_screen_image_id";
  ALTER TABLE "pages_blocks_bz_page_hero" DROP COLUMN "screen_box_image_id";
  ALTER TABLE "pages_blocks_bz_cards_cards" DROP COLUMN "monogram";
  ALTER TABLE "pages_blocks_bz_cards_cards" DROP COLUMN "monogram_tone";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "screen_partner_id";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "screen_screen_image_id";
  ALTER TABLE "_pages_v_blocks_bz_page_hero" DROP COLUMN "screen_box_image_id";
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" DROP COLUMN "monogram";
  ALTER TABLE "_pages_v_blocks_bz_cards_cards" DROP COLUMN "monogram_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_page_hero_screen_notes_icon";
  DROP TYPE "public"."enum_pages_blocks_bz_cards_cards_monogram_tone";
  DROP TYPE "public"."enum_pages_blocks_bz_program_picker_options_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_page_hero_screen_notes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_cards_cards_monogram_tone";
  DROP TYPE "public"."enum__pages_v_blocks_bz_program_picker_options_icon";`)
}

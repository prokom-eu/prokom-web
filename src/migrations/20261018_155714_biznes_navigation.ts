import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_biznes_navigation_menu_type" AS ENUM('link', 'offer', 'industries');
  CREATE TABLE "site_settings_biznes_navigation_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_site_settings_biznes_navigation_menu_type" DEFAULT 'link',
  	"label" varchar,
  	"href" varchar,
  	"partner" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_biznes_navigation_shortcuts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings_biznes_navigation_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"group_id" integer,
  	"label" varchar,
  	"href" varchar,
  	"badge" varchar
  );
  
  CREATE TABLE "site_settings_biznes_navigation_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"href" varchar,
  	"badge" varchar,
  	"text" varchar,
  	"partner_id" integer,
  	"image_id" integer,
  	"dark" boolean DEFAULT false
  );
  
  CREATE TABLE "site_settings_biznes_navigation_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"image_id" integer,
  	"description" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "biznes_navigation_column_limit" numeric DEFAULT 6;
  ALTER TABLE "site_settings_biznes_navigation_menu" ADD CONSTRAINT "site_settings_biznes_navigation_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_shortcuts" ADD CONSTRAINT "site_settings_biznes_navigation_shortcuts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_highlights" ADD CONSTRAINT "site_settings_biznes_navigation_highlights_group_id_catalog_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."catalog_groups"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_highlights" ADD CONSTRAINT "site_settings_biznes_navigation_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_cards" ADD CONSTRAINT "site_settings_biznes_navigation_cards_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_cards" ADD CONSTRAINT "site_settings_biznes_navigation_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_cards" ADD CONSTRAINT "site_settings_biznes_navigation_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_biznes_navigation_menu_order_idx" ON "site_settings_biznes_navigation_menu" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_menu_parent_id_idx" ON "site_settings_biznes_navigation_menu" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_shortcuts_order_idx" ON "site_settings_biznes_navigation_shortcuts" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_shortcuts_parent_id_idx" ON "site_settings_biznes_navigation_shortcuts" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_highlights_order_idx" ON "site_settings_biznes_navigation_highlights" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_highlights_parent_id_idx" ON "site_settings_biznes_navigation_highlights" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_highlights_group_idx" ON "site_settings_biznes_navigation_highlights" USING btree ("group_id");
  CREATE INDEX "site_settings_biznes_navigation_cards_order_idx" ON "site_settings_biznes_navigation_cards" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_cards_parent_id_idx" ON "site_settings_biznes_navigation_cards" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_cards_partner_idx" ON "site_settings_biznes_navigation_cards" USING btree ("partner_id");
  CREATE INDEX "site_settings_biznes_navigation_cards_image_idx" ON "site_settings_biznes_navigation_cards" USING btree ("image_id");
  CREATE INDEX "site_settings_biznes_navigation_industries_order_idx" ON "site_settings_biznes_navigation_industries" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_industries_parent_id_idx" ON "site_settings_biznes_navigation_industries" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_industries_industry_idx" ON "site_settings_biznes_navigation_industries" USING btree ("industry_id");
  CREATE INDEX "site_settings_biznes_navigation_industries_image_idx" ON "site_settings_biznes_navigation_industries" USING btree ("image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_biznes_navigation_menu" CASCADE;
  DROP TABLE "site_settings_biznes_navigation_shortcuts" CASCADE;
  DROP TABLE "site_settings_biznes_navigation_highlights" CASCADE;
  DROP TABLE "site_settings_biznes_navigation_cards" CASCADE;
  DROP TABLE "site_settings_biznes_navigation_industries" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN "biznes_navigation_column_limit";
  DROP TYPE "public"."enum_site_settings_biznes_navigation_menu_type";`)
}

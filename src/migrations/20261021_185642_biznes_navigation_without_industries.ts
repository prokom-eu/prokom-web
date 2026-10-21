import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_biznes_navigation_industries" CASCADE;
  ALTER TABLE "site_settings_biznes_navigation_menu" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "site_settings_biznes_navigation_menu" ALTER COLUMN "type" SET DEFAULT 'link'::text;
  -- v20 (B3c): Branże ▾ left the menu; saved rows of that kind would break the new enum.
  DELETE FROM "site_settings_biznes_navigation_menu" WHERE "type" = 'industries';
  DROP TYPE "public"."enum_site_settings_biznes_navigation_menu_type";
  CREATE TYPE "public"."enum_site_settings_biznes_navigation_menu_type" AS ENUM('link', 'offer');
  ALTER TABLE "site_settings_biznes_navigation_menu" ALTER COLUMN "type" SET DEFAULT 'link'::"public"."enum_site_settings_biznes_navigation_menu_type";
  ALTER TABLE "site_settings_biznes_navigation_menu" ALTER COLUMN "type" SET DATA TYPE "public"."enum_site_settings_biznes_navigation_menu_type" USING "type"::"public"."enum_site_settings_biznes_navigation_menu_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_site_settings_biznes_navigation_menu_type" ADD VALUE 'industries';
  CREATE TABLE "site_settings_biznes_navigation_industries" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"industry_id" integer,
  	"image_id" integer,
  	"description" varchar
  );
  
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_industry_id_industries_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_navigation_industries" ADD CONSTRAINT "site_settings_biznes_navigation_industries_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_biznes_navigation_industries_order_idx" ON "site_settings_biznes_navigation_industries" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_navigation_industries_parent_id_idx" ON "site_settings_biznes_navigation_industries" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_navigation_industries_industry_idx" ON "site_settings_biznes_navigation_industries" USING btree ("industry_id");
  CREATE INDEX "site_settings_biznes_navigation_industries_image_idx" ON "site_settings_biznes_navigation_industries" USING btree ("image_id");`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_biznes_footer_important" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "site_settings_biznes_footer_company" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"href" varchar
  );
  
  ALTER TABLE "site_settings_biznes_footer_important" ADD CONSTRAINT "site_settings_biznes_footer_important_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_biznes_footer_company" ADD CONSTRAINT "site_settings_biznes_footer_company_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_biznes_footer_important_order_idx" ON "site_settings_biznes_footer_important" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_footer_important_parent_id_idx" ON "site_settings_biznes_footer_important" USING btree ("_parent_id");
  CREATE INDEX "site_settings_biznes_footer_company_order_idx" ON "site_settings_biznes_footer_company" USING btree ("_order");
  CREATE INDEX "site_settings_biznes_footer_company_parent_id_idx" ON "site_settings_biznes_footer_company" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_biznes_footer_important" CASCADE;
  DROP TABLE "site_settings_biznes_footer_company" CASCADE;`)
}

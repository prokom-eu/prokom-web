import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hub_settings_extra_phones" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"number" varchar NOT NULL
  );
  
  ALTER TABLE "hub_settings" ADD COLUMN "branch_published" boolean DEFAULT false;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_name" varchar;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_phone" varchar;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_street" varchar;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_postal_code" varchar;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_city" varchar;
  ALTER TABLE "hub_settings" ADD COLUMN "branch_note" varchar;
  ALTER TABLE "hub_settings_extra_phones" ADD CONSTRAINT "hub_settings_extra_phones_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "hub_settings_extra_phones_order_idx" ON "hub_settings_extra_phones" USING btree ("_order");
  CREATE INDEX "hub_settings_extra_phones_parent_id_idx" ON "hub_settings_extra_phones" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "hub_settings_extra_phones" CASCADE;
  ALTER TABLE "hub_settings" DROP COLUMN "branch_published";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_name";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_phone";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_street";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_postal_code";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_city";
  ALTER TABLE "hub_settings" DROP COLUMN "branch_note";`)
}

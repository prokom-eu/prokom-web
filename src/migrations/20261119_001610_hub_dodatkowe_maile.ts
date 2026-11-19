import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hub_settings_extra_emails" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"published" boolean DEFAULT false
  );
  
  ALTER TABLE "hub_settings_extra_emails" ADD CONSTRAINT "hub_settings_extra_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "hub_settings_extra_emails_order_idx" ON "hub_settings_extra_emails" USING btree ("_order");
  CREATE INDEX "hub_settings_extra_emails_parent_id_idx" ON "hub_settings_extra_emails" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "hub_settings_extra_emails" CASCADE;`)
}

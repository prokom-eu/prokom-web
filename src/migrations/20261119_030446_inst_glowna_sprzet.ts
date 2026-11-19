import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "instalacje_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "instalacje_settings_rels" ADD CONSTRAINT "instalacje_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."instalacje_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instalacje_settings_rels" ADD CONSTRAINT "instalacje_settings_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "instalacje_settings_rels_order_idx" ON "instalacje_settings_rels" USING btree ("order");
  CREATE INDEX "instalacje_settings_rels_parent_idx" ON "instalacje_settings_rels" USING btree ("parent_id");
  CREATE INDEX "instalacje_settings_rels_path_idx" ON "instalacje_settings_rels" USING btree ("path");
  CREATE INDEX "instalacje_settings_rels_products_id_idx" ON "instalacje_settings_rels" USING btree ("products_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "instalacje_settings_rels" CASCADE;`)
}

import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "biznes_settings_rels" ADD COLUMN "bundles_id" integer;
  ALTER TABLE "biznes_settings_rels" ADD CONSTRAINT "biznes_settings_rels_bundles_fk" FOREIGN KEY ("bundles_id") REFERENCES "public"."bundles"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "biznes_settings_rels_bundles_id_idx" ON "biznes_settings_rels" USING btree ("bundles_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "biznes_settings_rels" DROP CONSTRAINT "biznes_settings_rels_bundles_fk";
  
  DROP INDEX "biznes_settings_rels_bundles_id_idx";
  ALTER TABLE "biznes_settings_rels" DROP COLUMN "bundles_id";`)
}

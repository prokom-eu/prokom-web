import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "site_settings_software_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "software_settings_search_synonyms" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"phrase" varchar NOT NULL
  );
  
  CREATE TABLE "software_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"wizard" jsonb,
  	"home" jsonb,
  	"thanks" jsonb,
  	"not_found" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "software_settings_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "site_settings" ADD COLUMN "software_navigation" jsonb;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "software_settings_id" integer;
  ALTER TABLE "site_settings_software_facts" ADD CONSTRAINT "site_settings_software_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "software_settings_search_synonyms" ADD CONSTRAINT "software_settings_search_synonyms_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."software_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "software_settings" ADD CONSTRAINT "software_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "software_settings_texts" ADD CONSTRAINT "software_settings_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."software_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_software_facts_order_idx" ON "site_settings_software_facts" USING btree ("_order");
  CREATE INDEX "site_settings_software_facts_parent_id_idx" ON "site_settings_software_facts" USING btree ("_parent_id");
  CREATE INDEX "software_settings_search_synonyms_order_idx" ON "software_settings_search_synonyms" USING btree ("_order");
  CREATE INDEX "software_settings_search_synonyms_parent_id_idx" ON "software_settings_search_synonyms" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "software_settings_tenant_idx" ON "software_settings" USING btree ("tenant_id");
  CREATE INDEX "software_settings_updated_at_idx" ON "software_settings" USING btree ("updated_at");
  CREATE INDEX "software_settings_created_at_idx" ON "software_settings" USING btree ("created_at");
  CREATE INDEX "software_settings_texts_order_parent" ON "software_settings_texts" USING btree ("order","parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_software_settings_fk" FOREIGN KEY ("software_settings_id") REFERENCES "public"."software_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_software_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("software_settings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // `DROP TABLE … CASCADE` below already removes the foreign key of `payload_locked_documents_rels`
  // to the dropped table, so the generated `DROP CONSTRAINT` needs `IF EXISTS` (as in biznes_catalog).
  await db.execute(sql`
   ALTER TABLE "site_settings_software_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "software_settings_search_synonyms" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "software_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "software_settings_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_software_facts" CASCADE;
  DROP TABLE "software_settings_search_synonyms" CASCADE;
  DROP TABLE "software_settings" CASCADE;
  DROP TABLE "software_settings_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_software_settings_fk";
  
  DROP INDEX "payload_locked_documents_rels_software_settings_id_idx";
  ALTER TABLE "site_settings" DROP COLUMN "software_navigation";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "software_settings_id";`)
}

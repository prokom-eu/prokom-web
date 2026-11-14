import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "hub_settings_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"source" varchar,
  	"approved" boolean DEFAULT false
  );
  
  CREATE TABLE "hub_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"tenant_id" integer,
  	"pages_for_home" boolean DEFAULT false,
  	"pages_online" boolean DEFAULT false,
  	"pages_help" boolean DEFAULT false,
  	"pages_cooperation" boolean DEFAULT false,
  	"pages_partners" boolean DEFAULT false,
  	"pages_coverage" boolean DEFAULT false,
  	"pages_news" boolean DEFAULT false,
  	"pages_sitemap" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "hub_settings_id" integer;
  ALTER TABLE "hub_settings_trust" ADD CONSTRAINT "hub_settings_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hub_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hub_settings" ADD CONSTRAINT "hub_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "hub_settings_trust_order_idx" ON "hub_settings_trust" USING btree ("_order");
  CREATE INDEX "hub_settings_trust_parent_id_idx" ON "hub_settings_trust" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "hub_settings_tenant_idx" ON "hub_settings" USING btree ("tenant_id");
  CREATE INDEX "hub_settings_updated_at_idx" ON "hub_settings" USING btree ("updated_at");
  CREATE INDEX "hub_settings_created_at_idx" ON "hub_settings" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hub_settings_fk" FOREIGN KEY ("hub_settings_id") REFERENCES "public"."hub_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_hub_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("hub_settings_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "hub_settings_trust" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "hub_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "hub_settings_trust" CASCADE;
  DROP TABLE "hub_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_hub_settings_fk";
  
  DROP INDEX "payload_locked_documents_rels_hub_settings_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "hub_settings_id";`)
}

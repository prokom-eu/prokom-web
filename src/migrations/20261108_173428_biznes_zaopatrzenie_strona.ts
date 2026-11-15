import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_procurement_page_services_kind" AS ENUM('system', 'data', 'inventory', 'mount', 'pickup');
  CREATE TYPE "public"."enum_pages_blocks_bz_procurement_page_variant" AS ENUM('agd', 'it');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_procurement_page_services_kind" AS ENUM('system', 'data', 'inventory', 'mount', 'pickup');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_procurement_page_variant" AS ENUM('agd', 'it');
  CREATE TABLE "pages_blocks_bz_procurement_page_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum_pages_blocks_bz_procurement_page_services_kind" DEFAULT 'mount'
  );
  
  CREATE TABLE "pages_blocks_bz_procurement_page_class_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"brands" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_procurement_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_bz_procurement_page_variant",
  	"old_equipment_pickup" boolean DEFAULT false,
  	"onsite_warranty" boolean DEFAULT false,
  	"show_l_g" boolean DEFAULT false,
  	"data" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_procurement_page_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"kind" "enum__pages_v_blocks_bz_procurement_page_services_kind" DEFAULT 'mount',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_procurement_page_class_hints" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"brands" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_procurement_page" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_bz_procurement_page_variant",
  	"old_equipment_pickup" boolean DEFAULT false,
  	"onsite_warranty" boolean DEFAULT false,
  	"show_l_g" boolean DEFAULT false,
  	"data" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_procurement_page_services" ADD CONSTRAINT "pages_blocks_bz_procurement_page_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_procurement_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_procurement_page_class_hints" ADD CONSTRAINT "pages_blocks_bz_procurement_page_class_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_procurement_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_procurement_page" ADD CONSTRAINT "pages_blocks_bz_procurement_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_procurement_page_services" ADD CONSTRAINT "_pages_v_blocks_bz_procurement_page_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_procurement_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_procurement_page_class_hints" ADD CONSTRAINT "_pages_v_blocks_bz_procurement_page_class_hints_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_procurement_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_procurement_page" ADD CONSTRAINT "_pages_v_blocks_bz_procurement_page_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_procurement_page_services_order_idx" ON "pages_blocks_bz_procurement_page_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_procurement_page_services_parent_id_idx" ON "pages_blocks_bz_procurement_page_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_procurement_page_class_hints_order_idx" ON "pages_blocks_bz_procurement_page_class_hints" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_procurement_page_class_hints_parent_id_idx" ON "pages_blocks_bz_procurement_page_class_hints" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_procurement_page_order_idx" ON "pages_blocks_bz_procurement_page" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_procurement_page_parent_id_idx" ON "pages_blocks_bz_procurement_page" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_procurement_page_path_idx" ON "pages_blocks_bz_procurement_page" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_services_order_idx" ON "_pages_v_blocks_bz_procurement_page_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_services_parent_id_idx" ON "_pages_v_blocks_bz_procurement_page_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_class_hints_order_idx" ON "_pages_v_blocks_bz_procurement_page_class_hints" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_class_hints_parent_id_idx" ON "_pages_v_blocks_bz_procurement_page_class_hints" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_order_idx" ON "_pages_v_blocks_bz_procurement_page" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_parent_id_idx" ON "_pages_v_blocks_bz_procurement_page" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_procurement_page_path_idx" ON "_pages_v_blocks_bz_procurement_page" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_procurement_page_services" CASCADE;
  DROP TABLE "pages_blocks_bz_procurement_page_class_hints" CASCADE;
  DROP TABLE "pages_blocks_bz_procurement_page" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_procurement_page_services" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_procurement_page_class_hints" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_procurement_page" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_bz_procurement_page_services_kind";
  DROP TYPE "public"."enum_pages_blocks_bz_procurement_page_variant";
  DROP TYPE "public"."enum__pages_v_blocks_bz_procurement_page_services_kind";
  DROP TYPE "public"."enum__pages_v_blocks_bz_procurement_page_variant";`)
}

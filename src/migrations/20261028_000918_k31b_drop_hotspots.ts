import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_hotspots" CASCADE;
  DROP TABLE "products_modules" CASCADE;
  DROP TABLE "_products_v_version_hotspots" CASCADE;
  DROP TABLE "_products_v_version_modules" CASCADE;
  DROP TYPE "public"."enum_products_modules_icon";
  DROP TYPE "public"."enum__products_v_version_modules_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__products_v_version_modules_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TABLE "products_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "products_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"icon" "enum_products_modules_icon"
  );
  
  CREATE TABLE "_products_v_version_hotspots" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"x" numeric,
  	"y" numeric,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"description" varchar,
  	"icon" "enum__products_v_version_modules_icon",
  	"_uuid" varchar
  );
  
  ALTER TABLE "products_hotspots" ADD CONSTRAINT "products_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_modules" ADD CONSTRAINT "products_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_hotspots" ADD CONSTRAINT "_products_v_version_hotspots_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_modules" ADD CONSTRAINT "_products_v_version_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_hotspots_order_idx" ON "products_hotspots" USING btree ("_order");
  CREATE INDEX "products_hotspots_parent_id_idx" ON "products_hotspots" USING btree ("_parent_id");
  CREATE INDEX "products_modules_order_idx" ON "products_modules" USING btree ("_order");
  CREATE INDEX "products_modules_parent_id_idx" ON "products_modules" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_hotspots_order_idx" ON "_products_v_version_hotspots" USING btree ("_order");
  CREATE INDEX "_products_v_version_hotspots_parent_id_idx" ON "_products_v_version_hotspots" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_modules_order_idx" ON "_products_v_version_modules" USING btree ("_order");
  CREATE INDEX "_products_v_version_modules_parent_id_idx" ON "_products_v_version_modules" USING btree ("_parent_id");`)
}

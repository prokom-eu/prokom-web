import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_plan_scenes_points" CASCADE;
  DROP TABLE "pages_blocks_bz_plan_scenes" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_scenes_points" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_plan_scenes" CASCADE;
  ALTER TABLE "pages_blocks_bz_plan_industries_tiles" ADD COLUMN "plan_scene" varchar;
  ALTER TABLE "_pages_v_blocks_bz_plan_industries_tiles" ADD COLUMN "plan_scene" varchar;
  DROP TYPE "public"."enum_pages_blocks_bz_plan_scenes_icon";
  DROP TYPE "public"."enum__pages_v_blocks_bz_plan_scenes_icon";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_bz_plan_scenes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TYPE "public"."enum__pages_v_blocks_bz_plan_scenes_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  CREATE TABLE "pages_blocks_bz_plan_scenes_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_plan_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tab" varchar,
  	"icon" "enum_pages_blocks_bz_plan_scenes_icon",
  	"title" varchar,
  	"lead" varchar,
  	"more_href" varchar,
  	"inquiry_href" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_scenes_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_plan_scenes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tab" varchar,
  	"icon" "enum__pages_v_blocks_bz_plan_scenes_icon",
  	"title" varchar,
  	"lead" varchar,
  	"more_href" varchar,
  	"inquiry_href" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_plan_scenes_points" ADD CONSTRAINT "pages_blocks_bz_plan_scenes_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_plan_scenes" ADD CONSTRAINT "pages_blocks_bz_plan_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_scenes_points" ADD CONSTRAINT "_pages_v_blocks_bz_plan_scenes_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan_scenes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_plan_scenes" ADD CONSTRAINT "_pages_v_blocks_bz_plan_scenes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_plan"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_plan_scenes_points_order_idx" ON "pages_blocks_bz_plan_scenes_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_scenes_points_parent_id_idx" ON "pages_blocks_bz_plan_scenes_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_plan_scenes_order_idx" ON "pages_blocks_bz_plan_scenes" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_plan_scenes_parent_id_idx" ON "pages_blocks_bz_plan_scenes" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_points_order_idx" ON "_pages_v_blocks_bz_plan_scenes_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_points_parent_id_idx" ON "_pages_v_blocks_bz_plan_scenes_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_order_idx" ON "_pages_v_blocks_bz_plan_scenes" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_plan_scenes_parent_id_idx" ON "_pages_v_blocks_bz_plan_scenes" USING btree ("_parent_id");
  ALTER TABLE "pages_blocks_bz_plan_industries_tiles" DROP COLUMN "plan_scene";
  ALTER TABLE "_pages_v_blocks_bz_plan_industries_tiles" DROP COLUMN "plan_scene";`)
}

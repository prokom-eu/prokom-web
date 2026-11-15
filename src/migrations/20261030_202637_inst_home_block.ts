import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_inst_home_hero_trust_icon" AS ENUM('check', 'pin', 'doc', 'shield', 'clock', 'wrench');
  CREATE TYPE "public"."enum__pages_v_blocks_inst_home_hero_trust_icon" AS ENUM('check', 'pin', 'doc', 'shield', 'clock', 'wrench');
  CREATE TABLE "pages_blocks_inst_home_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_inst_home_hero_trust_icon" DEFAULT 'check',
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_kicker" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_home_hero_trust" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_inst_home_hero_trust_icon" DEFAULT 'check',
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_home" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_kicker" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_inst_home_hero_trust" ADD CONSTRAINT "pages_blocks_inst_home_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_home" ADD CONSTRAINT "pages_blocks_inst_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_home_hero_trust" ADD CONSTRAINT "_pages_v_blocks_inst_home_hero_trust_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_home"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_home" ADD CONSTRAINT "_pages_v_blocks_inst_home_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_inst_home_hero_trust_order_idx" ON "pages_blocks_inst_home_hero_trust" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_home_hero_trust_parent_id_idx" ON "pages_blocks_inst_home_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_home_order_idx" ON "pages_blocks_inst_home" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_home_parent_id_idx" ON "pages_blocks_inst_home" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_home_path_idx" ON "pages_blocks_inst_home" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_home_hero_trust_order_idx" ON "_pages_v_blocks_inst_home_hero_trust" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_home_hero_trust_parent_id_idx" ON "_pages_v_blocks_inst_home_hero_trust" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_home_order_idx" ON "_pages_v_blocks_inst_home" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_home_parent_id_idx" ON "_pages_v_blocks_inst_home" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_home_path_idx" ON "_pages_v_blocks_inst_home" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_inst_home_hero_trust" CASCADE;
  DROP TABLE "pages_blocks_inst_home" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_home_hero_trust" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_home" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_inst_home_hero_trust_icon";
  DROP TYPE "public"."enum__pages_v_blocks_inst_home_hero_trust_icon";`)
}

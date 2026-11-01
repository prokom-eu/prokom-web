import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_inst_architects_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "pages_blocks_inst_architects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_architects_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_architects" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_crumb" varchar,
  	"hero_eyebrow" varchar,
  	"hero_h1a" varchar,
  	"hero_h1b" varchar,
  	"hero_lead" varchar,
  	"hero_cta_text" varchar,
  	"hero_cta_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_inst_architects_hero_facts" ADD CONSTRAINT "pages_blocks_inst_architects_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_inst_architects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_architects" ADD CONSTRAINT "pages_blocks_inst_architects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_architects_hero_facts" ADD CONSTRAINT "_pages_v_blocks_inst_architects_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_inst_architects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_architects" ADD CONSTRAINT "_pages_v_blocks_inst_architects_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_inst_architects_hero_facts_order_idx" ON "pages_blocks_inst_architects_hero_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_architects_hero_facts_parent_id_idx" ON "pages_blocks_inst_architects_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_architects_order_idx" ON "pages_blocks_inst_architects" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_architects_parent_id_idx" ON "pages_blocks_inst_architects" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_architects_path_idx" ON "pages_blocks_inst_architects" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_architects_hero_facts_order_idx" ON "_pages_v_blocks_inst_architects_hero_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_architects_hero_facts_parent_id_idx" ON "_pages_v_blocks_inst_architects_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_architects_order_idx" ON "_pages_v_blocks_inst_architects" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_architects_parent_id_idx" ON "_pages_v_blocks_inst_architects" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_architects_path_idx" ON "_pages_v_blocks_inst_architects" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_inst_architects_hero_facts" CASCADE;
  DROP TABLE "pages_blocks_inst_architects" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_architects_hero_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_architects" CASCADE;`)
}

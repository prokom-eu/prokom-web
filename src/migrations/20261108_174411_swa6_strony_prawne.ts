import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_sw_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Informacje prawne',
  	"heading" varchar,
  	"lead" varchar,
  	"version" varchar,
  	"updated" varchar,
  	"draft" boolean DEFAULT true,
  	"ask_title" varchar DEFAULT 'Masz pytanie o dane?',
  	"ask_text" varchar DEFAULT 'Napisz albo zadzwoń — odpowiemy w 1 dzień roboczy.',
  	"body" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar DEFAULT 'Informacje prawne',
  	"heading" varchar,
  	"lead" varchar,
  	"version" varchar,
  	"updated" varchar,
  	"draft" boolean DEFAULT true,
  	"ask_title" varchar DEFAULT 'Masz pytanie o dane?',
  	"ask_text" varchar DEFAULT 'Napisz albo zadzwoń — odpowiemy w 1 dzień roboczy.',
  	"body" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_legal" ADD CONSTRAINT "pages_blocks_sw_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_legal" ADD CONSTRAINT "_pages_v_blocks_sw_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_legal_order_idx" ON "pages_blocks_sw_legal" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_legal_parent_id_idx" ON "pages_blocks_sw_legal" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_legal_path_idx" ON "pages_blocks_sw_legal" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_legal_order_idx" ON "_pages_v_blocks_sw_legal" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_legal_parent_id_idx" ON "_pages_v_blocks_sw_legal" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_legal_path_idx" ON "_pages_v_blocks_sw_legal" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_legal" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_legal" CASCADE;`)
}

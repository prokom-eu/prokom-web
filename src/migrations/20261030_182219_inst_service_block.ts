import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_inst_service" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_inst_service" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"service_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_inst_service" ADD CONSTRAINT "pages_blocks_inst_service_service_id_inst_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."inst_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_inst_service" ADD CONSTRAINT "pages_blocks_inst_service_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_service" ADD CONSTRAINT "_pages_v_blocks_inst_service_service_id_inst_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."inst_services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_inst_service" ADD CONSTRAINT "_pages_v_blocks_inst_service_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_inst_service_order_idx" ON "pages_blocks_inst_service" USING btree ("_order");
  CREATE INDEX "pages_blocks_inst_service_parent_id_idx" ON "pages_blocks_inst_service" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_inst_service_path_idx" ON "pages_blocks_inst_service" USING btree ("_path");
  CREATE INDEX "pages_blocks_inst_service_service_idx" ON "pages_blocks_inst_service" USING btree ("service_id");
  CREATE INDEX "_pages_v_blocks_inst_service_order_idx" ON "_pages_v_blocks_inst_service" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_inst_service_parent_id_idx" ON "_pages_v_blocks_inst_service" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_inst_service_path_idx" ON "_pages_v_blocks_inst_service" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_inst_service_service_idx" ON "_pages_v_blocks_inst_service" USING btree ("service_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_inst_service" CASCADE;
  DROP TABLE "_pages_v_blocks_inst_service" CASCADE;`)
}

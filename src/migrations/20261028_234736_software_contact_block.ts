import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_sw_contact_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_sw_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"side_title" varchar,
  	"side_text" varchar,
  	"audit_title" varchar,
  	"audit_href" varchar,
  	"audit_text" varchar,
  	"phone_caption" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"submit" varchar,
  	"alternative" varchar,
  	"alternative_link_label" varchar,
  	"alternative_link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact_promises" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sw_contact" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"side_title" varchar,
  	"side_text" varchar,
  	"audit_title" varchar,
  	"audit_href" varchar,
  	"audit_text" varchar,
  	"phone_caption" varchar,
  	"topics_label" varchar,
  	"message_label" varchar,
  	"message_placeholder" varchar,
  	"name_label" varchar,
  	"name_placeholder" varchar,
  	"contact_label" varchar,
  	"contact_placeholder" varchar,
  	"submit" varchar,
  	"alternative" varchar,
  	"alternative_link_label" varchar,
  	"alternative_link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_sw_contact_promises" ADD CONSTRAINT "pages_blocks_sw_contact_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_sw_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sw_contact" ADD CONSTRAINT "pages_blocks_sw_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact_promises" ADD CONSTRAINT "_pages_v_blocks_sw_contact_promises_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_sw_contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sw_contact" ADD CONSTRAINT "_pages_v_blocks_sw_contact_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_sw_contact_promises_order_idx" ON "pages_blocks_sw_contact_promises" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_promises_parent_id_idx" ON "pages_blocks_sw_contact_promises" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_order_idx" ON "pages_blocks_sw_contact" USING btree ("_order");
  CREATE INDEX "pages_blocks_sw_contact_parent_id_idx" ON "pages_blocks_sw_contact" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sw_contact_path_idx" ON "pages_blocks_sw_contact" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sw_contact_promises_order_idx" ON "_pages_v_blocks_sw_contact_promises" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_promises_parent_id_idx" ON "_pages_v_blocks_sw_contact_promises" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_order_idx" ON "_pages_v_blocks_sw_contact" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sw_contact_parent_id_idx" ON "_pages_v_blocks_sw_contact" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sw_contact_path_idx" ON "_pages_v_blocks_sw_contact" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_sw_contact_promises" CASCADE;
  DROP TABLE "pages_blocks_sw_contact" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact_promises" CASCADE;
  DROP TABLE "_pages_v_blocks_sw_contact" CASCADE;`)
}

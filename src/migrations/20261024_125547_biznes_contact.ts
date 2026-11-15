import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_bz_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"email_note" varchar,
  	"address_note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_quick_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar
  );
  
  CREATE TABLE "pages_blocks_bz_quick_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_contact_info" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"lead" varchar,
  	"area_label" varchar,
  	"phone_note" varchar,
  	"email_note" varchar,
  	"address_note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_quick_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_bz_quick_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_contact_info" ADD CONSTRAINT "pages_blocks_bz_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_quick_cards_cards" ADD CONSTRAINT "pages_blocks_bz_quick_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_bz_quick_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_bz_quick_cards" ADD CONSTRAINT "pages_blocks_bz_quick_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_contact_info" ADD CONSTRAINT "_pages_v_blocks_bz_contact_info_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards_cards" ADD CONSTRAINT "_pages_v_blocks_bz_quick_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_bz_quick_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_bz_quick_cards" ADD CONSTRAINT "_pages_v_blocks_bz_quick_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_bz_contact_info_order_idx" ON "pages_blocks_bz_contact_info" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_contact_info_parent_id_idx" ON "pages_blocks_bz_contact_info" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_contact_info_path_idx" ON "pages_blocks_bz_contact_info" USING btree ("_path");
  CREATE INDEX "pages_blocks_bz_quick_cards_cards_order_idx" ON "pages_blocks_bz_quick_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_quick_cards_cards_parent_id_idx" ON "pages_blocks_bz_quick_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_quick_cards_order_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_bz_quick_cards_parent_id_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_bz_quick_cards_path_idx" ON "pages_blocks_bz_quick_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_order_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_parent_id_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_contact_info_path_idx" ON "_pages_v_blocks_bz_contact_info" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_cards_order_idx" ON "_pages_v_blocks_bz_quick_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_cards_parent_id_idx" ON "_pages_v_blocks_bz_quick_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_order_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_parent_id_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_bz_quick_cards_path_idx" ON "_pages_v_blocks_bz_quick_cards" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_bz_contact_info" CASCADE;
  DROP TABLE "pages_blocks_bz_quick_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_bz_quick_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_contact_info" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_quick_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_bz_quick_cards" CASCADE;`)
}

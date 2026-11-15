import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "industries_day_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "industries_flow_badges" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "industries_flow_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "industries_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "pages_blocks_bz_timeline_steps" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_blocks_bz_timeline_steps" ADD COLUMN "label" varchar;
  ALTER TABLE "industries" ADD COLUMN "hero_cta_label" varchar;
  ALTER TABLE "industries" ADD COLUMN "products_section_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "products_section_title" varchar;
  ALTER TABLE "industries" ADD COLUMN "products_section_lead" varchar;
  ALTER TABLE "industries" ADD COLUMN "day_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "day_heading" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_heading" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_lead" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_image_id" integer;
  ALTER TABLE "industries" ADD COLUMN "flow_ticket" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_note" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_primary_label" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_primary_href" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_secondary_label" varchar;
  ALTER TABLE "industries" ADD COLUMN "flow_secondary_href" varchar;
  ALTER TABLE "industries" ADD COLUMN "faq_intro_eyebrow" varchar;
  ALTER TABLE "industries" ADD COLUMN "faq_intro_title" varchar;
  ALTER TABLE "industries" ADD COLUMN "faq_intro_lead" varchar;
  ALTER TABLE "industries" ADD COLUMN "contact_heading" varchar;
  ALTER TABLE "industries" ADD COLUMN "contact_lead" varchar;
  ALTER TABLE "industries_day_steps" ADD CONSTRAINT "industries_day_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_flow_badges" ADD CONSTRAINT "industries_flow_badges_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_flow_steps" ADD CONSTRAINT "industries_flow_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "industries_flow_steps" ADD CONSTRAINT "industries_flow_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "industries_texts" ADD CONSTRAINT "industries_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."industries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "industries_day_steps_order_idx" ON "industries_day_steps" USING btree ("_order");
  CREATE INDEX "industries_day_steps_parent_id_idx" ON "industries_day_steps" USING btree ("_parent_id");
  CREATE INDEX "industries_flow_badges_order_idx" ON "industries_flow_badges" USING btree ("_order");
  CREATE INDEX "industries_flow_badges_parent_id_idx" ON "industries_flow_badges" USING btree ("_parent_id");
  CREATE INDEX "industries_flow_steps_order_idx" ON "industries_flow_steps" USING btree ("_order");
  CREATE INDEX "industries_flow_steps_parent_id_idx" ON "industries_flow_steps" USING btree ("_parent_id");
  CREATE INDEX "industries_flow_steps_image_idx" ON "industries_flow_steps" USING btree ("image_id");
  CREATE INDEX "industries_texts_order_parent" ON "industries_texts" USING btree ("order","parent_id");
  ALTER TABLE "industries" ADD CONSTRAINT "industries_flow_image_id_media_id_fk" FOREIGN KEY ("flow_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "industries_flow_flow_image_idx" ON "industries" USING btree ("flow_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "industries_day_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_flow_badges" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_flow_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "industries_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "industries_day_steps" CASCADE;
  DROP TABLE "industries_flow_badges" CASCADE;
  DROP TABLE "industries_flow_steps" CASCADE;
  DROP TABLE "industries_texts" CASCADE;
  ALTER TABLE "industries" DROP CONSTRAINT "industries_flow_image_id_media_id_fk";
  
  DROP INDEX "industries_flow_flow_image_idx";
  ALTER TABLE "pages_blocks_bz_timeline_steps" DROP COLUMN "label";
  ALTER TABLE "_pages_v_blocks_bz_timeline_steps" DROP COLUMN "label";
  ALTER TABLE "industries" DROP COLUMN "hero_cta_label";
  ALTER TABLE "industries" DROP COLUMN "products_section_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "products_section_title";
  ALTER TABLE "industries" DROP COLUMN "products_section_lead";
  ALTER TABLE "industries" DROP COLUMN "day_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "day_heading";
  ALTER TABLE "industries" DROP COLUMN "flow_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "flow_heading";
  ALTER TABLE "industries" DROP COLUMN "flow_lead";
  ALTER TABLE "industries" DROP COLUMN "flow_image_id";
  ALTER TABLE "industries" DROP COLUMN "flow_ticket";
  ALTER TABLE "industries" DROP COLUMN "flow_note";
  ALTER TABLE "industries" DROP COLUMN "flow_primary_label";
  ALTER TABLE "industries" DROP COLUMN "flow_primary_href";
  ALTER TABLE "industries" DROP COLUMN "flow_secondary_label";
  ALTER TABLE "industries" DROP COLUMN "flow_secondary_href";
  ALTER TABLE "industries" DROP COLUMN "faq_intro_eyebrow";
  ALTER TABLE "industries" DROP COLUMN "faq_intro_title";
  ALTER TABLE "industries" DROP COLUMN "faq_intro_lead";
  ALTER TABLE "industries" DROP COLUMN "contact_heading";
  ALTER TABLE "industries" DROP COLUMN "contact_lead";`)
}

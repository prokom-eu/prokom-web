import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "biznes_settings_news_ksef_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "posts" ADD COLUMN "summary" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_cta_eyebrow" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_cta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_cta_text" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_cta_link_label" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_cta_link_href" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_countdown_label" varchar;
  ALTER TABLE "posts" ADD COLUMN "aside_countdown_date" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "aside_countdown_caption" varchar;
  ALTER TABLE "posts" ADD COLUMN "contact_heading" varchar;
  ALTER TABLE "posts" ADD COLUMN "contact_lead" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_summary" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_cta_eyebrow" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_cta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_cta_text" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_cta_link_label" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_cta_link_href" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_countdown_label" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_countdown_date" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_aside_countdown_caption" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_contact_heading" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_contact_lead" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_eyebrow" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_date" timestamp(3) with time zone;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_date_label" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_text" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_link_label" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_link_href" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_secondary_link_label" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_secondary_link_href" varchar;
  ALTER TABLE "biznes_settings" ADD COLUMN "news_ksef_note" varchar;
  ALTER TABLE "biznes_settings_news_ksef_steps" ADD CONSTRAINT "biznes_settings_news_ksef_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."biznes_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "biznes_settings_news_ksef_steps_order_idx" ON "biznes_settings_news_ksef_steps" USING btree ("_order");
  CREATE INDEX "biznes_settings_news_ksef_steps_parent_id_idx" ON "biznes_settings_news_ksef_steps" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "biznes_settings_news_ksef_steps" CASCADE;
  ALTER TABLE "posts" DROP COLUMN "summary";
  ALTER TABLE "posts" DROP COLUMN "aside_cta_eyebrow";
  ALTER TABLE "posts" DROP COLUMN "aside_cta_title";
  ALTER TABLE "posts" DROP COLUMN "aside_cta_text";
  ALTER TABLE "posts" DROP COLUMN "aside_cta_link_label";
  ALTER TABLE "posts" DROP COLUMN "aside_cta_link_href";
  ALTER TABLE "posts" DROP COLUMN "aside_countdown_label";
  ALTER TABLE "posts" DROP COLUMN "aside_countdown_date";
  ALTER TABLE "posts" DROP COLUMN "aside_countdown_caption";
  ALTER TABLE "posts" DROP COLUMN "contact_heading";
  ALTER TABLE "posts" DROP COLUMN "contact_lead";
  ALTER TABLE "_posts_v" DROP COLUMN "version_summary";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_cta_eyebrow";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_cta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_cta_text";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_cta_link_label";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_cta_link_href";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_countdown_label";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_countdown_date";
  ALTER TABLE "_posts_v" DROP COLUMN "version_aside_countdown_caption";
  ALTER TABLE "_posts_v" DROP COLUMN "version_contact_heading";
  ALTER TABLE "_posts_v" DROP COLUMN "version_contact_lead";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_eyebrow";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_date";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_date_label";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_text";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_link_label";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_link_href";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_secondary_link_label";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_secondary_link_href";
  ALTER TABLE "biznes_settings" DROP COLUMN "news_ksef_note";`)
}

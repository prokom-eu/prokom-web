import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_catalog_groups_wheel_link_icon" AS ENUM('shield', 'cal', 'users', 'store', 'bolt', 'doc', 'life', 'arrow', 'check', 'phone', 'mail', 'pin', 'clock', 'monitor', 'remote', 'bell', 'wallet', 'chat', 'wrench', 'rocket', 'map', 'star', 'q', 'flash', 'grad', 'server', 'compass', 'panel', 'site', 'grid', 'plug', 'ticket', 'lifebuoy', 'chart', 'sign', 'cash', 'search', 'x', 'bed', 'food', 'refresh', 'globe', 'box', 'car', 'home', 'mountain', 'heart', 'bag', 'card', 'target', 'key', 'mega', 'mount', 'brief');
  ALTER TABLE "pages_blocks_bz_facts" ADD COLUMN "heading_accent" varchar;
  ALTER TABLE "pages_blocks_bz_facts" ADD COLUMN "lead" varchar;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD COLUMN "heading_accent" varchar;
  ALTER TABLE "_pages_v_blocks_bz_facts" ADD COLUMN "lead" varchar;
  ALTER TABLE "catalog_groups" ADD COLUMN "short_name" varchar;
  ALTER TABLE "catalog_groups" ADD COLUMN "wheel_link_label" varchar;
  ALTER TABLE "catalog_groups" ADD COLUMN "wheel_link_href" varchar;
  ALTER TABLE "catalog_groups" ADD COLUMN "wheel_link_icon" "enum_catalog_groups_wheel_link_icon";
  ALTER TABLE "products" ADD COLUMN "wheel_image_id" integer;
  ALTER TABLE "products" ADD COLUMN "wheel_name" varchar;
  ALTER TABLE "products" ADD COLUMN "wheel_color" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_wheel_image_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_wheel_name" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_wheel_color" varchar;
  ALTER TABLE "products" ADD CONSTRAINT "products_wheel_image_id_media_id_fk" FOREIGN KEY ("wheel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_wheel_image_id_media_id_fk" FOREIGN KEY ("version_wheel_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_wheel_image_idx" ON "products" USING btree ("wheel_image_id");
  CREATE INDEX "_products_v_version_version_wheel_image_idx" ON "_products_v" USING btree ("version_wheel_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP CONSTRAINT "products_wheel_image_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_wheel_image_id_media_id_fk";
  
  DROP INDEX "products_wheel_image_idx";
  DROP INDEX "_products_v_version_version_wheel_image_idx";
  ALTER TABLE "pages_blocks_bz_facts" DROP COLUMN "heading_accent";
  ALTER TABLE "pages_blocks_bz_facts" DROP COLUMN "lead";
  ALTER TABLE "_pages_v_blocks_bz_facts" DROP COLUMN "heading_accent";
  ALTER TABLE "_pages_v_blocks_bz_facts" DROP COLUMN "lead";
  ALTER TABLE "catalog_groups" DROP COLUMN "short_name";
  ALTER TABLE "catalog_groups" DROP COLUMN "wheel_link_label";
  ALTER TABLE "catalog_groups" DROP COLUMN "wheel_link_href";
  ALTER TABLE "catalog_groups" DROP COLUMN "wheel_link_icon";
  ALTER TABLE "products" DROP COLUMN "wheel_image_id";
  ALTER TABLE "products" DROP COLUMN "wheel_name";
  ALTER TABLE "products" DROP COLUMN "wheel_color";
  ALTER TABLE "_products_v" DROP COLUMN "version_wheel_image_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_wheel_name";
  ALTER TABLE "_products_v" DROP COLUMN "version_wheel_color";
  DROP TYPE "public"."enum_catalog_groups_wheel_link_icon";`)
}

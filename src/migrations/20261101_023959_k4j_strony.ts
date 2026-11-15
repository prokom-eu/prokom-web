import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'vending-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'vending-picker';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'app-mockup';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'catalog-tabs';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'sources';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'ksef-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'ksef-quiz';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'ksef-steps';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'ksef-penalties';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'ulga-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'yes-no';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'notice';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'vending-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'vending-picker';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'app-mockup';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'catalog-tabs';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'sources';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'ksef-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'ksef-quiz';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'ksef-steps';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'ksef-penalties';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'ulga-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'yes-no';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'notice';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_bz_section_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements', 'care-hero', 'care-areas', 'switch-steps', 'audience', 'start-calendar', 'seats', 'about-hero', 'lines', 'brands', 'contact-hero', 'contact-form');
  ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_section_variant" USING "variant"::"public"."enum_pages_blocks_bz_section_variant";
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements', 'care-hero', 'care-areas', 'switch-steps', 'audience', 'start-calendar', 'seats', 'about-hero', 'lines', 'brands', 'contact-hero', 'contact-form');
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_section_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_section_variant";`)
}

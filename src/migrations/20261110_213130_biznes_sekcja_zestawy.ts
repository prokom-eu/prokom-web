import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'bundles' BEFORE 'gopos-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'bundles' BEFORE 'gopos-hero';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_bz_section_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements', 'care-hero', 'care-areas', 'switch-steps', 'audience', 'start-calendar', 'seats', 'about-hero', 'lines', 'brands', 'contact-hero', 'contact-form', 'vending-hero', 'vending-picker', 'app-mockup', 'catalog-tabs', 'sources', 'ksef-hero', 'ksef-quiz', 'ksef-steps', 'ksef-penalties', 'ulga-hero', 'yes-no', 'notice');
  ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_section_variant" USING "variant"::"public"."enum_pages_blocks_bz_section_variant";
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements', 'care-hero', 'care-areas', 'switch-steps', 'audience', 'start-calendar', 'seats', 'about-hero', 'lines', 'brands', 'contact-hero', 'contact-form', 'vending-hero', 'vending-picker', 'app-mockup', 'catalog-tabs', 'sources', 'ksef-hero', 'ksef-quiz', 'ksef-steps', 'ksef-penalties', 'ulga-hero', 'yes-no', 'notice');
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_section_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_section_variant";`)
}

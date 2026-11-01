import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'care-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'care-areas';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'switch-steps';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'audience';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'start-calendar';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'seats';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'about-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'lines';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'brands';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'contact-hero';
  ALTER TYPE "public"."enum_pages_blocks_bz_section_variant" ADD VALUE 'contact-form';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'care-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'care-areas';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'switch-steps';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'audience';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'start-calendar';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'seats';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'about-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'lines';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'brands';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'contact-hero';
  ALTER TYPE "public"."enum__pages_v_blocks_bz_section_variant" ADD VALUE 'contact-form';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_bz_section_variant";
  CREATE TYPE "public"."enum_pages_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements');
  ALTER TABLE "pages_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum_pages_blocks_bz_section_variant" USING "variant"::"public"."enum_pages_blocks_bz_section_variant";
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_bz_section_variant";
  CREATE TYPE "public"."enum__pages_v_blocks_bz_section_variant" AS ENUM('stats', 'cards', 'steps', 'cases', 'band', 'videos', 'table', 'tabs', 'chips', 'products', 'gopos-hero', 'gopos-venues', 'gopos-areas', 'gopos-hub', 'gopos-package', 'insert-hero', 'insert-picker', 'insert-ksef', 'insert-points', 'insert-requirements');
  ALTER TABLE "_pages_v_blocks_bz_section" ALTER COLUMN "variant" SET DATA TYPE "public"."enum__pages_v_blocks_bz_section_variant" USING "variant"::"public"."enum__pages_v_blocks_bz_section_variant";`)
}

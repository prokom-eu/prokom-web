import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWA14 §4.2: the company dashboard mock-up (`dash` · `pulpit`) as a value of the preview variant —
 * only added. On its own: a new enum value can be used only after its transaction, so the data
 * (solution 26 → `pulpit-firmy`) comes in the next migration.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_solutions_preview_variant" ADD VALUE 'pulpit' BEFORE 'sms';
  ALTER TYPE "public"."enum__solutions_v_version_preview_variant" ADD VALUE 'pulpit' BEFORE 'sms';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solutions" ALTER COLUMN "preview_variant" SET DATA TYPE text;
  DROP TYPE "public"."enum_solutions_preview_variant";
  CREATE TYPE "public"."enum_solutions_preview_variant" AS ENUM('wizytowka', 'firmowa', 'rozbudowana', 'landing', 'pensjonat', 'restauracja', 'przebudowa', 'budowlanka', 'turystyka', 'uroda', 'warsztat', 'sklep', 'biuro', 'produkcja', 'zamowienia', 'crm', 'czas', 'excel', 'sms', 'faktury', 'raporty', 'ai');
  ALTER TABLE "solutions" ALTER COLUMN "preview_variant" SET DATA TYPE "public"."enum_solutions_preview_variant" USING "preview_variant"::"public"."enum_solutions_preview_variant";
  ALTER TABLE "_solutions_v" ALTER COLUMN "version_preview_variant" SET DATA TYPE text;
  DROP TYPE "public"."enum__solutions_v_version_preview_variant";
  CREATE TYPE "public"."enum__solutions_v_version_preview_variant" AS ENUM('wizytowka', 'firmowa', 'rozbudowana', 'landing', 'pensjonat', 'restauracja', 'przebudowa', 'budowlanka', 'turystyka', 'uroda', 'warsztat', 'sklep', 'biuro', 'produkcja', 'zamowienia', 'crm', 'czas', 'excel', 'sms', 'faktury', 'raporty', 'ai');
  ALTER TABLE "_solutions_v" ALTER COLUMN "version_preview_variant" SET DATA TYPE "public"."enum__solutions_v_version_preview_variant" USING "version_preview_variant"::"public"."enum__solutions_v_version_preview_variant";`)
}

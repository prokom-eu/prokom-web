import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Mock-ups of the 29 seeded solutions (PRZEKAZANIE-v24 §5), so staging and production get them
 * without the seed (it is blocked there). Copied here on purpose: a migration must not change when
 * the seed map does. Only rows without a mock-up yet — a choice made in the panel stays.
 */
const PREVIEWS = sql`
  (VALUES
    ('strona-wizytowka', 'site', 'wizytowka'),
    ('strona-firmowa-z-panelem', 'site', 'firmowa'),
    ('rozbudowana-strona-firmowa', 'site', 'rozbudowana'),
    ('landing-page', 'site', 'landing'),
    ('strona-dla-hotelu-lub-pensjonatu', 'site', 'pensjonat'),
    ('strona-dla-restauracji-lub-baru', 'site', 'restauracja'),
    ('przebudowa-starej-strony', 'before', 'przebudowa'),
    ('sklep-internetowy', 'site', 'sklep'),
    ('system-zlecen-i-grafik-ekip', 'dash', 'zamowienia'),
    ('crm-dla-malej-i-sredniej-firmy', 'dash', 'crm'),
    ('czas-pracy-i-rozliczenia', 'dash', 'czas'),
    ('system-serwisu-i-zgloszen', 'dash', 'zamowienia'),
    ('z-excela-do-systemu', 'dash', 'excel'),
    ('magazyn-i-zamowienia', 'dash', 'excel'),
    ('wyceny-i-oferty-z-pdf', 'dash', 'crm'),
    ('panel-klienta-i-portal-b2b', 'dash', 'crm'),
    ('grafik-i-rezerwacje-zajec', 'dash', 'czas'),
    ('kalendarz-sal-i-imprez', 'dash', 'czas'),
    ('aplikacja-dla-ekip-w-terenie', 'phone', 'budowlanka'),
    ('aplikacja-do-rezerwacji-dla-gosci', 'phone', 'pensjonat'),
    ('aplikacja-do-programu-ktory-masz', 'phone', 'firmowa'),
    ('powiadomienia-sms-i-e-mail', 'flow', 'sms'),
    ('faktury-bez-przepisywania', 'flow', 'faktury'),
    ('asystent-ai-do-zapytan', 'flow', 'ai'),
    ('raporty-dla-szefa', 'flow', 'raporty'),
    ('polaczenie-programow', 'flow', 'faktury'),
    ('opieka-nad-strona-i-systemem', 'care', NULL),
    ('przejecie-po-innym-wykonawcy', 'care', NULL),
    ('audyt-strony-lub-programu', 'before', 'przebudowa')
  ) AS p(slug, kind, variant)`

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_solutions_preview_kind" AS ENUM('site', 'dash', 'flow', 'care', 'before', 'phone');
  CREATE TYPE "public"."enum_solutions_preview_variant" AS ENUM('wizytowka', 'firmowa', 'rozbudowana', 'landing', 'pensjonat', 'restauracja', 'przebudowa', 'budowlanka', 'turystyka', 'uroda', 'warsztat', 'sklep', 'biuro', 'produkcja', 'zamowienia', 'crm', 'czas', 'excel', 'sms', 'faktury', 'raporty', 'ai');
  CREATE TYPE "public"."enum__solutions_v_version_preview_kind" AS ENUM('site', 'dash', 'flow', 'care', 'before', 'phone');
  CREATE TYPE "public"."enum__solutions_v_version_preview_variant" AS ENUM('wizytowka', 'firmowa', 'rozbudowana', 'landing', 'pensjonat', 'restauracja', 'przebudowa', 'budowlanka', 'turystyka', 'uroda', 'warsztat', 'sklep', 'biuro', 'produkcja', 'zamowienia', 'crm', 'czas', 'excel', 'sms', 'faktury', 'raporty', 'ai');
  ALTER TABLE "solutions" ADD COLUMN "preview_kind" "enum_solutions_preview_kind";
  ALTER TABLE "solutions" ADD COLUMN "preview_variant" "enum_solutions_preview_variant";
  ALTER TABLE "_solutions_v" ADD COLUMN "version_preview_kind" "enum__solutions_v_version_preview_kind";
  ALTER TABLE "_solutions_v" ADD COLUMN "version_preview_variant" "enum__solutions_v_version_preview_variant";`)
  await db.execute(sql`
  UPDATE "solutions" AS s
     SET "preview_kind" = p.kind::"enum_solutions_preview_kind",
         "preview_variant" = p.variant::"enum_solutions_preview_variant"
    FROM ${PREVIEWS}
   WHERE s."slug" = p.slug AND s."preview_kind" IS NULL;
  UPDATE "_solutions_v" AS v
     SET "version_preview_kind" = p.kind::"enum__solutions_v_version_preview_kind",
         "version_preview_variant" = p.variant::"enum__solutions_v_version_preview_variant"
    FROM ${PREVIEWS}
   WHERE v."version_slug" = p.slug AND v."latest" = true AND v."version_preview_kind" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "solutions" DROP COLUMN "preview_kind";
  ALTER TABLE "solutions" DROP COLUMN "preview_variant";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_preview_kind";
  ALTER TABLE "_solutions_v" DROP COLUMN "version_preview_variant";
  DROP TYPE "public"."enum_solutions_preview_kind";
  DROP TYPE "public"."enum_solutions_preview_variant";
  DROP TYPE "public"."enum__solutions_v_version_preview_kind";
  DROP TYPE "public"."enum__solutions_v_version_preview_variant";`)
}

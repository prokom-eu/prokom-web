import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

type SQL = ReturnType<typeof sql>

/**
 * SWV9 — data only, no schema change: the Software texts rewritten in the seed
 * (docs/design/prokomsoftware/TEKSTY-SWV9.md: headings, slogans, „na piśmie”) for the databases
 * the seed no longer writes (staging, production). Same list and order as the seed change.
 * Every text column of the Software blocks and collections is rewritten in one statement with
 * nested `replace` (substrings, `PAIRS`); split headings change only as whole values (`EXACT`).
 * Shared tables (pages, their FAQ, industries, site settings) change only for the Software
 * tenants. A text edited in the panel no longer contains the old words and stays as it is.
 * `down` restores nothing.
 */

/** `[old, new]` substrings, applied in this order. */
const PAIRS: [string, string][] = [
  ['Osiem rzeczy, które robimy dla firm.', 'Co możemy dla Ciebie zrobić'],
  [
    '12 rzeczy, po które firmy przychodzą najczęściej.',
    'Najczęściej zamawiane — z ceną i terminem',
  ],
  [
    'Spokój co miesiąc. Bez długich umów.',
    'Opieka po wdrożeniu: wybierasz poziom, rezygnujesz, kiedy chcesz',
  ],
  ['Działa także za rok. I rośnie z firmą.', 'Po starcie nie zostajesz sam'],
  ['Bez wtyczek do łatania. Bez nocnych aktualizacji.', 'Dlaczego nie robimy stron na WordPressie'],
  ['Strona, która zbiera zapytania, a nie kurz', 'Strona, z której klienci dzwonią i piszą'],
  ['Cała firma w jednym panelu', 'Zlecenia, ekipy i faktury w jednym miejscu'],
  [
    'Aplikacja w kieszeni każdego pracownika',
    'Ekipa ma zlecenie w telefonie, biuro od razu ma protokół',
  ],
  ['Powtarzalna robota robi się sama', 'SMS-y, faktury i raporty bez przepisywania'],
  ['Trzy kroki. Zero zobowiązań.', 'Jak wygląda darmowy audyt'],
  ['Zacznij za darmo. Głębiej, gdy trzeba.', 'Trzy poziomy audytu — pierwszy za darmo'],
  ['Każda robi swoje. Razem robią całość.', 'Co załatwisz w PRO-KOM poza stroną'],
  ['Twój system, warstwa po warstwie.', 'Z czego budujemy — i co z tego masz'],
  [
    'Nie składamy z gotowych klocków. Piszemy pod Twoją firmę.',
    'Piszemy stronę pod Twoją firmę, nie składamy jej z szablonu',
  ],
  [
    'Zobaczysz, jak to będzie wyglądać. Zanim zapłacisz.',
    'Najpierw szkic do klikania i wycena, potem decyzja',
  ],
  [
    'Co tydzień klikasz nową wersję. Nie czytasz raportów.',
    'Co tydzień dostajesz nową wersję do klikania',
  ],
  ['Opowiadasz, jak pracuje firma. My słuchamy.', 'Najpierw słuchamy, jak pracuje Twoja firma'],
  [
    'Od rozmowy do działającego systemu. Większość płacisz po odbiorze.',
    'Od rozmowy do działającego systemu — większość płacisz po odbiorze',
  ],
  [
    'Napisz, czego potrzebujesz. Odpowiemy w 1 dzień roboczy.',
    'Napisz, czego potrzebujesz, a odpowiemy w 1 dzień roboczy.',
  ],
  [
    'Ekipa widzi zlecenie w telefonie. Biuro widzi ekipę na tablicy.',
    'Ekipa ma zlecenie w telefonie, a biuro widzi ją na tablicy',
  ],
  [
    'Zero przepisywania wieczorem. Zero zgubionych protokołów.',
    'Bez przepisywania wieczorem i bez zgubionych protokołów',
  ],
  [
    'Pokaż nam, jak dziś wygląda dzień ekipy. Wycenimy aplikację pod niego.',
    'Pokaż nam dzień ekipy, a wycenimy aplikację pod niego',
  ],
  [
    'Odhaczaj zadania, dodaj zdjęcie, podpisz. Tablica w biurze zmieni się sama.',
    'Odhaczaj zadania, dodaj zdjęcie i podpis — tablica w biurze zmieni się od razu',
  ],
  ['Wybierz jedno. Resztę omówimy.', 'Wybierz jedno, resztę omówimy'],
  ['co z tego masz i od ilu kosztuje.', 'co z tego masz i ile kosztuje.'],
  [
    'Pytamy o to, co boli, i o programy, które już masz.',
    'Pytamy, co dziś zabiera Wam czas, i jakich programów już używacie.',
  ],
  ['Opowiadasz, jak pracuje firma i co boli.', 'Opowiadasz, jak pracuje firma i co nie działa.'],
  ['Większość stron w Polsce powstaje', 'Wiele firmowych stron powstaje'],
  ['Większość klientów wchodzi z komórki.', 'Klienci coraz częściej wchodzą z telefonu.'],
  [
    'SMS-y, przypomnienia, raporty i kopie robią się same, także w nocy.',
    'SMS-y, przypomnienia, raporty i kopie wysyłają się automatycznie, także w nocy.',
  ],
  [
    'SMS-y, maile, faktury i raporty robią się same.',
    'SMS-y, maile, faktury i raporty bez ręcznego przepisywania.',
  ],
  [
    'SMS-y, faktury, raporty robią się same.',
    'SMS-y, faktury i raporty wysyłają się automatycznie.',
  ],
  ['Rozliczenie miesiąca robi się samo.', 'Rozliczenie miesiąca gotowe jednym kliknięciem.'],
  ['Rozliczenie miesiąca robi się samo', 'Rozliczenie miesiąca bez liczenia godzin z kartek'],
  [
    'Klient nie czeka i nie ucieka do konkurencji. Google lepiej ocenia szybkie strony.',
    'Strona otwiera się od razu, także na słabym zasięgu. Google lepiej ocenia szybkie strony.',
  ],
  ['Podglądy na żywo · zanim zapłacisz', 'Podglądy na żywo · kliknij i sprawdź'],
  ['jak to może wyglądać, zanim zapłacisz.', 'jak to może u Ciebie wyglądać.'],
  ['Zobacz, co boli i co na to mamy', 'Typowe kłopoty w branży i co na nie mamy'],
  ['Dzień dobry, Anna', 'Dzień dobry, Anno'],
  ['Co boli w budowlance', 'Co zabiera czas w budowlance'],
  ['wycenimy na piśmie w 5–7 dni', 'wycenimy w 5–7 dni'],
  ['wyceniamy na piśmie w 5–7 dni', 'wyceniamy w 5–7 dni'],
  ['wyceniane na piśmie w 5–7 dni', 'wyceniane w 5–7 dni'],
  [
    'Szkic do klikania i stała cena za ustalony zakres, na piśmie.',
    'Szkic do klikania i stała cena za ustalony zakres.',
  ],
  ['wycenimy na piśmie.', 'wycenimy osobno.'],
  ['wyceniamy na piśmie.', 'wyceniamy osobno.'],
  ['Podgląd i wycena na piśmie w 5–7 dni', 'Podgląd i wycena w 5–7 dni'],
  ['Zakres, cena i termin na piśmie, bez zobowiązań.', 'Zakres, cena i termin, bez zobowiązań.'],
  ['dostajesz cenę i termin na piśmie.', 'dostajesz cenę i termin.'],
  ['podajemy cenę i termin na piśmie.', 'podajemy cenę i termin.'],
  ['„Do wyceny na piśmie”', '„Do wyceny”'],
  ['Do wyceny na piśmie', 'Do wyceny'],
  ['Rozmowa i propozycja na piśmie', 'Rozmowa i propozycja zakresu'],
  ['Dokładny termin dostaniesz na piśmie.', 'Dokładny termin podamy w wycenie.'],
  [
    'Termin potwierdzimy na piśmie po krótkiej rozmowie.',
    'Termin potwierdzimy po krótkiej rozmowie.',
  ],
  ['netto · stała cena na piśmie', 'netto · stała cena za zakres'],
  ['cenę i termin dostaniesz na piśmie w 5–7 dni', 'cenę i termin dostaniesz w 5–7 dni'],
  ['cena na piśmie w 5–7 dni', 'cena w 5–7 dni'],
  ['Dostaniesz ją na piśmie: zakres, cenę i termin.', 'Dostaniesz w niej zakres, cenę i termin.'],
  ['Wycenę na piśmie dostaniesz w 5–7 dni.', 'Wycenę dostaniesz w 5–7 dni.'],
  ['Podgląd do klikania i wycena na piśmie', 'Podgląd do klikania i wycena'],
  ['(wycena na piśmie w 5–7 dni', '(wycena w 5–7 dni'],
  ['wycenę na piśmie: zakres', 'wycenę: zakres'],
  ['Zakres, cena i termin na piśmie.', 'Zakres, cena i termin w wycenie.'],
  ['Wycena na piśmie przed startem.', 'Stała wycena przed startem.'],
  ['Przykład wyceny na piśmie', 'Przykład wyceny'],
  ['dostajesz na piśmie po krótkiej rozmowie', 'dostajesz po krótkiej rozmowie'],
  [
    'Dokładny termin dostajesz na piśmie razem z wyceną',
    'Dokładny termin dostajesz razem z wyceną',
  ],
  ['dokładna na piśmie po jednej rozmowie', 'dokładna po jednej rozmowie'],
  ['a dokładna na piśmie po rozmowie', 'a dokładna po rozmowie'],
  ['Darmowy audyt strony · wynik na piśmie', 'Darmowy audyt strony · raport w 2 dni robocze'],
  ['twojafirma.pl · raport na piśmie', 'twojafirma.pl · raport'],
  ['Wynik: raport na piśmie', 'Wynik: raport'],
  ['podgląd i wycena na piśmie są bez zobowiązań', 'podgląd i wycena są bez zobowiązań'],
  ['cenę i termin. Wszystko na piśmie. Bez zobowiązań.', 'cenę i termin. Bez zobowiązań.'],
  ['Wynik na piśmie.', 'Raport w 2 dni robocze.'],
  ['wynik na piśmie', 'raport w 2 dni robocze'],
  [
    'szkic do klikania i wycena na piśmie, bez zobowiązań',
    'szkic do klikania i wycena, bez zobowiązań',
  ],
  ['Cena i termin na piśmie, raty po etapach', 'Cena i termin w umowie, raty po etapach'],
  [
    'a wycenę na piśmie dostaniesz po krótkiej rozmowie',
    'a wycenę dostaniesz po krótkiej rozmowie',
  ],
  ['wycena na piśmie, opieka po starcie', 'stała wycena, opieka po starcie'],
  ['Stała cena na piśmie przed rozpoczęciem pracy.', 'Stała cena przed rozpoczęciem pracy.'],
  ['systemów i aplikacji, wycena na piśmie.', 'systemów i aplikacji, wycena w 5–7 dni.'],
  ['wycena na piśmie w 5–7 dni', 'wycena w 5–7 dni'],
  ['podgląd i cenę na piśmie dostajesz w 5–7 dni', 'podgląd i cenę dostajesz w 5–7 dni'],
  ['cena i plan etapów na piśmie w 5–7 dni', 'cena i plan etapów w 5–7 dni'],
  ['gdy chcesz wycenę na piśmie.', 'gdy chcesz wycenę.'],
]

/** `[old, new]` whole values (the two halves of a split heading). */
const EXACT: [string, string][] = [
  ['Ceny bez gwiazdek.', 'Ile to kosztuje'],
  ['Na piśmie.', '— bez małego druku'],
  ['Firma z Rabki.', 'Robimy dla firm z Podhala'],
  ['Od 2004 roku.', 'od 2004 roku'],
  ['Strona, program, sprzęt i serwis.', 'Stronę, kasę, sieć i naprawę laptopa'],
  ['W jednej firmie.', 'załatwisz w jednej firmie'],
]

const SOFTWARE_TENANTS = `SELECT "id" FROM "tenants" WHERE "line" = 'software'`
const SOFTWARE_PAGES = `SELECT "id" FROM "pages" WHERE "tenant_id" IN (${SOFTWARE_TENANTS})`
const SOFTWARE_VERSIONS = `SELECT "id" FROM "_pages_v" WHERE "version_tenant_id" IN (${SOFTWARE_TENANTS})`

/**
 * The rows of a table that belong to Software, as SQL, or `null` for a table not touched.
 * Software-only blocks and collections need no condition. Static SQL, no input.
 */
function softwareScope(table: string, parent: string): string | null {
  // Relation tables hold ids and paths only (and no `_parent_id`).
  if (table.endsWith('_rels')) return null
  if (/^_?pages(_v)?_blocks_sw_/.test(table)) return 'TRUE'
  if (/^(_solutions_v|solutions|solution_areas|software_settings|cities)(_|$)/.test(table)) {
    return 'TRUE'
  }
  if (table === 'pages') return `"tenant_id" IN (${SOFTWARE_TENANTS})`
  if (table === '_pages_v') return `"version_tenant_id" IN (${SOFTWARE_TENANTS})`
  if (table === 'site_settings' || table === 'industries') {
    return `"tenant_id" IN (${SOFTWARE_TENANTS})`
  }
  if (table.startsWith('industries_')) {
    return `"${parent}" IN (SELECT "id" FROM "industries" WHERE "tenant_id" IN (${SOFTWARE_TENANTS}))`
  }
  if (table === 'pages_blocks_faq') return `"_parent_id" IN (${SOFTWARE_PAGES})`
  if (table === '_pages_v_blocks_faq') return `"_parent_id" IN (${SOFTWARE_VERSIONS})`
  if (table === 'pages_blocks_faq_items') {
    return `"_parent_id" IN (SELECT "id" FROM "pages_blocks_faq" WHERE "_parent_id" IN (${SOFTWARE_PAGES}))`
  }
  if (table === '_pages_v_blocks_faq_items') {
    return `"_parent_id" IN (SELECT "id" FROM "_pages_v_blocks_faq" WHERE "_parent_id" IN (${SOFTWARE_VERSIONS}))`
  }
  return null
}

/** A string as it sits inside jsonb text (quotes and backslashes escaped), without the quotes. */
const inJson = (value: string) => JSON.stringify(value).slice(1, -1)

type Column = { table_name: string; column_name: string; data_type: string }

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`
    SELECT "table_name", "column_name", "data_type" FROM information_schema.columns
    WHERE "table_schema" = 'public'
  `)
  const columns = rows as Column[]
  // Array tables point at their parent with `_parent_id`, hasMany text tables with `parent_id`.
  const withUnderscore = new Set(
    columns.filter((c) => c.column_name === '_parent_id').map((c) => c.table_name),
  )
  for (const { table_name: table, column_name: column, data_type: type } of columns) {
    if (!['character varying', 'text', 'jsonb'].includes(type)) continue
    const scope = softwareScope(table, withUnderscore.has(table) ? '_parent_id' : 'parent_id')
    if (!scope || column === 'id' || column === 'path' || column.startsWith('_')) continue
    const json = type === 'jsonb'
    const col = json ? sql`${sql.identifier(column)}::text` : sql`${sql.identifier(column)}`
    let value: SQL = col
    for (const [from, to] of PAIRS) {
      value = json
        ? sql`replace(${value}, ${inJson(from)}, ${inJson(to)})`
        : sql`replace(${value}, ${from}, ${to})`
    }
    if (json) {
      // Whole values inside jsonb: the quoted string.
      for (const [from, to] of EXACT) {
        value = sql`replace(${value}, ${JSON.stringify(from)}, ${JSON.stringify(to)})`
      }
    } else {
      // Whole values in a column: one CASE on the cell (no substring pair touches them).
      const cases = EXACT.map(([from, to]) => sql`WHEN ${from} THEN ${to}`)
      value = sql`(CASE ${col} ${sql.join(cases, sql` `)} ELSE ${value} END)`
    }
    const next = json ? sql`(${value})::jsonb` : value
    await db.execute(
      sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = ${next} WHERE ${sql.identifier(column)} IS DISTINCT FROM ${next} AND ${sql.raw(scope)}`,
    )
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The old texts were replaced on purpose (SWV9); nothing to restore.
}

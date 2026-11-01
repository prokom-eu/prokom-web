import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWV8 A — data only, no schema change: the Software texts fixed in the seed after the audit of
 * 01.11 (docs/design/prokomsoftware/AUDYT-przed-stagingiem.md, P0 #5–#6, P1 #1, #2, #4, #6, #7,
 * #9), for the databases the seed no longer writes (staging, production, an edited panel).
 * Each text changes only where it is still exactly the old one, so an edit made in the panel
 * stays; only rows of the Software tenants change (`softwareScope`); pages are fixed in the saved
 * document and in its versions. JSON fields (navigation,
 * Software settings) swap whole string values. `down` restores nothing: the old texts were
 * mistakes.
 */

/** `[table, column, old, new]` — plain text columns; `_v` tables are the page versions. */
const COLUMNS: [string, string, string, string | null][] = [
  // P0 #5: „Odpowiemy w 1 dnia roboczego” — the fact is written for „w ciągu”.
  ...['pages_blocks_sw_contact_page', '_pages_v_blocks_sw_contact_page'].map(
    (table): [string, string, string, string] => [
      table,
      'submit_note',
      'Odpowiemy w [CZAS ODPOWIEDZI]. Dane tylko do tej sprawy, bez newslettera.',
      'Odpowiemy w ciągu [CZAS ODPOWIEDZI]. Dane tylko do tej sprawy, bez newslettera.',
    ],
  ),
  // P0 #6: the service line is „Serwis”; pro-kom.eu is the company's site, not a line.
  ...['pages_blocks_sw_contact_page_lines', '_pages_v_blocks_sw_contact_page_lines'].flatMap(
    (table): [string, string, string, string][] => [
      [table, 'label', 'TECH', 'SERWIS'],
      [table, 'label', 'GŁÓWNA', 'PRO-KOM.EU'],
    ],
  ),
  // P1 #1: counts of the home tiles differed from the catalog (8 areas ≠ 5 categories).
  ...['7 rozwiązań', '8 rozwiązań', '4 rozwiązania', '3 rozwiązania'].map(
    (label): [string, string, string, null] => ['solution_areas', 'count_label', label, null],
  ),
  // P1 #2: care levels by the names of the price list.
  ['solution_areas_chips', 'label', 'Opieka podstawowa', 'Podstawowa'],
  ['solution_areas_chips', 'label', 'Opieka z monitoringiem', 'Rozszerzona'],
  ['solution_areas_chips', 'label', 'Opieka nad systemem', 'Systemy'],
  // P1 #9: every other H2 ends with a full stop.
  ...['pages_blocks_faq', '_pages_v_blocks_faq'].map((table): [string, string, string, string] => [
    table,
    'heading',
    'Pytania, które słyszymy najczęściej',
    'Pytania, które słyszymy najczęściej.',
  ]),
  // P1 #7: „a od tej strony także strony…” read two ways (the seed had a second wording).
  ...['pages_blocks_sw_page_hero', '_pages_v_blocks_sw_page_hero'].flatMap(
    (table): [string, string, string, string][] =>
      [
        'PRO-KOM to firma z Rabki-Zdroju: kasy i programy dla firm, instalacje, serwis sprzętu, a od tej strony także strony, systemy i aplikacje. Za każdym projektem stoi ta sama firma, umowa i faktura VAT.',
        'PRO-KOM to firma z Rabki-Zdroju: kasy i programy dla firm, instalacje, serwis sprzętu, a w PRO-KOM Software strony, systemy i aplikacje. Za każdym projektem stoi ta sama firma, umowa i faktura VAT.',
      ].map((old) => [
        table,
        'lead',
        old,
        'PRO-KOM to firma z Rabki-Zdroju: kasy i programy dla firm, instalacje i serwis sprzętu. Software to nasza linia od stron, systemów i aplikacji dla firm. Za każdym projektem stoi ta sama firma, umowa i faktura VAT.',
      ]),
  ),
]

/** `[table, jsonb column, old string value, new]` — a whole JSON string, quotes included. */
const JSON_VALUES: [string, string, string, string][] = [
  // P0 #6: the footer of the saved navigation.
  ['site_settings', 'software_navigation', 'Jedna firma, pięć linii', 'Jedna firma, cztery linie'],
  ['site_settings', 'software_navigation', 'GŁÓWNA', 'PRO-KOM.EU'],
  // P1 #4: online booking left the offer (price list 28.10).
  [
    'software_settings',
    'wizard',
    'Wiele podstron, blog, języki, rezerwacje.',
    'Wiele podstron, blog i języki.',
  ],
  // P1 #6 (SWV9 Z6): „są w pełnej ofercie”; the click hint stays only under the filters.
  [
    'software_settings',
    'home',
    'Każda z ceną „od”, terminem i listą tego, co jest w cenie. Kliknij kartę, żeby zobaczyć szczegóły. Wszystkie 29 rozwiązań są w pełnej ofercie.',
    'Każda z ceną „od”, terminem i listą tego, co jest w cenie. Wszystkie 29 rozwiązań znajdziesz w pełnej ofercie.',
  ],
]

/** Ids of the Software line's tenants — only their rows change (a shared table such as the FAQ
 * block may hold the same words on another site). Static SQL, no input. */
const SOFTWARE_TENANTS = `SELECT "id" FROM "tenants" WHERE "line" = 'software'`
const SOFTWARE_PAGES = `SELECT "id" FROM "pages" WHERE "tenant_id" IN (${SOFTWARE_TENANTS})`
const SOFTWARE_VERSIONS = `SELECT "id" FROM "_pages_v" WHERE "version_tenant_id" IN (${SOFTWARE_TENANTS})`

/** The condition that keeps an update inside the Software tenants, by how the table hangs. */
function softwareScope(table: string): string {
  if (table === 'pages_blocks_sw_contact_page_lines') {
    return `"_parent_id" IN (SELECT "id" FROM "pages_blocks_sw_contact_page" WHERE "_parent_id" IN (${SOFTWARE_PAGES}))`
  }
  if (table === '_pages_v_blocks_sw_contact_page_lines') {
    return `"_parent_id" IN (SELECT "id" FROM "_pages_v_blocks_sw_contact_page" WHERE "_parent_id" IN (${SOFTWARE_VERSIONS}))`
  }
  if (table.startsWith('pages_blocks_')) return `"_parent_id" IN (${SOFTWARE_PAGES})`
  if (table.startsWith('_pages_v_blocks_')) return `"_parent_id" IN (${SOFTWARE_VERSIONS})`
  if (table === 'solution_areas_chips') {
    return `"_parent_id" IN (SELECT "id" FROM "solution_areas" WHERE "tenant_id" IN (${SOFTWARE_TENANTS}))`
  }
  return `"tenant_id" IN (${SOFTWARE_TENANTS})`
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, column, old, next] of COLUMNS) {
    await db.execute(
      sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = ${next} WHERE ${sql.identifier(column)} = ${old} AND ${sql.raw(softwareScope(table))}`,
    )
  }
  for (const [table, column, old, next] of JSON_VALUES) {
    // JSON.stringify gives the string as jsonb text writes it (quotes, escapes), so only a whole
    // value matches — never a longer text that contains it.
    const from = JSON.stringify(old)
    const to = JSON.stringify(next)
    await db.execute(
      sql`UPDATE ${sql.identifier(table)} SET ${sql.identifier(column)} = replace(${sql.identifier(column)}::text, ${from}, ${to})::jsonb WHERE strpos(${sql.identifier(column)}::text, ${from}) > 0 AND ${sql.raw(softwareScope(table))}`,
    )
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // The old texts were mistakes; nothing to restore.
}

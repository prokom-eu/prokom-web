import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * SWA14 §4 — data only (the `pulpit` mock-up value comes in the migration before: a new enum value
 * can be used only after its own transaction). For the databases the seed does not write (staging,
 * production), the same as the seed package:
 * - solution 26 `raporty-dla-szefa` becomes the system `pulpit-firmy` (name, texts, category,
 *   mock-up `dash/pulpit`, „W cenie”). **The price stays empty** until the boss accepts it in Asana
 *   („SZEF · Software: cena Pulpitu firmy”, SWA14 §4.5) — then 3490 in the panel;
 * - `/rozwiazania/raporty-dla-szefa` → 301 to the new page (`Redirects`);
 * - the start page: situation 04 (only while it still points to the SMS solution), the hero slide
 *   „pulpit firmy.” after „System dla firmy” (only if missing), the old slug in the bento → new;
 * - the price slot without a price reads „Wycena po rozmowie” (only while it is the old text);
 * - the chip of the area „Automatyzacje i AI” gets the new name.
 * Copied here on purpose: a migration must not change when the seed does. Each change only while
 * the data is still as the seed left it — an edit made in the panel stays. `down` goes back.
 */

const OLD_SLUG = 'raporty-dla-szefa'
const NEW_SLUG = 'pulpit-firmy'
const SOFTWARE_TENANTS = sql`SELECT "id" FROM "tenants" WHERE "line" = 'software'`

type Solution = {
  slug: string
  name: string
  label: string
  tag: string
  lead: string
  forWhom: string
  keywords: string
  category: 'systemy' | 'automatyzacje'
  leadTime: string | null
  priceNote: string
  example: string
  thumbnail: string
  preview: { kind: 'dash' | 'flow'; variant: 'pulpit' | 'raporty' }
  texts: { features: string[]; included: string[]; moreExamples: string[] }
}

const PULPIT: Solution = {
  slug: NEW_SLUG,
  name: 'Pulpit firmy i raporty',
  label: 'System',
  tag: 'LICZBY NA ŻYWO',
  lead: 'Sprzedaż, zlecenia, koszty i zespół na jednym ekranie. Na komputerze i w telefonie, bez Excela i bez dzwonienia po ludziach.',
  forWhom: 'właściciele i kierownicy, którzy chcą widzieć firmę w liczbach',
  keywords: 'pulpit dashboard panel zarzadczy statystyki raport szef wlasciciel kpi wskazniki',
  category: 'systemy',
  leadTime: 'od 3 tygodni',
  priceNote:
    'W cenie „od”: pulpit z 6–8 wskaźnikami z jednego źródła danych, raport co tydzień, do 5 użytkowników. Kolejne źródła danych wyceniamy osobno w 5–7 dni.',
  example:
    'Właściciel firmy usługowej rano otwiera telefon: przychód miesiąca, 37 zleceń w toku, 2 po terminie i jedna faktura do przypomnienia. Wcześniej zbierał to z trzech arkuszy w piątek po południu.',
  thumbnail: '/software/rozwiazania/pulpit-firmy.svg',
  preview: { kind: 'dash', variant: 'pulpit' },
  texts: {
    features: [
      'Wskaźniki Twojej firmy na żywo',
      'Raport co poniedziałek o 7:00',
      'Alert, gdy coś się opóźnia',
    ],
    included: [
      'Pulpit z 6–8 wskaźnikami ustalonymi z Tobą',
      'Dane z jednego źródła: Twój program, Excel albo nasz system',
      'Raport e-mailem co tydzień',
      'Do 5 użytkowników, komputer i telefon',
    ],
    moreExamples: [
      'kolejne źródła danych (sklep, księgowość, CRM)',
      'alerty SMS',
      'osobne widoki dla kierowników',
      'eksport PDF dla wspólnika lub banku',
    ],
  },
}

/** Solution 26 as the seed package had it before SWA14 (for `down`). */
const RAPORTY: Solution = {
  slug: OLD_SLUG,
  name: 'Raporty dla szefa',
  label: 'Automatyzacja',
  tag: 'PONIEDZIAŁEK 7:00',
  lead: 'Co tydzień: przychód, zlecenia, opóźnienia, kto ile. Na telefon, bez dzwonienia po ludziach.',
  forWhom: 'właściciele, którzy chcą wiedzieć bez pytania',
  keywords: 'raport szef wlasciciel pulpit przychod kontrola',
  category: 'automatyzacje',
  leadTime: null,
  priceNote: 'Zapytaj o wycenę',
  example:
    'W poniedziałek rano na telefon przychodzi raport: przychód z tygodnia, zlecenia i to, co się opóźnia. Bez dzwonienia po kierownikach.',
  thumbnail: '/software/rozwiazania/raporty-dla-szefa.svg',
  preview: { kind: 'flow', variant: 'raporty' },
  texts: {
    features: ['Pulpit właściciela', 'Raport co poniedziałek', 'Alerty, gdy coś się opóźnia'],
    included: [],
    moreExamples: [],
  },
}

const SITUATION_OLD = {
  short: 'Za dużo przepisywania',
  question: 'Ciągle coś przepisujesz, wysyłasz i przypominasz ręcznie',
  answer:
    'SMS-y, faktury i raporty wysyłają się same. Asystent AI szykuje odpowiedzi, a Ty tylko zatwierdzasz.',
  solution: 'powiadomienia-sms-i-e-mail',
  mockup: { kind: 'flow', variant: 'sms' },
}
const SITUATION_NEW = {
  short: 'Brak liczb na bieżąco',
  question: 'Ile zarobiliśmy w tym miesiącu? Odpowiedź zajmuje pół dnia',
  answer:
    'Pulpit firmy zbiera sprzedaż, zlecenia, koszty i pracę zespołu na jednym ekranie. Liczby odświeżają się same: sprawdzasz je w telefonie w 10 sekund, a w poniedziałek o 7:00 raport przychodzi sam.',
  solution: NEW_SLUG,
  mockup: { kind: 'dash', variant: 'pulpit' },
  offer: 'Zobacz pulpit',
}
const SLIDE = {
  word: 'pulpit firmy.',
  name: 'Pulpit firmy',
  text: 'Sprzedaż, zlecenia i koszty na jednym ekranie. Na żywo.',
  solution: NEW_SLUG,
  mockup: { kind: 'dash', variant: 'pulpit' },
  icon: 'M3 21h18M6 17v-5M11 17V7M16 17v-8M21 17V4',
}
/** The slide comes right after this one („System dla firmy”). */
const SLIDE_AFTER = 'system-zlecen-i-grafik-ekip'
const MAX_SLIDES = 9
const FALLBACK = { old: 'Zapytaj o wycenę', new: 'Wycena po rozmowie' }
const CHIP = { old: 'Raporty dla szefa', new: 'Pulpit i raporty' }

type Db = MigrateUpArgs['db']
type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Every string equal to `from` anywhere in the JSON → `to` (the slug in the bento chips). */
function replaceSlug(value: unknown, from: string, to: string): unknown {
  if (value === from) return to
  if (Array.isArray(value)) return value.map((item) => replaceSlug(item, from, to))
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceSlug(item, from, to)]),
    )
  }
  return value
}

/** Writes one solution's texts of a path (`features`…), in order; the old rows of it go. */
async function writeTexts(
  db: Db,
  table: '_solutions_v_texts' | 'solutions_texts',
  parentId: number,
  path: string,
  items: readonly string[],
) {
  await db.execute(
    sql`DELETE FROM ${sql.identifier(table)} WHERE "parent_id" = ${parentId} AND "path" = ${path}`,
  )
  for (const [index, text] of items.entries()) {
    await db.execute(
      sql`INSERT INTO ${sql.identifier(table)} ("order", "parent_id", "path", "text") VALUES (${index + 1}, ${parentId}, ${path}, ${text})`,
    )
  }
}

/** Solution 26 from `from` to `to`: the published row and its latest version. */
async function moveSolution(db: Db, from: Solution, to: Solution) {
  const { rows } = await db.execute(
    sql`SELECT "id" FROM "solutions" WHERE "slug" = ${from.slug} AND "tenant_id" IN (${SOFTWARE_TENANTS})`,
  )
  for (const { id } of rows as { id: number }[]) {
    await db.execute(sql`
      UPDATE "solutions" SET
        "slug" = ${to.slug}, "name" = ${to.name}, "label" = ${to.label}, "tag" = ${to.tag},
        "lead" = ${to.lead}, "for_whom" = ${to.forWhom}, "keywords" = ${to.keywords},
        "category" = ${to.category}::"enum_solutions_category",
        "price_from" = NULL, "lead_time" = ${to.leadTime}, "price_note" = ${to.priceNote},
        "example" = ${to.example}, "thumbnail" = ${to.thumbnail},
        "preview_kind" = ${to.preview.kind}::"enum_solutions_preview_kind",
        "preview_variant" = ${to.preview.variant}::"enum_solutions_preview_variant",
        "updated_at" = now()
      WHERE "id" = ${id}`)
    for (const [path, items] of Object.entries(to.texts)) {
      await writeTexts(db, 'solutions_texts', id, path, items)
    }
    const versions = await db.execute(
      sql`SELECT "id" FROM "_solutions_v" WHERE "parent_id" = ${id} AND "latest" = true`,
    )
    for (const { id: versionId } of versions.rows as { id: number }[]) {
      await db.execute(sql`
        UPDATE "_solutions_v" SET
          "version_slug" = ${to.slug}, "version_name" = ${to.name}, "version_label" = ${to.label},
          "version_tag" = ${to.tag}, "version_lead" = ${to.lead},
          "version_for_whom" = ${to.forWhom}, "version_keywords" = ${to.keywords},
          "version_category" = ${to.category}::"enum__solutions_v_version_category",
          "version_price_from" = NULL, "version_lead_time" = ${to.leadTime},
          "version_price_note" = ${to.priceNote}, "version_example" = ${to.example},
          "version_thumbnail" = ${to.thumbnail},
          "version_preview_kind" = ${to.preview.kind}::"enum__solutions_v_version_preview_kind",
          "version_preview_variant" = ${to.preview.variant}::"enum__solutions_v_version_preview_variant",
          "updated_at" = now()
        WHERE "id" = ${versionId}`)
      for (const [path, items] of Object.entries(to.texts)) {
        await writeTexts(db, '_solutions_v_texts', versionId, `version.${path}`, items)
      }
    }
  }
}

/** The start page and the price words of each Software tenant (`software_settings`, jsonb). */
async function updateSettings(db: Db, back: boolean) {
  const { rows } = await db.execute(
    sql`SELECT "id", "home", "wizard" FROM "software_settings" WHERE "tenant_id" IN (${SOFTWARE_TENANTS})`,
  )
  for (const row of rows as { id: number; home: unknown; wizard: unknown }[]) {
    // Up: the old slug (the bento chip) first, then the new parts; down: the other way round,
    // so the new parts are still found by their slug before it goes back.
    const swapSlug = (value: unknown) =>
      replaceSlug(value, back ? NEW_SLUG : OLD_SLUG, back ? OLD_SLUG : NEW_SLUG)
    const withParts = (value: unknown) => (isObject(value) ? updateHome(value, back) : value)
    const home = back ? swapSlug(withParts(row.home)) : withParts(swapSlug(row.home))
    const wizard = row.wizard
    if (isObject(wizard) && isObject(wizard.priceDisplay)) {
      const [from, to] = back ? [FALLBACK.new, FALLBACK.old] : [FALLBACK.old, FALLBACK.new]
      if (wizard.priceDisplay.fallback === from) wizard.priceDisplay.fallback = to
    }
    await db.execute(sql`
      UPDATE "software_settings"
         SET "home" = ${JSON.stringify(home)}::jsonb, "wizard" = ${JSON.stringify(wizard)}::jsonb
       WHERE "id" = ${row.id}`)
  }
}

function updateHome(home: Json, back: boolean): Json {
  const situations = home.situations
  if (isObject(situations) && Array.isArray(situations.items)) {
    const items = [...situations.items] as unknown[]
    const fourth = items[3]
    const [from, to] = back ? [SITUATION_NEW, SITUATION_OLD] : [SITUATION_OLD, SITUATION_NEW]
    if (isObject(fourth) && fourth.solution === from.solution) items[3] = to
    home = { ...home, situations: { ...situations, items } }
  }
  const hero = home.hero
  if (isObject(hero) && Array.isArray(hero.slides)) {
    const slides = hero.slides as unknown[]
    const has = slides.some((slide) => isObject(slide) && slide.solution === NEW_SLUG)
    if (back) {
      const kept = slides.filter((slide) => !(isObject(slide) && slide.solution === NEW_SLUG))
      home = { ...home, hero: { ...hero, slides: kept } }
    } else if (!has && slides.length < MAX_SLIDES) {
      const after = slides.findIndex((slide) => isObject(slide) && slide.solution === SLIDE_AFTER)
      const at = after < 0 ? slides.length : after + 1
      home = {
        ...home,
        hero: { ...hero, slides: [...slides.slice(0, at), SLIDE, ...slides.slice(at)] },
      }
    }
  }
  return home
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await moveSolution(db, RAPORTY, PULPIT)
  await db.execute(sql`
    INSERT INTO "redirects" ("tenant_id", "from", "to", "updated_at", "created_at")
      SELECT t.id, ${`/rozwiazania/${OLD_SLUG}`}, ${`/rozwiazania/${NEW_SLUG}`}, now(), now()
      FROM "tenants" t
      WHERE t.line = 'software'
        AND NOT EXISTS (
          SELECT 1 FROM "redirects" r WHERE r.tenant_id = t.id AND r."from" = ${`/rozwiazania/${OLD_SLUG}`}
        )`)
  await updateSettings(db, false)
  await db.execute(sql`
    UPDATE "solution_areas_chips" SET "label" = ${CHIP.new}
     WHERE "label" = ${CHIP.old}
       AND "_parent_id" IN (SELECT "id" FROM "solution_areas" WHERE "tenant_id" IN (${SOFTWARE_TENANTS}))`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "solution_areas_chips" SET "label" = ${CHIP.old}
     WHERE "label" = ${CHIP.new}
       AND "_parent_id" IN (SELECT "id" FROM "solution_areas" WHERE "tenant_id" IN (${SOFTWARE_TENANTS}))`)
  await updateSettings(db, true)
  await db.execute(sql`
    DELETE FROM "redirects"
     WHERE "from" = ${`/rozwiazania/${OLD_SLUG}`} AND "to" = ${`/rozwiazania/${NEW_SLUG}`}
       AND "tenant_id" IN (${SOFTWARE_TENANTS})`)
  await moveSolution(db, PULPIT, RAPORTY)
}

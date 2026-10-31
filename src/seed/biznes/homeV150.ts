// K4c, PR 3b — home page v150, from the departments down (K36 §1, board `#s4-dz` … `#s4-kontakt`):
// what the seed changes in a home page it created earlier. A field is replaced only while it
// still holds the old seed value (edits in the panel win); the new value is the one of the
// seed's own layout (`biznesHomeLayout`), so a fresh page and an upgraded one are the same.
// Fields added by the cleanup migration (texts that were in the code) are filled while empty.
// `bzOnePartner` and `bzNews` are gone with their tables (migration after PR 3b).

type Block = { blockType: string }
type Fields = Record<string, unknown>

/** A field by its path, e.g. `['industries', 'tiles']`. */
type Path = readonly string[]

/**
 * Old seed values, by block type and field path. Arrays are compared by `key` of their rows
 * (the rows' other fields and ids may differ: relations, ids added by Payload). A matching array
 * is replaced whole: an edit of another field of its rows (e.g. a step's text while its
 * `label` stayed) is lost — accepted, the seed runs locally only. `old: EMPTY` = the field is
 * empty (null, missing or blank).
 */
type Rule = { path: Path; old: unknown; key?: string }

const EMPTY = Symbol('empty')

const RULES: Record<string, Rule[]> = {
  bzOffer: [
    { path: ['heading'], old: 'Wszystko dla firmy, w pięciu działach.' },
    {
      path: ['lead'],
      old: '{produkty} produktów i usług od {marki} marek. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę dostajesz na piśmie, pod swoją firmę.',
    },
    { path: ['catalogLabel'], old: 'Cały katalog' },
    { path: ['searchEyebrow'], old: EMPTY },
    { path: ['searchHeading'], old: EMPTY },
    {
      path: ['systems'],
      old: ['GoPOS dla gastronomii', 'Subiekt i programy InsERT', 'Opieka IT w abonamencie'],
      key: 'title',
    },
  ],
  bzPlan: [
    { path: ['industries', 'eyebrow'], old: EMPTY },
    { path: ['industries', 'heading'], old: 'Nie widzisz swojej branży? Obsługujemy każdą firmę.' },
    {
      path: ['industries', 'lead'],
      old: 'Kilka przykładów i to, od czego zwykle zaczynamy. Każdą firmę dobieramy indywidualnie.',
    },
    { path: ['industries', 'moreNote'], old: 'jeszcze 10 i każda inna firma' },
    {
      path: ['industries', 'tiles'],
      old: [
        'Sklep spożywczy',
        'Sklep odzieżowy i branżowy',
        'Restauracja, bar, kawiarnia',
        'Pensjonat, hotel, apartamenty',
        'Fryzjer, kosmetyka, beauty',
        'Gmina, urząd, biblioteka',
        'Biuro rachunkowe',
        'Gabinet, przychodnia',
        'Szkoła, przedszkole',
        'Stragan, handel obwoźny',
        'Food truck',
        'Mechanik i serwis',
        'Zakład produkcyjny',
        'Hurtownia',
        'Firma transportowa',
        'Kancelaria',
        'Sklep internetowy',
        'Apteka',
        'Stacja paliw, myjnia',
        'Każda inna firma',
      ],
      key: 'name',
    },
    {
      path: ['funding', 'text'],
      old: 'Dobieramy, dostarczamy, wdrażamy i szkolimy — zgodnie z tym, na co dostałeś środki.',
    },
  ],
  bzSteps: [
    {
      path: ['lead'],
      old: 'Cztery kroki i konkretni ludzie, którzy za nie odpowiadają. Ten sam zespół z Rabki — od pierwszej rozmowy przez kolejne lata.',
    },
    {
      path: ['steps'],
      old: [
        'mówi wprost, czego nie potrzebujesz',
        'nie zaczynasz rozmowy od nowa',
        'partner InsERT, wdraża też Comarch ERP',
        'autoryzowany serwis Posnet i Elzab',
      ],
      // The column `roleNote` became `label` (data kept by the migration).
      key: 'label',
    },
    {
      path: ['guarantees'],
      old: [
        'Wycena bez zobowiązań',
        'Oferta na piśmie',
        'Kasa w cenie z fiskalizacją i szkoleniem',
        'Jeden opiekun od początku do końca',
      ],
      key: 'text',
    },
    { path: ['commitmentsEyebrow'], old: EMPTY },
    { path: ['commitmentsHeading'], old: EMPTY },
  ],
  bzReferences: [
    { path: ['eyebrow'], old: 'Dla kogo pracujemy' },
    { path: ['heading'], old: 'Ponad 100 firm i instytucji z Podhala i Małopolski.' },
    {
      path: ['lead'],
      old: 'Od jednej kasy w kwiaciarni po serwer i sieć w pensjonacie na 60 pokoi. Sześć rodzajów firm, które obsługujemy najczęściej.',
    },
  ],
  bzFacts: [
    { path: ['heading'], old: 'Lokalna firma, która jest tu od lat — i będzie dalej.' },
    // K4-FINAL §1: „100+ klientów firmowych”, one wording everywhere.
    { path: ['stats'], old: ['firm pod stałą opieką', 'autoryzacje i partnerstwa'], key: 'label' },
    { path: ['contactLink', 'label'], old: 'Kontakt i dojazd' },
    { path: ['contactLink', 'href'], old: '/kontakt' },
  ],
  faq: [
    { path: ['heading'], old: 'Zanim zadzwonisz' },
    {
      path: ['lead'],
      old: 'Najczęstsze pytania od firm z Podhala. Nie ma tu Twojego pytania? Zadzwoń albo napisz, odpowiemy od ręki.',
    },
    {
      // The old answers promised a monthly fee (K4-FINAL §1) and a form that does not exist.
      path: ['items'],
      old: [
        'Czy obsługujecie firmy spoza Rabki?',
        'Ile kosztuje opieka informatyczna?',
        'Czy pomożecie przygotować firmę do KSeF?',
        'Co, gdy coś przestanie działać?',
        'Czy przejmujecie serwis kasy od innej firmy?',
        'Jestem księgową / prowadzę biuro rachunkowe — jak możemy współpracować?',
      ],
      key: 'question',
    },
  ],
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function get(value: unknown, path: Path): unknown {
  return path.reduce<unknown>(
    (at, key) => (at && typeof at === 'object' ? (at as Fields)[key] : undefined),
    value,
  )
}

/** A copy of `value` with `path` set to `next` (`undefined` = the field emptied: `null`). */
function set(value: Fields, path: Path, next: unknown): Fields {
  const [key, ...rest] = path
  if (key === undefined) return value
  const inner = (value[key] ?? {}) as Fields
  return { ...value, [key]: rest.length === 0 ? (next ?? null) : set(inner, rest, next) }
}

function holdsOld(current: unknown, rule: Rule): boolean {
  if (rule.old === EMPTY) return current === null || current === undefined || current === ''
  if (!rule.key) return current === rule.old
  if (!Array.isArray(current)) return false
  const keys = current.map((row) => (row as Fields | null)?.[rule.key as string])
  return same(keys, rule.old)
}

function upgradeBlock<T extends Block>(block: T, seed: Block | undefined): T {
  const rules = RULES[block.blockType]
  if (!rules || !seed) return block
  let next = block as unknown as Fields
  for (const rule of rules) {
    if (holdsOld(get(next, rule.path), rule)) next = set(next, rule.path, get(seed, rule.path))
  }
  return next as unknown as T
}

/**
 * The home layout with the v150 texts below the hero, or `null` when nothing changes. `seed`
 * is the seed's layout: the source of the new values.
 */
export function upgradeHomeV150<T extends Block>(
  layout: readonly T[] | null | undefined,
  seed: readonly Block[],
): T[] | null {
  if (!layout || layout.length === 0) return null
  const next = layout.map((block) =>
    upgradeBlock(
      block,
      seed.find((own) => own.blockType === block.blockType),
    ),
  )
  return same(next, layout) ? null : next
}

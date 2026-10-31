// K4c, PR 3b — home page v150, from the departments down (K36 §1, board `#s4-dz` … `#s4-kontakt`):
// what the seed changes in a home page it created earlier. A field is replaced only while it
// still holds the old seed value (edits in the panel win); the new value is the one of the
// seed's own layout (`biznesHomeLayout`), so a fresh page and an upgraded one are the same.

type Block = { blockType: string }
type Fields = Record<string, unknown>

/** Blocks v150 drops from the home page (K36 §1, K4-FINAL §2), by the seed's own heading. */
const DROPPED: Record<string, string> = {
  bzOnePartner: 'Ile numerów masz w telefonie',
  bzNews: 'Ostatnio w Aktualnościach',
}

/** A field by its path, e.g. `['industries', 'tiles']`. */
type Path = readonly string[]

/**
 * Old seed values, by block type and field path. Arrays are compared by `key` of their rows
 * (the rows' other fields and ids may differ: relations, ids added by Payload).
 */
type Rule = { path: Path; old: unknown; key?: string }

const RULES: Record<string, Rule[]> = {
  bzOffer: [
    { path: ['heading'], old: 'Wszystko dla firmy, w pięciu działach.' },
    {
      path: ['lead'],
      old: '{produkty} produktów i usług od {marki} marek. Cen nie ma na stronie: dodajesz pozycje do zapytania, a wycenę dostajesz na piśmie, pod swoją firmę.',
    },
    { path: ['catalogLabel'], old: 'Cały katalog' },
    {
      path: ['systems'],
      old: ['GoPOS dla gastronomii', 'Subiekt i programy InsERT', 'Opieka IT w abonamencie'],
      key: 'title',
    },
  ],
  bzPlan: [
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
      key: 'roleNote',
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
    { path: ['eyebrow'], old: 'PRO-KOM w faktach' },
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

function dropped(block: Block): boolean {
  const heading = DROPPED[block.blockType]
  return heading !== undefined && (block as Fields).heading === heading
}

/**
 * The home layout with the v150 texts below the hero and without the blocks v150 drops, or
 * `null` when nothing changes. `seed` is the seed's layout: the source of the new values.
 */
export function upgradeHomeV150<T extends Block>(
  layout: readonly T[] | null | undefined,
  seed: readonly Block[],
): T[] | null {
  if (!layout || layout.length === 0) return null
  const next = layout
    .filter((block) => !dropped(block))
    .map((block) =>
      upgradeBlock(
        block,
        seed.find((own) => own.blockType === block.blockType),
      ),
    )
  return same(next, layout) ? null : next
}

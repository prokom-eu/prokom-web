import type { BundleArea } from '../../lib/catalog/options'
import type { Bundle } from '../../payload-types'
import type { ProductId } from './k31Plans'

/**
 * K3c: ready bundles of `seed/prokombiznes/k3/zestawy.json` (→ `Bundles`, K3-KATALOG §7).
 * Pure functions; `run.ts` gives them the record ids. Cards are named by `slug_seed`; a card the
 * K3.1 split replaced stands for its 301 target (like a point of the floor plan).
 */

export type K3BundleItem = {
  slug: string
  rola: string
  /** A number or a description: „wg stanowisk”, „1–2”. */
  ilosc: number | string
  wariant_sugerowany?: string
  obowiazkowy: boolean
  do_potwierdzenia?: string
}

export type K3Bundle = {
  slug: string
  nazwa: string
  seria: string
  poziom?: string
  branze: string[]
  dla_kogo: string
  korzysc: string
  opis: string[]
  elementy: K3BundleItem[]
  zamienniki: { zamiast: string; mozna: string; kiedy: string }[]
  uslugi: string[]
  uslugi_po_akceptacji_szefa?: string[]
  dlaczego_tak: string[]
  uwagi_wewnetrzne?: string[]
  faq: { q: string; a: string }[]
  kolejnosc: number
  status: string
  powiazane?: string[]
}

export type K3CompatCheck = {
  zestaw: string
  para: string
  zrodlo_w_karcie?: string
  status?: string
}

export type BundleData = Pick<
  Bundle,
  | 'slug'
  | 'name'
  | 'order'
  | 'area'
  | 'series'
  | 'level'
  | 'audience'
  | 'benefit'
  | 'reasons'
  | 'internalNotes'
> & {
  contentStatus: NonNullable<Bundle['contentStatus']>
  industries: number[]
  description: { text: string }[]
  items: {
    product: number
    role: string
    quantity: string
    mandatory: boolean
    suggestedVersion: string | null
    toConfirm: string | null
  }[]
  swaps: { from: number; to: number; when: string }[]
  services: number[]
  faq: { question: string; answer: string }[]
  related: number[]
  compatChecks: { pair: string; source: string | null; status: string | null }[]
}

export type BundleRefs = {
  /** Cards standing for a `slug_seed` (`cardsOf`): a split card → its new cards, 301 first. */
  cards: (slug: string) => string[]
  product: ProductId
  industry: (slug: string) => number | undefined
  category: (code: string) => number | undefined
  /** Cards that stay unpublished (`do-akceptacji-szefa`): never a service of a bundle. */
  hidden: ReadonlySet<string>
}

/** `seria` of the package → filter area of `/zestawy` (board `Web-Zestawy-1440`, 8 areas). */
export const SERIES_AREAS: Record<string, BundleArea> = {
  sklep: 'sklep',
  'sklep-spozywczy': 'sklep',
  'sklep-magazyn': 'sklep',
  'gastronomia-lada': 'gastronomia',
  restauracja: 'gastronomia',
  'bar-szybkiej-obslugi': 'gastronomia',
  noclegi: 'noclegi',
  biuro: 'biuro',
  'biuro-rachunkowe': 'biuro',
  kopie: 'biuro',
  gabinet: 'gabinet',
  szkola: 'szkola',
  'wifi-firma': 'siec',
  ekrany: 'ekrany',
}

const fail = (message: string): never => {
  throw new Error(`Seed (K3c zestawy): ${message}`)
}

/** K3-KATALOG §7: „Gotowe” only when no item waits for a confirmation. */
export function bundleStatus(bundle: Pick<K3Bundle, 'elementy'>): BundleData['contentStatus'] {
  return bundle.elementy.some((item) => item.do_potwierdzenia) ? 'needs-review' : 'ready'
}

/**
 * The status the import writes: it moves forward only — a bundle Krystian marked „Gotowe” in the
 * panel stays so, even when the package still lists an open question.
 */
export function nextBundleStatus(
  imported: BundleData['contentStatus'],
  stored: Bundle['contentStatus'] | undefined,
): BundleData['contentStatus'] {
  return stored === 'ready' ? 'ready' : imported
}

export function bundleData(
  bundle: K3Bundle,
  checks: readonly K3CompatCheck[],
  refs: BundleRefs,
): BundleData {
  const where = `bundle "${bundle.slug}"`
  const productOf = (slug: string) => {
    const [card] = refs.cards(slug)
    const id = card === undefined ? undefined : refs.product(card)
    return id ?? fail(`${where}: card "${slug}" has no record — import first.`)
  }
  const area = SERIES_AREAS[bundle.seria] ?? fail(`${where}: unknown series "${bundle.seria}".`)
  const notes = [
    ...(bundle.uwagi_wewnetrzne ?? []),
    ...(bundle.uslugi_po_akceptacji_szefa?.length
      ? [`Usługi po akceptacji szefa: ${bundle.uslugi_po_akceptacji_szefa.join(', ')}.`]
      : []),
  ]
  return {
    slug: bundle.slug,
    name: bundle.nazwa,
    order: bundle.kolejnosc,
    area,
    series: bundle.seria,
    level: bundle.poziom ?? null,
    contentStatus: bundleStatus(bundle),
    // `magazyn-produkcja` has no industry record (K3a): skipped, like on the cards.
    industries: [...new Set(bundle.branze.flatMap((slug) => refs.industry(slug) ?? []))],
    audience: bundle.dla_kogo,
    benefit: bundle.korzysc,
    description: bundle.opis.map((text) => ({ text })),
    items: bundle.elementy.map((item) => ({
      product: productOf(item.slug),
      role: item.rola,
      quantity: String(item.ilosc),
      mandatory: item.obowiazkowy,
      suggestedVersion: item.wariant_sugerowany ?? null,
      toConfirm: item.do_potwierdzenia ?? null,
    })),
    swaps: bundle.zamienniki.map((swap) => ({
      from: productOf(swap.zamiast),
      to: productOf(swap.mozna),
      when: swap.kiedy,
    })),
    // Services waiting for the boss stay out (K3-KATALOG §7).
    services: [
      ...new Set(
        bundle.uslugi
          .filter((slug) => !refs.cards(slug).some((card) => refs.hidden.has(card)))
          .map(productOf),
      ),
    ],
    reasons: bundle.dlaczego_tak,
    faq: bundle.faq.map(({ q, a }) => ({ question: q, answer: a })),
    related: (bundle.powiazane ?? []).map(
      (code) => refs.category(code) ?? fail(`${where}: unknown category "${code}".`),
    ),
    internalNotes: notes.length ? notes.join('\n') : null,
    compatChecks: checks
      .filter((check) => check.zestaw === bundle.slug)
      .map((check) => ({
        pair: check.para,
        source: check.zrodlo_w_karcie ?? null,
        status: check.status ?? null,
      })),
  }
}

/** Bundles of a scene of the floor plan (`plansze-k31.json` → `sceny[].zestawy`). */
export function sceneBundles(
  slugs: readonly string[] | undefined,
  bundle: (slug: string) => number | undefined,
  scene: string,
): number[] {
  return (slugs ?? []).map(
    (slug) => bundle(slug) ?? fail(`plan "${scene}": unknown bundle "${slug}".`),
  )
}

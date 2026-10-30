import type { Product } from '../../payload-types'
import type { K31Card } from './k31'

/**
 * K4 catalog `seed/prokombiznes/k4/katalog-k4.json` on top of K3 / K3.1 (K4-FINAL §4.2–4.3,
 * ADR-017 pkt 8 and 10). Pure functions: the content of a K4 card replaces the content of the
 * repo card, the K4-only fields (short name, kind, premiere, configurator help, labelled
 * sources, polecane, podobne) go to their own `Products` fields.
 */

// --- shape of the package (only the keys the import reads) ---

type K4Option = {
  nazwa: string
  wartosci: string[]
  uwaga?: string | null
  dl?: boolean
  pom?: string | null
}

export type K4Card = {
  slug_seed: string
  zmiana_k4: string
  status: string
  dzial: string
  kategoria: string
  podkategoria?: string | null
  marka: string
  rodzaj: string
  nazwa: string
  krotka: string
  podtytul?: string | null
  korzysc: string
  opis: string[]
  cechy: string[]
  parametry: { k: string; v: string }[]
  warianty_opis?: { model: string; roznica: string }[] | null
  faq: { q: string; a: string }[]
  konfigurator?: {
    opis?: string | null
    opcje: K4Option[]
    std?: { k: string; v: string }[] | null
    popularne?: { nazwa: string; konfiguracja: string }[] | null
  } | null
  polecane?: { slug: string; etykieta: string }[] | null
  podobne?: string[] | null
  branze: string[]
  zrodla?: { url: string; etykieta: string; host: string }[] | null
  wyrozniki: string[]
  w_skrocie_wzorzec: unknown
  nowosc: boolean
  seria?: string | null
}

const KINDS: Record<string, Product['kind']> = {
  Urządzenia: 'device',
  Oprogramowanie: 'software',
  Usługi: 'service',
}

/** K4 names industries (`slowniki-k4.json` → `branze`); the repo keeps the K3 slugs. */
const INDUSTRY_SLUGS: Record<string, string> = {
  Handel: 'handel',
  Gastronomia: 'gastronomia',
  Noclegi: 'noclegi',
  'Biura i usługi': 'biura-uslugi',
  'Zdrowie i uzdrowiska': 'zdrowie-uzdrowiska',
  'Szkoły i instytucje': 'szkoly-instytucje',
  'Magazyn i produkcja': 'magazyn-produkcja',
  Beauty: 'beauty',
}

function industrySlug(name: string, card: string): string {
  const slug = INDUSTRY_SLUGS[name]
  if (!slug) throw new Error(`Seed (K4): unknown industry "${name}" of "${card}".`)
  return slug
}

const text = (value: string | null | undefined) => (value?.trim() ? value.trim() : null)

// --- content of a repo card ---

/**
 * The public content of the K4 card wins (§4.3 pkt 1). The repo keeps what K4 does not carry:
 * keys (`legacyIds`, previous name), packages of the IT care card, the `dobierz` phrases (no
 * longer used — ADR-017 pkt 10), sources with their type (K4 has labels instead — `sources.links`)
 * and internal notes. Category and subcategory come from `k4CardPlacement`; the configurator
 * from `k4ProductFields` (the whole group, with the K4 help texts).
 */
export function withK4Content<T extends K31Card>(card: T, k4: K4Card | undefined): T {
  if (!k4) return card
  return {
    ...card,
    nazwa: k4.nazwa,
    podtytul: k4.podtytul ?? null,
    korzysc: k4.korzysc,
    opis: k4.opis,
    cechy: k4.cechy,
    parametry: k4.parametry,
    warianty_opis: k4.warianty_opis ?? null,
    faq: k4.faq,
    branze: k4.branze.map((name) => industrySlug(name, k4.slug_seed)),
    status: k4.status,
    marka: k4.marka,
    seria: k4.seria ?? card.seria ?? null,
  }
}

// --- K4-only fields ---

/**
 * Fields of `Products` only K4 fills. The configurator is the whole group: K4 adds the help
 * text (`pom`), long values (`dl`) and the fixed values (`std`) to the K3 options. Labelled
 * sources go to `sources.links` next to the typed K3 lists.
 */
export function k4ProductFields(card: K4Card, name: string) {
  const kind = KINDS[card.rodzaj]
  if (!kind) throw new Error(`Seed (K4): unknown kind "${card.rodzaj}" of "${card.slug_seed}".`)
  const configurator = card.konfigurator
  return {
    shortName: card.krotka === name ? null : text(card.krotka),
    kind,
    isNew: card.nowosc,
    configurator: {
      description: text(configurator?.opis),
      options: (configurator?.opcje ?? []).map((option) => ({
        name: option.nazwa,
        values: option.wartosci,
        note: text(option.uwaga),
        help: text(option.pom),
        longValues: option.dl ?? false,
      })),
      fixed: (configurator?.std ?? []).map((item) => ({ label: item.k, value: item.v })),
      popular: (configurator?.popularne ?? []).map((item) => ({
        name: item.nazwa,
        configuration: item.konfiguracja,
      })),
    },
    sourceLinks: (card.zrodla ?? []).map((item) => ({ label: item.etykieta, url: item.url })),
  }
}

/**
 * „Do tego zwykle dobierają” (`polecane` → `recommended`) and „Podobne” (`podobne` →
 * `alternatives`) as records. Set after all cards are saved, as they point at each other. A
 * slug without a record is left out and reported; the card never points at itself.
 */
export function k4Relations(card: K4Card, idOf: (slug: string) => number | undefined) {
  const unknown: string[] = []
  const resolve = (slug: string) => {
    const id = idOf(slug)
    if (id === undefined) unknown.push(slug)
    return id
  }
  const self = idOf(card.slug_seed)
  const recommended = (card.polecane ?? []).flatMap((item) => {
    const product = resolve(item.slug)
    return product === undefined ? [] : [{ product, label: item.etykieta }]
  })
  const alternatives = (card.podobne ?? []).flatMap((slug) => {
    const id = resolve(slug)
    return id === undefined || id === self ? [] : [id]
  })
  return { recommended, alternatives, unknown }
}

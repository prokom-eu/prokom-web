import path from 'path'

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
  /** Gallery of a new card (`media/produkty/…`); repo cards keep their K3 / K3.1 photos. */
  zdjecia?: string[] | null
  kolory?: { nazwa: string; hex: string; plik: string }[] | null
  /** A PRO-KOM service without a photo: the product page shows a service tile (K4e). */
  zdjecia_brak?: boolean
}

/** `mapa-slugow-k4.json`: K4 vs repo slugs (K4-FINAL §4.3 pkt 2–3). */
export type K4SlugMap = {
  niepodzielone: Record<string, { '301': string; nowe: string[] }>
  zmiana_slugu: Record<string, string>
  /** Repo card → new card slug or a page path (`/opieka-it`). */
  ukryj: Record<string, string>
}

/** `marki-k4.json` → `marki`: only the logo path, which carries the brand's address. */
type K4Brand = { logo?: string | null }

export const K4_MEDIA_DIR = path.join('seed', 'prokombiznes', 'k4', 'media')

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
    // Six Kobra links carry the file inside the archive after the address: „….zip (karta.pdf)”.
    sourceLinks: (card.zrodla ?? []).map((item) => ({
      label: item.etykieta,
      url: item.url.trim().split(/\s+/)[0] ?? '',
    })),
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

// --- new cards (162) ---

/**
 * Cards of the K4 package the repo does not have, in the K3 shape the import reads: content
 * from K4, no `dobierz` phrases, sources only as `sources.links`, no internal notes.
 */
export function k4NewCards(cards: K4Card[], repo: Pick<K31Card, 'slug_seed'>[]): K31Card[] {
  const known = new Set(repo.map((card) => card.slug_seed))
  return cards
    .filter((card) => !known.has(card.slug_seed))
    .map((card) =>
      withK4Content(
        {
          slug_seed: card.slug_seed,
          kategoria: card.kategoria,
          podkategoria: card.podkategoria ?? null,
          nazwa: '',
          korzysc: '',
          opis: [],
          cechy: [],
          parametry: [],
          faq: [],
          dobierz: [],
          branze: [],
          zrodla: [],
          status: '',
          uwagi: '',
          marka: '',
          seria: null,
        },
        card,
      ),
    )
}

// --- photos and colors ---

const PACKAGE_FILE = /^media\/(produkty|kolory)\/([^/]+\.webp)$/
const PHOTO_KEY = /^k4:(produkty|kolory)\/([^/]+\.webp)$/

function photoKey(file: string, card: string): string {
  const match = PACKAGE_FILE.exec(file)
  if (!match) throw new Error(`Seed (K4): photo "${file}" of "${card}" is not a package WebP.`)
  return `k4:${match[1]}/${match[2]}`
}

/** Image keys of a new card's gallery, in the package order (the first is the main one). */
export function k4ImageKeys(card: K4Card): string[] {
  return (card.zdjecia ?? []).map((file) => photoKey(file, card.slug_seed))
}

/** Image keys of the color photos of a card. */
export function k4ColorKeys(card: K4Card): string[] {
  return (card.kolory ?? []).map((item) => photoKey(item.plik, card.slug_seed))
}

/**
 * File of a K4 image key and the name it is uploaded under (`k4-` in front, like `k3-`, so it
 * never meets a file of an older package). `null` for keys of other packages.
 */
export function k4PhotoFile(key: string): { filePath: string; uploadName: string } | null {
  const match = PHOTO_KEY.exec(key)
  if (!match) return null
  return {
    filePath: path.join(K4_MEDIA_DIR, match[1]!, match[2]!),
    uploadName: `k4-${match[2]}`,
  }
}

/**
 * `Media` fields of a K4 photo: alt = card name + number, or + color name.
 * TODO(krystian): confirm the right to use producers' photos before production.
 */
export function k4PhotoMediaData(card: K4Card, key: string) {
  const position = k4ImageKeys(card).indexOf(key) + 1
  const color = (card.kolory ?? []).find((item) => photoKey(item.plik, card.slug_seed) === key)
  if (!position && !color) {
    throw new Error(`Seed (K4): photo "${key}" is not on "${card.slug_seed}".`)
  }
  return {
    alt: color ? `${card.nazwa} — kolor ${color.nazwa}` : `${card.nazwa} — zdjęcie ${position}`,
    source: 'paczka K4 (30.10.2026), prawo użycia do potwierdzenia',
    requiresConsent: false,
  }
}

/** `colors` of a product (K32 §9): name, swatch and the uploaded photo of each color. */
export function k4Colors(card: K4Card, image: (key: string) => number | undefined) {
  return (card.kolory ?? []).map((item) => {
    const id = image(photoKey(item.plik, card.slug_seed))
    if (id === undefined) {
      throw new Error(`Seed (K4): photo of color "${item.nazwa}" of "${card.slug_seed}" missing.`)
    }
    return { name: item.nazwa, hex: item.hex, image: id }
  })
}

// --- brands ---

/**
 * Minimal `Partners` record of a brand of a new card the repo lacks: name and the address the
 * package gives its logo (`media/marki/logo-<slug>.<ext>`). Logo, description and status — K4a-2.
 */
export function k4BrandRecord(name: string, brands: Record<string, K4Brand>) {
  const logo = brands[name]?.logo
  const slug = logo ? /logo-([a-z0-9-]+)\.[a-z]+$/.exec(logo)?.[1] : undefined
  if (!slug) throw new Error(`Seed (K4): brand "${name}" has no logo address in marki-k4.json.`)
  return { name, slug }
}

// --- slug map: hidden cards, 301, aliases ---

/**
 * 301 of the repo cards K4 hides (`ukryj`, §4.3 pkt 3): from the card's address to its new card
 * or to a page. `slugOf` gives the address of a stored card by its key.
 */
export function k4SlugRedirects(
  map: K4SlugMap,
  slugOf: (key: string) => string | undefined,
): { from: string; to: string }[] {
  const address = (key: string) => {
    const slug = slugOf(key)
    if (!slug) throw new Error(`Seed (K4): card "${key}" of mapa-slugow-k4.json has no record.`)
    return `/produkt/${slug}`
  }
  return Object.entries(map.ukryj).map(([old, target]) => ({
    from: address(old),
    to: target.startsWith('/') ? target : address(target),
  }))
}

/**
 * Hidden cards that live on as a new card: page seeds (K3 bundles, wizard, industries) that
 * name the old one get the new one until K4a-2 / K4g replace them.
 */
export function k4Aliases(map: K4SlugMap): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map.ukryj).filter(([, target]) => !target.startsWith('/')),
  )
}

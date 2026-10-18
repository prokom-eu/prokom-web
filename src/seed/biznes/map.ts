import type { Industry, Product } from '../../payload-types'
import { isIconName, type IconName } from '../../lib/catalog/options'
import { normalizeText } from '../../lib/catalog/normalize'

/**
 * Seed package `seed/prokombiznes/` (Polish keys of the design) → data of the Biznes catalog
 * collections (ADR-012 with rozstrzygnięcia). Pure functions: the import (`run.ts`) only
 * looks up ids and writes.
 */

// --- shapes of the package (only the keys the import reads) ---

export type SeedGroup = {
  slug: string
  nazwa: string
  ikona: string
  gradient: string[]
  kolejnosc: number
}
export type SeedCategory = {
  slug: string
  nazwa: string
  grupa: string
  opis?: string | null
  kolejnosc: number
}
export type SeedIndustry = { slug: string; nazwa: string; aktywna: boolean; kreator: string }
export type SeedBrand = { nazwa: string; slug: string }
export type SeedProduct = {
  slug: string
  nazwa: string
  marka: string
  kategoria: string
  rodzaj: string
  zdjecie?: string | null
  korzysc?: string | null
  cechy?: string[] | null
  branze?: string[] | null
  autoryzacja?: boolean | null
  nowosc?: boolean | null
  slowa_kluczowe?: string | null
  odznaka?: string | null
  popularnosc?: number | null
  parametry_kasy?: Record<string, string> | null
  typ_kasy?: string[] | null
  wyrozniony_na_glownej?: boolean | null
}
export type SeedCatalog = {
  grupy: SeedGroup[]
  kategorie: SeedCategory[]
  branze: SeedIndustry[]
  marki: SeedBrand[]
  produkty: SeedProduct[]
  kolejnosc_wyroznionych: string[]
}
export type SeedMediaFile = { plik: string; rola: string; klucz: string; wymagaZgody: boolean }
export type SeedSearch = {
  synonimy: Record<string, string[]>
  stop_slowa: string[]
  popularne: string[]
}

// --- addresses (ADR-012 §2.1 and rozstrzygnięcie 8) ---

export const GROUP_SLUGS: Record<string, string> = {
  sprz: 'sprzedaz',
  biuro: 'komputery-biuro',
  prog: 'oprogramowanie',
  bezp: 'bezpieczenstwo-siec',
  usl: 'serwis-uslugi',
}

export const CATEGORY_SLUGS: Record<string, string> = {
  kasy: 'kasy-fiskalne',
  druk: 'drukarki-fiskalne',
  pos: 'stanowiska-pos',
  mob: 'kasoterminale-mobilne',
  term: 'terminale-platnicze',
  kiosk: 'kioski-ekrany-kuchenne',
  akc: 'akcesoria-pos-wagi',
  komp: 'komputery-monitory',
  podpis: 'podpis-kwalifikowany',
  serwis: 'serwis-przeglady',
  vend: 'maszyny-vendingowe',
  serw: 'serwery-nas-ups',
  mfp: 'drukarki-wielofunkcyjne',
  av: 'ekrany-projektory',
  progs: 'programy-sprzedazowe-erp',
  progb: 'programy-branzowe',
  m365: 'microsoft-365-licencje',
  siec: 'siec-wifi',
  ochr: 'antywirus-firewall',
  it: 'opieka-it-wdrozenia',
  dof: 'dofinansowania',
}

export const INDUSTRY_SLUGS: Record<string, string> = {
  gastro: 'gastronomia',
  handel: 'handel',
  noclegi: 'noclegi',
  uslugi: 'biura-uslugi',
  szkoly: 'szkoly-instytucje',
  zdrowie: 'zdrowie-uzdrowiska',
  beauty: 'beauty',
}

const KINDS: Record<string, Product['kind']> = {
  urzadzenie: 'device',
  program: 'software',
  usluga: 'service',
}

const REGISTER_TYPES: Record<string, NonNullable<Product['registerTypes']>[number]> = {
  mob: 'mobile',
  mala: 'small',
  sys: 'system',
  dot: 'touch',
}

/** `parametry_kasy` keys (labels: `porownanie_kas_etykiety`) → `Products.comparison`. */
const COMPARISON_KEYS: Record<string, keyof NonNullable<Product['comparison']>> = {
  typ: 'type',
  ekr: 'display',
  kl: 'keyboard',
  plu: 'plu',
  dr: 'printer',
  lacz: 'connectivity',
  waga: 'weight',
  dla: 'audience',
}

function mapped<T>(table: Record<string, T>, key: string, what: string): T {
  const value = table[key]
  if (value === undefined) throw new Error(`Seed: unknown ${what} "${key}".`)
  return value
}

/** Product address from its name (ADR-012 §2.1: `Posnet Ergo Online` → `posnet-ergo-online`). */
export function slugFromName(name: string): string {
  return normalizeText(name)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** A text the package leaves empty is no value at all (rozstrzygnięcie 7: `opis` of vending). */
const text = (value: string | null | undefined) => (value?.trim() ? value.trim() : undefined)

// --- records ---

export function groupData(group: SeedGroup) {
  const [gradientFrom, gradientTo] = group.gradient
  if (!isIconName(group.ikona) || !gradientFrom || !gradientTo) {
    throw new Error(`Seed: invalid group "${group.slug}".`)
  }
  return {
    name: group.nazwa,
    slug: mapped(GROUP_SLUGS, group.slug, 'group'),
    icon: group.ikona,
    gradientFrom,
    gradientTo,
    order: group.kolejnosc,
  }
}

export function categoryData(
  category: SeedCategory,
  groupId: number,
  icons: Record<string, string>,
) {
  const icon = icons[category.slug]
  return {
    name: category.nazwa,
    slug: mapped(CATEGORY_SLUGS, category.slug, 'category'),
    group: groupId,
    // No icon in the package (vending) → none; the menu falls back to the group's icon.
    ...(isIconName(icon) && { icon: icon satisfies IconName }),
    ...(text(category.opis) && { description: text(category.opis) }),
    order: category.kolejnosc,
  }
}

export function industryData(industry: SeedIndustry, order: number) {
  return {
    name: industry.nazwa,
    slug: mapped(INDUSTRY_SLUGS, industry.slug, 'industry'),
    active: industry.aktywna,
    // Checked against the select options by Payload on create.
    wizardBusinessType: industry.kreator as NonNullable<Industry['wizardBusinessType']>,
    order,
  }
}

/** Ids of records the product points to, found by the import. */
export type ProductRefs = {
  brand: (name: string) => number | undefined
  category: (seedSlug: string) => number | undefined
  industry: (seedSlug: string) => number | undefined
  image: (file: string) => number | undefined
}

function ref(lookup: (key: string) => number | undefined, key: string, what: string): number {
  const id = lookup(key)
  if (id === undefined) throw new Error(`Seed: ${what} "${key}" was not imported.`)
  return id
}

/**
 * Image files of a product: its `zdjecie`, then other product files of the package keyed by
 * the product's short id (e.g. the scale `waga`, the second Stormshield photo).
 */
export function productImageFiles(product: SeedProduct, files: SeedMediaFile[]): string[] {
  const keyed = files
    .filter((file) => file.rola === 'produkt' && file.klucz === product.slug)
    .map((file) => file.plik)
  return [...new Set([...(product.zdjecie ? [product.zdjecie] : []), ...keyed])]
}

export function productData(
  product: SeedProduct,
  catalog: Pick<SeedCatalog, 'kolejnosc_wyroznionych'>,
  files: SeedMediaFile[],
  refs: ProductRefs,
) {
  const comparison = product.parametry_kasy
    ? Object.fromEntries(
        Object.entries(product.parametry_kasy).map(([key, value]) => [
          mapped(COMPARISON_KEYS, key, 'register parameter'),
          value,
        ]),
      )
    : undefined
  const featuredIndex = catalog.kolejnosc_wyroznionych.indexOf(product.slug)
  const featured = Boolean(product.wyrozniony_na_glownej)
  const images = productImageFiles(product, files).map((file) => ref(refs.image, file, 'image'))
  return {
    name: product.nazwa,
    slug: slugFromName(product.nazwa),
    legacyId: product.slug,
    kind: mapped(KINDS, product.rodzaj, 'product kind'),
    brand: ref(refs.brand, product.marka, 'brand'),
    categories: [ref(refs.category, product.kategoria, 'category')],
    industries: (product.branze ?? []).map((slug) => ref(refs.industry, slug, 'industry')),
    ...(text(product.korzysc) && { benefit: text(product.korzysc) }),
    features: product.cechy ?? [],
    ...(text(product.odznaka) && { badge: text(product.odznaka) }),
    ...(text(product.slowa_kluczowe) && { keywords: text(product.slowa_kluczowe) }),
    ...(images.length > 0 && { images }),
    isNew: Boolean(product.nowosc),
    authorized: Boolean(product.autoryzacja),
    popularity: product.popularnosc ?? 50,
    registerTypes: (product.typ_kasy ?? []).map((type) =>
      mapped(REGISTER_TYPES, type, 'register type'),
    ),
    ...(comparison && { comparison }),
    featured,
    ...(featured && featuredIndex >= 0 && { featuredOrder: featuredIndex }),
  }
}

// --- media ---

/** Files of the package that are not images of the site. */
export function skipMediaFile(file: SeedMediaFile): string | null {
  // spec. §7: the PRO-KOM sign comes from `public/brand/`; `Media` takes no SVG anyway.
  if (file.plik.endsWith('.svg')) return 'znak PRO-KOM — tylko podgląd z wizualizacji'
  if (file.rola === 'logo marki') return 'logo marki — wgrywane do Partnerów'
  return null
}

/**
 * Whether a stored file name is the package file: the same name, or the same with the `-N`
 * suffix Payload adds when the name is taken (on disk or by another record).
 */
export function isImportedFileName(stored: string | null | undefined, file: string): boolean {
  if (!stored) return false
  if (stored === file) return true
  const dot = file.lastIndexOf('.')
  const name = dot > 0 ? file.slice(0, dot) : file
  const ext = dot > 0 ? file.slice(dot) : ''
  if (!stored.startsWith(`${name}-`) || !stored.endsWith(ext)) return false
  const suffix = stored.slice(name.length + 1, stored.length - ext.length)
  return /^\d+$/.test(suffix)
}

/** Alt texts of the files no product names (checked by looking at each picture). */
const ALT_BY_FILE: Record<string, string> = {
  'ekran-subiekt-nexo-zlecenie.webp': 'Subiekt nexo — okno zlecenia z listą asortymentu',
  'ekran-subiekt-nexo-faktura.webp': 'Subiekt 123 — wystawianie faktury',
  'foto-gopos-lokal.webp': 'Tablet z systemem GoPOS, kasoterminal Sunmi V3 i drukarka',
  'p-gopos-ekosystem.webp':
    'Ekosystem GoPOS: kiosk samoobsługowy, POS, telefon, aplikacja zamówień i panel',
  'p-gopos-ekrany.webp': 'Dwa terminale POS z programem GoPOS',
  'p-gopos-ekran.webp': 'Terminal POS z ekranem sprzedaży GoPOS',
  'p-ubiquiti-unifi.webp': 'Ubiquiti UniFi',
  'p-projektor.webp': 'Projektor',
  'p-sunmi-all-in-one.webp': 'Sunmi — komputer POS all-in-one',
}

/**
 * `Media` fields of a package file. `alt`: the product's name, the client's name or a text
 * written for the file. `source` keeps the rights question visible in the panel.
 * TODO(krystian): confirm the right to use producers' photos (partner materials) and fill
 * `source` with the real origin before production (plan B, §5 pkt 6).
 */
export function mediaData(file: SeedMediaFile, products: SeedProduct[]) {
  const product =
    file.rola === 'produkt'
      ? products.find((item) => productImageFiles(item, [file]).includes(file.plik))
      : undefined
  const alt =
    ALT_BY_FILE[file.plik] ??
    (product?.nazwa || (file.rola.startsWith('logo klienta') ? `Logo: ${file.klucz}` : undefined))
  if (!alt) throw new Error(`Seed: no alt text for "${file.plik}".`)
  return {
    alt,
    source: `${file.rola} — plik z wizualizacji (17.10.2026), prawo użycia do potwierdzenia`,
    requiresConsent: file.wymagaZgody,
  }
}

// --- settings ---

export function searchData(search: SeedSearch) {
  return {
    synonyms: Object.entries(search.synonimy).map(([phrase, expansions]) => ({
      phrase,
      expansions,
    })),
    stopWords: search.stop_slowa,
    popular: search.popularne,
  }
}

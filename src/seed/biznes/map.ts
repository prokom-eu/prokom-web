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
export type SeedBrand = { nazwa: string; slug: string; logo?: string | null }
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
  // katalog v2 (ZMIANY-katalog-v2 §2)
  podkategoria?: string | null
  galeria?: string[] | null
  warianty?: string[] | null
  zrodla?: {
    strona_producenta?: string[] | null
    karty_pdf?: string[] | null
    sprawdzono?: string | null
  } | null
  partia?: number | null
  status_tresci?: string | null
  id_z_arkusza?: string[] | null
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
/** `seed/prokombiznes/media-produkty-v2.json`: product galleries of katalog v2. */
export type SeedGalleryFile = { plik: string; rola: string; produkt: string; zrodlo: string }
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
  akc: 'akcesoria-pos',
  wagi: 'wagi-sklepowe',
  kody: 'skanery-kolektory-etykiety',
  // K4 (D-K4-2): "Komputery i monitory" split into five categories.
  laptopy: 'laptopy',
  komputery: 'komputery',
  monitory: 'monitory',
  tablety: 'tablety',
  telefony: 'telefony',
  'akcesoria-biuro': 'klawiatury-myszy-sluchawki',
  niszczarki: 'niszczarki',
  podpis: 'podpis-kwalifikowany',
  serwis: 'serwis-przeglady',
  vend: 'automaty-vendingowe',
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

/** Addresses of K3 categories K4 retired (301 in `k4CategoryRedirects`). */
export const RETIRED_CATEGORY_SLUGS: Record<string, string> = { komp: 'komputery-monitory' }

/** K4 category that takes the links of a retired K3 one (removed cards → their category). */
export const CATEGORY_SUCCESSORS: Record<string, string> = { komp: 'laptopy' }

/**
 * Addresses a category had before katalog v2 (22.10.2026), so the import finds it in a local
 * database seeded earlier and renames it instead of adding a second one.
 */
export const PREVIOUS_CATEGORY_SLUGS: Record<string, string[]> = {
  'akcesoria-pos': ['akcesoria-pos-wagi'],
  'automaty-vendingowe': ['maszyny-vendingowe'],
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

const CONTENT_STATUSES: Record<string, Product['contentStatus']> = {
  gotowe: 'ready',
  'do-sprawdzenia': 'needs-review',
}

const BATCHES: Record<string, NonNullable<Product['batch']>> = { 0: '0', 1: '1', 2: '2' }

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
 * Image files of a product. Katalog v2: its `galeria` (`produkty/<slug>/…`, the first is the
 * card photo). A product without a gallery (services) keeps the design files: its `zdjecie`,
 * then other product files keyed by the short id (e.g. the second Stormshield photo).
 */
export function productImageFiles(
  product: SeedProduct,
  files: SeedMediaFile[],
  galleryLimit: number | null = null,
): string[] {
  if (product.galeria?.length)
    return [...new Set(product.galeria)].slice(0, galleryLimit ?? undefined)
  return designImageFiles(product, files)
}

/** Gallery photos the seed imports: every one, or the first `limit` of each product (CI). */
export function galleryFilesToImport(
  products: Pick<SeedProduct, 'galeria'>[],
  galleryFiles: { plik: string }[],
  limit: number | null,
): Set<string> {
  if (limit === null) return new Set(galleryFiles.map((file) => file.plik))
  return new Set(products.flatMap((product) => [...new Set(product.galeria ?? [])].slice(0, limit)))
}

/** Files of the design package (`media.json`) that belong to a product. */
function designImageFiles(product: SeedProduct, files: SeedMediaFile[]): string[] {
  const keyed = files
    .filter((file) => file.rola === 'produkt' && file.klucz === product.slug)
    .map((file) => file.plik)
  return [...new Set([...(product.zdjecie ? [product.zdjecie] : []), ...keyed])]
}

/**
 * Fields of katalog v2 that K3 does not have (kind, badge, keywords, flags, register data). Since
 * K3 they belong to the panel: the K3 import (`k3.ts`) writes them only when it creates a card.
 */
export function productPanelFields(product: SeedProduct) {
  // Every key, empty ones as null: an update clears parameters the package dropped.
  const comparison = Object.fromEntries([
    ...Object.values(COMPARISON_KEYS).map((key) => [key, null] as const),
    ...Object.entries(product.parametry_kasy ?? {}).map(
      ([key, value]) => [mapped(COMPARISON_KEYS, key, 'register parameter'), value] as const,
    ),
  ])
  return {
    kind: mapped(KINDS, product.rodzaj, 'product kind'),
    badge: text(product.odznaka) ?? null,
    keywords: text(product.slowa_kluczowe) ?? null,
    batch: product.partia == null ? null : mapped(BATCHES, String(product.partia), 'batch'),
    isNew: Boolean(product.nowosc),
    authorized: Boolean(product.autoryzacja),
    popularity: product.popularnosc ?? 50,
    registerTypes: (product.typ_kasy ?? []).map((type) =>
      mapped(REGISTER_TYPES, type, 'register type'),
    ),
    comparison,
  }
}

export function productData(
  product: SeedProduct,
  catalog: Pick<SeedCatalog, 'kolejnosc_wyroznionych'>,
  files: SeedMediaFile[],
  refs: ProductRefs,
  galleryLimit: number | null = null,
) {
  const featuredIndex = catalog.kolejnosc_wyroznionych.indexOf(product.slug)
  const featured = Boolean(product.wyrozniony_na_glownej)
  const images = productImageFiles(product, files, galleryLimit).map((file) =>
    ref(refs.image, file, 'image'),
  )
  const sources = product.zrodla
  // Seed-owned fields are always written (null = none), so an update clears what the package
  // dropped. Panel-only fields (description, specs, hotspots, FAQ…) are not in this object.
  return {
    name: product.nazwa,
    slug: slugFromName(product.nazwa),
    legacyIds: productLegacyIds(product),
    brand: ref(refs.brand, product.marka, 'brand'),
    categories: [ref(refs.category, product.kategoria, 'category')],
    subcategory: text(product.podkategoria) ?? null,
    industries: (product.branze ?? []).map((slug) => ref(refs.industry, slug, 'industry')),
    benefit: text(product.korzysc) ?? null,
    features: product.cechy ?? [],
    images,
    // Katalog v2 gives model names only; the difference comes with K3 (K3a-2).
    variants: [...new Set(product.warianty ?? [])].map((name) => ({ name })),
    sources: {
      productPages: [...new Set(sources?.strona_producenta ?? [])],
      datasheets: [...new Set(sources?.karty_pdf ?? [])],
      checkedAt: seedDate(sources?.sprawdzono),
    },
    contentStatus: product.status_tresci
      ? mapped(CONTENT_STATUSES, product.status_tresci, 'content status')
      : 'ready',
    ...productPanelFields(product),
    featured,
    featuredOrder: featured && featuredIndex >= 0 ? featuredIndex : null,
  }
}

/** A date of the package (`2026-10-23`) as Payload returns it, so a re-run sees no change. */
export function seedDate(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) throw new Error(`Seed: invalid date "${value}".`)
  return date.toISOString()
}

/**
 * Data to update an existing product with. Fields a person sets after checking the content
 * (`contentStatus`, `sources.checkedAt`) only move forward from the package — „Gotowe” or a
 * check date replace the stored value, while „Do sprawdzenia” or no date never undo what
 * was set in the panel. Everything else comes from the package.
 */
export function productUpdateData<
  T extends { contentStatus: Product['contentStatus']; sources: { checkedAt: string | null } },
>(data: T, stored: Pick<Product, 'contentStatus' | 'sources'>): T {
  return {
    ...data,
    contentStatus: data.contentStatus === 'ready' ? 'ready' : stored.contentStatus,
    sources: {
      ...data.sources,
      checkedAt: data.sources.checkedAt ?? stored.sources?.checkedAt ?? null,
    },
  }
}

/** Keys the import finds a product by: the seed short id, then the ids of the source sheet. */
export function productLegacyIds(product: SeedProduct): string[] {
  return [...new Set([product.slug, ...(product.id_z_arkusza ?? [])])]
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
  // Card photos of v20 replaced by katalog v2 galleries (still used by the home page and menu).
  'p-stormshield-urzadzenie.webp': 'Firewall Stormshield',
  'p-dell-poweredge-rack.webp': 'Serwer Dell PowerEdge (rack)',
  'p-dell-poweredge-tower.webp': 'Serwer Dell PowerEdge (wieża)',
  'p-lenovo-laptop.webp': 'Lenovo ThinkBook 14 Gen 6',
  'p-gopos-zestaw.webp': 'Zestaw GoPOS',
  'p-fawag-box.webp': 'Fawag Box Online',
  'p-sunmi-drukarka-bonow.webp': 'Drukarka bonów Sunmi NT311',
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
      ? products.find((item) => designImageFiles(item, [file]).includes(file.plik))
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

/** File name Payload stores for a gallery file (`produkty/jota/jota-01.webp` → `jota-01.webp`). */
export function galleryFileName(file: string): string {
  return file.slice(file.lastIndexOf('/') + 1)
}

/**
 * `Media` fields of a katalog v2 gallery file: `alt` = product name (with the photo number
 * after the first), `source` = where the file came from (`zrodlo`).
 * TODO(krystian): confirm the right to use producers' photos before production.
 */
export function galleryMediaData(file: SeedGalleryFile, products: SeedProduct[]) {
  const product = products.find((item) => item.slug === file.produkt)
  if (!product) throw new Error(`Seed: gallery file "${file.plik}" of unknown product.`)
  const position = (product.galeria ?? []).indexOf(file.plik) + 1
  return {
    alt: position > 1 ? `${product.nazwa} — zdjęcie ${position}` : product.nazwa,
    source: `${file.zrodlo} — katalog v2 (22.10.2026), prawo użycia do potwierdzenia`,
    requiresConsent: false,
  }
}

/**
 * Logo file of a brand: from the design package (`media.json`, role `logo marki`), otherwise
 * the katalog v2 file in `seed/prokombiznes/media/`. No SVG — `Partners` takes only bitmaps,
 * so such a brand shows its name as text.
 */
export function brandLogoFile(
  brand: SeedBrand,
  designFiles: SeedMediaFile[],
): { from: 'design' | 'seed'; file: string } | null {
  const design = designFiles.find(
    (file) => file.rola === 'logo marki' && file.klucz === brand.nazwa,
  )
  if (design) return { from: 'design', file: design.plik }
  if (brand.logo && !brand.logo.endsWith('.svg')) return { from: 'seed', file: brand.logo }
  return null
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

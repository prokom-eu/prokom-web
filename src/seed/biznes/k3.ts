import path from 'path'

import type { Partner, Product } from '../../payload-types'
import { forbiddenContent } from '../../lib/catalog/contentRules'
import { p, richText } from './lexical'
import {
  CATEGORY_SLUGS,
  categoryData,
  productImageFiles,
  productLegacyIds,
  productPanelFields,
  seedDate,
  slugFromName,
  type SeedCategory,
  type SeedGroup,
  type SeedMediaFile,
  type SeedProduct,
} from './map'

/**
 * K3 package `seed/prokombiznes/k3/` → Biznes catalog (K3-KATALOG §2–4, ADR-012 rozstrz.
 * 15–17). Pure functions: the import (`run.ts`) looks up ids and writes. Katalog v2
 * (`katalog.json`) stays the source of what K3 does not have: product addresses, panel fields
 * of a new record and galleries of cards without K3 photos.
 */

/** Product galleries of the package, relative to the repo root. */
export const K3_MEDIA_DIR = path.join('seed', 'prokombiznes', 'k3', 'media')

// --- shapes of the package (only the keys the import reads) ---

export type K3Source = { url: string; typ: string; sprawdzono?: string | null }
export type K3Card = {
  slug_seed: string
  legacyIds?: string[] | null
  nazwa_poprzednia?: string | null
  kategoria: string
  podkategoria?: string | null
  nazwa: string
  podtytul?: string | null
  korzysc: string
  opis: string[]
  cechy: string[]
  parametry: { k: string; v: string }[]
  warianty_opis?: { model: string; roznica: string }[] | null
  konfigurator?: {
    opis?: string | null
    opcje: { nazwa: string; wartosci: string[]; uwaga?: string | null }[]
    popularne?: { nazwa: string; konfiguracja: string }[] | null
  } | null
  faq?: { q: string; a: string }[] | null
  pakiety?:
    | {
        nazwa: string
        dla_kogo?: string | null
        w_abonamencie?: string[] | null
        poza_abonamentem?: string[] | null
        zasady?: string[] | null
      }[]
    | null
  dobierz: string[]
  branze: string[]
  zrodla: K3Source[]
  status: string
  uwagi: string
  marka?: string
}
/** `usuniete.json`: only what the import needs to find the record and its category. */
export type K3RemovedCard = Pick<
  K3Card,
  'slug_seed' | 'legacyIds' | 'nazwa_poprzednia' | 'kategoria'
>
export type K3Category = SeedCategory & {
  podkategorie?: { slug?: string | null; nazwa: string }[] | null
}
export type K3Brand = {
  marka: string
  slug: string
  kraj_pochodzenia?: string | null
  opis_krotki?: string | null
  opis?: string[] | null
  fakty?: { k: string; v: string; zrodlo?: string | null }[] | null
  linie_produktow?: string[] | null
  strona_producenta?: string | null
  zrodla?: { url: string }[] | null
  strona_marki: boolean
}
export type K3Dictionaries = {
  grupy: SeedGroup[]
  kategorie: K3Category[]
  marki: K3Brand[]
  marki_usuniete: string[]
  kolejnosc_wyroznionych: string[]
}
/** `media-k3.json` → `zdjecia`: photos of a card (in order) and the domains they came from. */
export type K3Gallery = Record<string, { pliki: string[]; zrodlo_domeny: string[] }>

// --- rules of the import ---

/** Categories whose subcategories have their own address (ADR-012 rozstrz. 14). */
const SUBCATEGORY_PAGES = new Set(['komp', 'serw', 'av'])

/** K3 industries without a record and a page (K3-KATALOG §3: "nieaktywna, bez strony"). */
export const SKIPPED_INDUSTRIES = new Set(['magazyn-produkcja'])

/** Kind of a new card from the group of its category (katalog v2 has it per product). */
const KIND_BY_GROUP: Record<string, Product['kind']> = { usl: 'service', prog: 'software' }

const CONTENT_STATUSES: Record<string, Product['contentStatus']> = {
  gotowe: 'ready',
  'do-sprawdzenia': 'needs-review',
  // Not published until the boss accepts it (ADR-012 rozstrz. 15) — no value of its own.
  'do-akceptacji-szefa': 'needs-review',
}

export type ReplacementTarget = { product: string } | { category: string }

/**
 * Katalog v2 products replaced by K3 families (K3-KATALOG §4 pkt 2 and §8), by short id.
 * `nec` is `proj` of the floor plans; `srvr` and `mslic` have no pair in the package — their
 * successors are Krystian's decision of 26.10.2026.
 */
export const REPLACED_PRODUCTS: Record<string, ReplacementTarget> = {
  tb: { product: 'lenovo-thinkbook-14-g8-g9' },
  mon: { product: 'lenovo-thinkvision-p-24-27' },
  aio: { product: 'lenovo-thinkcentre-neo-50a-55a' },
  m365: { product: 'microsoft-365-business' },
  tc: { product: 'lenovo-thinkcentre-neo-50s-55s' },
  mfp: { product: 'konica-minolta-bizhub-c301i' },
  nas: { product: 'synology-diskstation-plus-2-4' },
  ds: { product: 'samsung-qbc' },
  srvt: { product: 'dell-poweredge-t160-t360' },
  ups: { product: 'apc-smart-ups-wieza' },
  nec: { product: 'sharp-nec-projektory-sala' },
  kyo: { product: 'kyocera-ecosys-ma4000x-fx-wifx' },
  dell: { product: 'dell-pro-essential-14-15' },
  qnap: { product: 'qnap-nas-2-4' },
  ubnt: { product: 'u7' },
  srvr: { product: 'dell-poweredge-r360' },
  mslic: { category: 'm365' },
}

function mapped<T>(table: Record<string, T>, key: string, what: string): T {
  const value = table[key]
  if (value === undefined) throw new Error(`Seed (K3): unknown ${what} "${key}".`)
  return value
}

function ref(lookup: (key: string) => number | undefined, key: string, what: string): number {
  const id = lookup(key)
  if (id === undefined) throw new Error(`Seed (K3): ${what} "${key}" was not imported.`)
  return id
}

const text = (value: string | null | undefined) => (value?.trim() ? value.trim() : null)
const unique = <T>(values: T[]) => [...new Set(values)]

// --- matching (K3-KATALOG §4 pkt 1) ---

type Matchable = Pick<K3Card, 'slug_seed' | 'legacyIds' | 'nazwa_poprzednia'>

function candidates(card: Matchable, products: SeedProduct[]): SeedProduct[] {
  const ids = new Set(card.legacyIds ?? [])
  const byId = products.filter((product) => productLegacyIds(product).some((id) => ids.has(id)))
  if (byId.length) return byId
  // `slug_seed` equal to a sheet id of a record (`mfp` ← konica-minolta-bizhub-c301i): the
  // import looks the record up by it anyway, so it is a pair.
  const bySeed = products.filter((product) => productLegacyIds(product).includes(card.slug_seed))
  if (bySeed.length) return bySeed
  const bySlug = products.filter((product) => slugFromName(product.nazwa) === card.slug_seed)
  if (bySlug.length) return bySlug
  return products.filter((product) => card.nazwa_poprzednia === product.nazwa)
}

/**
 * Katalog v2 product of each card (by `slug_seed`): `legacyIds`, then the address, then the
 * previous name. A product claimed by several cards (`xl2` ← XL2, XL2 A, XL2 B) goes to the
 * card with its short id; the others are new cards.
 */
export function matchCards(cards: Matchable[], products: SeedProduct[]): Map<string, SeedProduct> {
  const claims = new Map<string, Matchable[]>()
  const found = new Map<string, SeedProduct>()
  for (const card of cards) {
    const matched = candidates(card, products)
    if (matched.length > 1) {
      throw new Error(`Seed (K3): card "${card.slug_seed}" matches ${matched.length} products.`)
    }
    const [product] = matched
    if (!product) continue
    found.set(card.slug_seed, product)
    claims.set(product.slug, [...(claims.get(product.slug) ?? []), card])
  }
  for (const [shortId, claimants] of claims) {
    if (claimants.length < 2) continue
    const owner = claimants.find((card) => card.slug_seed === shortId)
    if (!owner) throw new Error(`Seed (K3): product "${shortId}" is claimed by several cards.`)
    const others = claimants.filter((card) => card !== owner)
    for (const card of others) found.delete(card.slug_seed)
    // Sheet ids of the other cards are theirs: the owner's record gives them up.
    const theirs = new Set(others.flatMap((card) => card.legacyIds ?? []))
    const product = found.get(owner.slug_seed)!
    found.set(owner.slug_seed, {
      ...product,
      id_z_arkusza: (product.id_z_arkusza ?? []).filter((id) => !theirs.has(id)),
    })
  }
  return found
}

// --- products ---

/** Ids of records a card points to, found by the import. */
export type K3Refs = {
  brand: (name: string) => number | undefined
  category: (code: string) => number | undefined
  industry: (slug: string) => number | undefined
  image: (key: string) => number | undefined
}

/** Address: a katalog v2 product keeps its own (§4 pkt 2), a new or replaced one takes `slug_seed`. */
function productSlug(card: K3Card, v2: SeedProduct | undefined): string {
  return v2 && !REPLACED_PRODUCTS[v2.slug] ? slugFromName(v2.nazwa) : card.slug_seed
}

/** Name of the card's subcategory from its category's list (K3 gives an address in `komp`…). */
export function k3SubcategoryName(
  card: K3Card,
  dictionaries: Pick<K3Dictionaries, 'kategorie'>,
): string | null {
  const value = text(card.podkategoria)
  if (!value) return null
  const category = dictionaries.kategorie.find((item) => item.slug === card.kategoria)
  const row = category?.podkategorie?.find((item) => item.slug === value || item.nazwa === value)
  if (!row) throw new Error(`Seed (K3): subcategory "${value}" not in "${card.kategoria}".`)
  return row.nazwa
}

const SOURCE_FIELDS: Record<string, 'productPages' | 'datasheets' | 'distributorPages'> = {
  producent: 'productPages',
  przepisy: 'productPages',
  ministerstwo: 'productPages',
  'karta-pdf': 'datasheets',
  // Shops and distributors: kept for the panel, never shown (ADR-012 rozstrz. 15).
  dystrybutor: 'distributorPages',
}

function sourcesData(sources: K3Source[]) {
  const links = (field: string) =>
    unique(
      sources
        .filter((item) => mapped(SOURCE_FIELDS, item.typ, 'source type') === field)
        .map((item) => item.url),
    )
  const dates = sources.map((item) => item.sprawdzono).filter((date): date is string => !!date)
  return {
    productPages: links('productPages'),
    datasheets: links('datasheets'),
    distributorPages: links('distributorPages'),
    checkedAt: seedDate(dates.sort().at(-1)),
  }
}

/**
 * Fields K3 owns (§4 pkt 4): every key is written, empty ones as null or [], so an update
 * clears what the package dropped. `uwagi` goes to `internalNotes` — panel only.
 */
export function k3ProductData(
  card: K3Card,
  v2: SeedProduct | undefined,
  dictionaries: Pick<K3Dictionaries, 'kategorie' | 'kolejnosc_wyroznionych'>,
  refs: K3Refs,
  imageKeys: string[],
) {
  const featuredOrder = dictionaries.kolejnosc_wyroznionych.indexOf(card.slug_seed)
  const configurator = card.konfigurator
  return {
    name: card.nazwa,
    slug: productSlug(card, v2),
    legacyIds: unique([
      card.slug_seed,
      ...(card.legacyIds ?? []),
      ...(v2 ? productLegacyIds(v2) : []),
    ]),
    subtitle: text(card.podtytul),
    brand: ref(refs.brand, card.marka ?? '', 'brand'),
    categories: [ref(refs.category, card.kategoria, 'category')],
    subcategory: k3SubcategoryName(card, dictionaries),
    industries: card.branze
      .filter((slug) => !SKIPPED_INDUSTRIES.has(slug))
      .map((slug) => ref(refs.industry, slug, 'industry')),
    benefit: text(card.korzysc),
    features: card.cechy,
    description: richText<NonNullable<Product['description']>>(
      card.opis.map((paragraph) => p(paragraph)),
    ),
    specs: card.parametry.map((item) => ({ label: item.k, value: item.v })),
    variants: (card.warianty_opis ?? []).map((item) => ({
      name: item.model,
      difference: item.roznica,
    })),
    configurator: {
      description: text(configurator?.opis),
      options: (configurator?.opcje ?? []).map((option) => ({
        name: option.nazwa,
        values: option.wartosci,
        note: text(option.uwaga),
      })),
      popular: (configurator?.popularne ?? []).map((item) => ({
        name: item.nazwa,
        configuration: item.konfiguracja,
      })),
    },
    faq: (card.faq ?? []).map((item) => ({ question: item.q, answer: item.a })),
    packages: (card.pakiety ?? []).map((item) => ({
      name: item.nazwa,
      audience: text(item.dla_kogo),
      inSubscription: item.w_abonamencie ?? [],
      outsideSubscription: item.poza_abonamentem ?? [],
      rules: item.zasady ?? [],
    })),
    suggestions: card.dobierz,
    sources: sourcesData(card.zrodla),
    internalNotes: text(card.uwagi),
    contentStatus: mapped(CONTENT_STATUSES, card.status, 'content status'),
    images: imageKeys.map((key) => ref(refs.image, key, 'image')),
    featured: featuredOrder >= 0,
    featuredOrder: featuredOrder >= 0 ? featuredOrder : null,
  }
}

/** A card waiting for the boss stays a draft (§1: not published, its address answers 404). */
export function k3PublishStatus(card: Pick<K3Card, 'status'>): 'draft' | 'published' {
  return card.status === 'do-akceptacji-szefa' ? 'draft' : 'published'
}

/** A badge may stay only when it has no price (K3-KATALOG §10: katalog v2 had two). */
export function allowedBadge(badge: string | null | undefined): string | null {
  return badge && forbiddenContent(badge).length === 0 ? badge : null
}

/**
 * Panel fields of a new record (§4 pkt 4): from its katalog v2 product, otherwise defaults with
 * the kind from the group of the category.
 */
export function k3CreateFields(
  card: K3Card,
  v2: SeedProduct | undefined,
  dictionaries: Pick<K3Dictionaries, 'kategorie'>,
) {
  if (v2) {
    const fields = productPanelFields(v2)
    return { ...fields, badge: allowedBadge(fields.badge) }
  }
  const group = dictionaries.kategorie.find((item) => item.slug === card.kategoria)?.grupa ?? ''
  return {
    ...productPanelFields({
      slug: card.slug_seed,
      nazwa: card.nazwa,
      marka: card.marka ?? '',
      kategoria: card.kategoria,
      rodzaj: 'urzadzenie',
    }),
    kind: KIND_BY_GROUP[group] ?? 'device',
  }
}

// --- hidden cards and redirects (§4 pkt 2–3, ADR-012 rozstrz. 17) ---

export type RetiredProduct = {
  /** Keys of the katalog v2 record. */
  legacyIds: string[]
  from: string
  to: string
  /** False for a record that lives on as its K3 family (moved, not hidden). */
  unpublish: boolean
  reason: 'usunięta' | 'zastąpiona'
}

/** 301 rules and records to hide: removed cards → their category, replaced ones → successor. */
export function k3Retired(
  cards: K3Card[],
  removed: K3RemovedCard[],
  products: SeedProduct[],
): RetiredProduct[] {
  const live = matchCards(cards, products)
  const kept = new Set([...live.values()].map((product) => product.slug))
  const retired: RetiredProduct[] = []
  for (const [slug, product] of matchCards(removed, products)) {
    // Hiding it would hide a live card too: the package contradicts itself.
    if (kept.has(product.slug)) {
      throw new Error(`Seed (K3): removed card "${slug}" is the product of a live card.`)
    }
    const card = removed.find((item) => item.slug_seed === slug)!
    retired.push({
      legacyIds: productLegacyIds(product),
      from: `/produkt/${slugFromName(product.nazwa)}`,
      to: `/oferta/${mapped(CATEGORY_SLUGS, card.kategoria, 'category')}`,
      unpublish: true,
      reason: 'usunięta',
    })
  }
  for (const [shortId, target] of Object.entries(REPLACED_PRODUCTS)) {
    const product = products.find((item) => item.slug === shortId)
    if (!product) continue
    const from = `/produkt/${slugFromName(product.nazwa)}`
    const to =
      'product' in target
        ? `/produkt/${target.product}`
        : `/oferta/${mapped(CATEGORY_SLUGS, target.category, 'category')}`
    // `m365` already had the address of its family: nothing moves.
    if (from === to) continue
    retired.push({
      legacyIds: productLegacyIds(product),
      from,
      to,
      unpublish: !kept.has(shortId),
      reason: 'zastąpiona',
    })
  }
  return retired
}

// --- galleries (§4 pkt 5) ---

const K3_KEY = 'k3:'

/** Image keys of a card: its K3 photos, else the katalog v2 gallery or design files as today. */
export function k3ImageKeys(
  card: Pick<K3Card, 'slug_seed'>,
  gallery: K3Gallery,
  v2: SeedProduct | undefined,
  designFiles: SeedMediaFile[],
  limit: number | null,
): string[] {
  const photos = gallery[card.slug_seed]?.pliki
  if (photos?.length) {
    return unique(photos)
      .slice(0, limit ?? undefined)
      .map((file) => `${K3_KEY}${card.slug_seed}/${file}`)
  }
  return v2 ? productImageFiles(v2, designFiles, limit) : []
}

/**
 * File of a K3 image key and the name to upload it under: `k3-` in front, because 272 photo
 * names of K3 are already taken by katalog v2 files with other pictures. `null` for other keys.
 */
export function k3GalleryFile(key: string): { filePath: string; uploadName: string } | null {
  if (!key.startsWith(K3_KEY)) return null
  const [slug, file] = key.slice(K3_KEY.length).split('/') as [string, string]
  if (!file.endsWith('.webp')) throw new Error(`Seed (K3): photo "${key}" is not WebP.`)
  return { filePath: path.join(K3_MEDIA_DIR, 'produkty', slug, file), uploadName: `k3-${file}` }
}

/**
 * `Media` fields of a K3 photo: alt = card name + number (§4 pkt 5), source = first domain.
 * TODO(krystian): confirm the right to use producers' photos before production.
 */
export function k3GalleryMediaData(
  card: Pick<K3Card, 'slug_seed' | 'nazwa'>,
  key: string,
  gallery: K3Gallery,
) {
  const entry = gallery[card.slug_seed]
  const file = key.slice(key.lastIndexOf('/') + 1)
  const position = (entry?.pliki ?? []).indexOf(file) + 1
  if (!entry || position === 0) throw new Error(`Seed (K3): photo "${key}" not in the gallery.`)
  return {
    alt: `${card.nazwa} — zdjęcie ${position}`,
    source: `${entry.zrodlo_domeny[0] ?? 'źródło nieznane'} — paczka K3 (25.10.2026), prawo użycia do potwierdzenia`,
    requiresConsent: false,
  }
}

// --- dictionaries (§4 pkt 6) ---

/** Category from the dictionary: name, description and subcategories (address only with a page). */
export function k3CategoryData(
  category: K3Category,
  groupId: number,
  icons: Record<string, string>,
) {
  const withPage = SUBCATEGORY_PAGES.has(category.slug)
  return {
    ...categoryData(category, groupId, icons),
    subcategories: (category.podkategorie ?? []).map((row) => ({
      name: row.nazwa,
      slug: withPage ? text(row.slug) : null,
    })),
  }
}

/** A brand gets a record when it has a page or a card (Ingenico has neither: no record). */
export function k3BrandNeedsRecord(
  brand: Pick<K3Brand, 'marka' | 'strona_marki'>,
  cards: Pick<K3Card, 'marka'>[],
): boolean {
  return brand.strona_marki || cards.some((card) => card.marka === brand.marka)
}

/** Brand page of a partner (`Partners.brandPage`) and the producer's site for `website`. */
export function k3PartnerData(brand: K3Brand) {
  const brandPage: NonNullable<Partner['brandPage']> = {
    hasPage: brand.strona_marki,
    country: text(brand.kraj_pochodzenia),
    shortDescription: text(brand.opis_krotki),
    description: brand.opis?.length
      ? richText<NonNullable<NonNullable<Partner['brandPage']>['description']>>(
          brand.opis.map((paragraph) => p(paragraph)),
        )
      : null,
    facts: (brand.fakty ?? []).map((fact) => ({
      label: fact.k,
      value: fact.v,
      sourceUrl: text(fact.zrodlo),
    })),
    productLines: brand.linie_produktow ?? [],
    sources: unique((brand.zrodla ?? []).map((item) => item.url)),
  }
  return { brandPage, website: text(brand.strona_producenta) }
}

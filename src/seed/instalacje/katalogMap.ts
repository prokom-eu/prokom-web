import path from 'path'

import type { CatalogCategory, CatalogGroup, Product } from '../../payload-types'
import { p, richText } from '../biznes/lexical'
import { k4ProductFields, type K4Card } from '../biznes/k4Catalog'
import { seedDate } from '../biznes/map'

/**
 * Catalog of prokominstalacje.pl (`seed/prokominstalacje/katalog/`, INST-K0) mapped onto the
 * shared catalog collections (ADR-029 pkt 1). Pure functions; `katalog.ts` writes them.
 */

export const INST_KATALOG_DIR = path.join('seed', 'prokominstalacje', 'katalog')

export type InstDepartment = { slug: string; nazwa: string; krotko: string; kategorie: string[] }
export type InstCategory = {
  kod: string
  dzial: string
  nazwa: string
  opis: string
  podkategorie: { slug: string; nazwa: string }[]
}
export type InstDictionaries = { dzialy: InstDepartment[]; kategorie: InstCategory[] }

/** A card of `katalog-inst.json`: the K4 card plus the photo flag of a card without photos. */
export type InstCard = K4Card & { sprawdzono?: string | null }

type GroupIcon = CatalogGroup['icon']
type CategoryIcon = NonNullable<CatalogCategory['icon']>

const GROUP_ICONS: Record<string, GroupIcon> = {
  mon: 'monitor',
  alarm: 'shield',
  dostep: 'key',
  av: 'panel',
}

const CATEGORY_ICONS: Record<string, CategoryIcon> = {
  'kamery-ip': 'monitor',
  'kamery-hd': 'monitor',
  rejestratory: 'server',
  'akcesoria-cctv': 'plug',
  'alarmy-przewodowe': 'shield',
  'alarmy-bezprzewodowe': 'bell',
  wideodomofony: 'phone',
  'kontrola-dostepu': 'key',
  uchwyty: 'box',
  'przesyl-av': 'site',
  streaming: 'mega',
}

/**
 * The gradient of a department card: the CTA stops of the Instalacje tokens
 * (`src/styles/tokens-instalacje.css` → `--cap-cta-from` / `--cap-cta-to`), so the catalog
 * shows the line's turquoise. Group colours are panel data, like on Biznes.
 */
const GRADIENT = { gradientFrom: '#0a8aa8', gradientTo: '#006f89' } as const

export function instGroupData(department: InstDepartment, order: number) {
  const icon = GROUP_ICONS[department.slug]
  if (!icon)
    throw new Error(`Seed (Instalacje katalog): no icon for department "${department.slug}".`)
  return {
    name: department.nazwa,
    shortName: department.krotko,
    slug: department.slug,
    icon,
    ...GRADIENT,
    order,
  }
}

export function instCategoryData(category: InstCategory, groupId: number, order: number) {
  return {
    name: category.nazwa,
    slug: category.kod,
    group: groupId,
    icon: CATEGORY_ICONS[category.kod] ?? null,
    description: category.opis,
    subcategories: category.podkategorie.map((sub) => ({ name: sub.nazwa, slug: sub.slug })),
    order,
  }
}

/** Slug of a brand record: lowercase ASCII words joined by dashes („Western Digital” → `western-digital`). */
export function brandSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const PHOTO = /^media\/produkty\/([a-z0-9-]+-\d{2}\.webp)$/

/** Upload name and file of a card photo (`inst-` in front, apart from the Biznes packages). */
export function instPhotoFile(file: string): { filePath: string; uploadName: string } {
  const match = PHOTO.exec(file)
  if (!match) throw new Error(`Seed (Instalacje katalog): photo "${file}" is not a package WebP.`)
  return { filePath: path.join(INST_KATALOG_DIR, file), uploadName: `inst-${match[1]}` }
}

/** `Media` fields of a card photo: alt from the card, the producer page as the source. */
export function instPhotoMediaData(card: InstCard, index: number) {
  const photo = card.zdjecia_premium?.[index]
  if (!photo)
    throw new Error(`Seed (Instalacje katalog): photo ${index} of "${card.slug_seed}" missing.`)
  return {
    alt: index === 0 ? card.krotka || card.nazwa : `${card.krotka || card.nazwa} — ${photo.ujecie}`,
    // Eltrox: partner consent 18.11.2026; producers directly: TODO(krystian) (plan treści §0).
    source: /eltrox\.pl/.test(photo.zrodlo)
      ? `${photo.zrodlo} (partner Eltrox, zgoda 18.11.2026)`
      : `${photo.zrodlo} (materiały producenta — zgoda do potwierdzenia)`,
    requiresConsent: false,
  }
}

const CONTENT_STATUS: Record<string, Product['contentStatus']> = {
  gotowe: 'ready',
  'do-sprawdzenia': 'needs-review',
  'do-akceptacji-szefa': 'needs-review',
}

/**
 * `Products` fields of a card. Relations (`recommended`, `alternatives`) come in a second pass,
 * once every card has a record. A card „do sprawdzenia” is saved as `needs-review`: noindex and
 * outside the sitemap (ADR-026).
 */
export function instProductData(
  card: InstCard,
  refs: { brand: number | undefined; category: number; images: number[] },
  dictionaries: InstDictionaries,
) {
  const status = CONTENT_STATUS[card.status]
  if (!status)
    throw new Error(
      `Seed (Instalacje katalog): unknown status "${card.status}" of "${card.slug_seed}".`,
    )
  const category = dictionaries.kategorie.find((item) => item.kod === card.kategoria)
  if (!category) throw new Error(`Seed (Instalacje katalog): unknown category "${card.kategoria}".`)
  const subcategory = card.podkategoria
    ? category.podkategorie.find((sub) => sub.slug === card.podkategoria)?.nazwa
    : undefined
  if (card.podkategoria && !subcategory) {
    throw new Error(
      `Seed (Instalacje katalog): unknown subcategory "${card.podkategoria}" of "${card.slug_seed}".`,
    )
  }
  const fields = k4ProductFields(card, card.nazwa)
  const keyParams = Array.isArray(card.w_skrocie_wzorzec)
    ? (card.w_skrocie_wzorzec as { k: string; v: string }[]).map((item) => ({
        label: item.k,
        value: item.v,
      }))
    : []
  return {
    name: card.nazwa,
    slug: card.slug_seed,
    shortName: fields.shortName,
    subtitle: card.podtytul?.trim() || null,
    kind: fields.kind,
    brand: refs.brand ?? null,
    categories: [refs.category],
    subcategory: subcategory ?? null,
    series: card.seria?.trim() || null,
    benefit: card.korzysc,
    features: card.cechy,
    keyParams,
    description: richText<NonNullable<Product['description']>>(card.opis.map((text) => p(text))),
    specs: card.parametry.map((item) => ({ label: item.k, value: item.v })),
    variants: (card.warianty_opis ?? []).map((item) => ({
      name: item.model,
      difference: item.roznica,
    })),
    configurator: fields.configurator,
    faq: card.faq.map((item) => ({ question: item.q, answer: item.a })),
    sources: { links: fields.sourceLinks, checkedAt: seedDate(card.sprawdzono) },
    images: refs.images,
    isNew: fields.isNew,
    contentStatus: status,
    legacyIds: [card.slug_seed],
  }
}

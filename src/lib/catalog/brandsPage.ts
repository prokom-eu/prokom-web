import type { Partner } from '@/payload-types'

import { brandHref } from './brand'
import type { CatalogIndex, IndexImage, IndexLogo } from './catalogIndex'
import { normalizeText } from './normalize'

/**
 * Page `/marki` (K33 §6, board `Web-Marki`): the groups of `BiznesSettings.brands.groups` with
 * a tile per brand. A tile leads to the brand's showroom (a theme showroom too: Kyocera → Druk),
 * to its own page (GoPOS, InsERT, Optivendi) or to the offer filtered by the brand (HP).
 */

/** Photos on a tile (board: 3). */
const TILE_PHOTOS = 3

/** Brands with their own page instead of a showroom (board), shown only when published. */
const SPECIAL_PAGES: Record<string, string> = {
  gopos: 'gopos',
  insert: 'insert',
  optivendi: 'automaty-vendingowe',
}

/** Statuses of the header cards (board: Posnet, Elzab, GoPOS, InsERT). */
const HEADER_STATUSES: ReadonlySet<Partner['partnerStatus']> = new Set([
  'authorized-service',
  'authorized-partner',
])

export type BrandsPageInput = {
  groups: {
    title: string
    iconPath: string | null
    description: string | null
    partnerIds: number[]
  }[]
  partners: {
    id: number
    slug: string | null
    name: string
    status: Partner['partnerStatus']
    description: string | null
    logo: IndexLogo | null
  }[]
  showrooms: { slug: string; brandIds: number[] }[]
  index: Pick<CatalogIndex, 'products' | 'pages'>
}

export type BrandTile = {
  id: number
  slug: string
  name: string
  description: string | null
  logo: IndexLogo | null
  status: Partner['partnerStatus']
  count: number
  photos: IndexImage[]
  href: string
  /** A showroom or an own page: the „Salon” badge and „Wejdź do salonu”. */
  salon: boolean
  /** Name and description in the search form (`normalizeText`). */
  hay: string
}

export type BrandsGroup = {
  title: string
  /** Tab label: the name up to the first comma („Kasy, POS i płatności” → „Kasy”). */
  short: string
  iconPath: string | null
  description: string | null
  tiles: BrandTile[]
}

export type BrandsPage = {
  /** Brands on the page, each once (Samsung sits in two groups). */
  total: number
  groups: BrandsGroup[]
  /** Brands with an authorized status, for the header cards. */
  authorized: BrandTile[]
}

export function buildBrandsPage({
  groups,
  partners,
  showrooms,
  index,
}: BrandsPageInput): BrandsPage {
  const pages = new Set(index.pages.map((page) => page.slug))
  const showroomOf = new Map<number, string>()
  for (const showroom of showrooms) {
    for (const id of showroom.brandIds) if (!showroomOf.has(id)) showroomOf.set(id, showroom.slug)
  }
  const productsOf = new Map<string, CatalogIndex['products']>()
  for (const product of index.products) {
    if (!product.brand) continue
    const list = productsOf.get(product.brand) ?? []
    list.push(product)
    productsOf.set(product.brand, list)
  }

  const tiles = new Map<number, BrandTile>()
  for (const partner of partners) {
    if (!partner.slug) continue
    const products = productsOf.get(partner.slug) ?? []
    const showroom = showroomOf.get(partner.id)
    const special = SPECIAL_PAGES[partner.slug]
    const href = showroom
      ? brandHref(showroom)
      : special && pages.has(special)
        ? `/${special}`
        : products.length > 0
          ? `/oferta?marka=${encodeURIComponent(partner.slug)}`
          : null
    if (!href) continue
    tiles.set(partner.id, {
      id: partner.id,
      slug: partner.slug,
      name: partner.name,
      description: partner.description,
      logo: partner.logo,
      status: partner.status,
      count: products.length,
      photos: products.flatMap((product) => product.image ?? []).slice(0, TILE_PHOTOS),
      href,
      salon: !href.startsWith('/oferta'),
      hay: normalizeText(`${partner.name} ${partner.description ?? ''}`),
    })
  }

  const shown = new Map<number, BrandTile>()
  const result: BrandsGroup[] = []
  for (const group of groups) {
    const groupTiles = group.partnerIds.flatMap((id) => tiles.get(id) ?? [])
    if (groupTiles.length === 0) continue
    for (const tile of groupTiles) shown.set(tile.id, tile)
    result.push({
      title: group.title,
      short: group.title.split(',')[0]!.trim(),
      iconPath: group.iconPath,
      description: group.description,
      tiles: groupTiles,
    })
  }
  return {
    total: shown.size,
    groups: result,
    authorized: [...shown.values()].filter((tile) => HEADER_STATUSES.has(tile.status)),
  }
}

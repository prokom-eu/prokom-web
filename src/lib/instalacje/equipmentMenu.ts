import { bundleHref, bundleLabel, type BundleView, listBundles } from '../catalog/bundle'
import type { CatalogIndex } from '../catalog/catalogIndex'
import { plural } from '../plural'
import { type HomeSalon, homeSalons } from './homeCatalog'
import type { MenuColumn } from './menu'

/** Line icons (`InstIcon`) of the catalog categories; a new category gets `tool`. */
const CATEGORY_ICON: Record<string, string> = {
  'kamery-ip': 'cam',
  'kamery-hd': 'camera2',
  rejestratory: 'rack',
  'akcesoria-cctv': 'tool',
  'alarmy-przewodowe': 'shield',
  'alarmy-bezprzewodowe': 'bell',
  wideodomofony: 'door',
  'kontrola-dostepu': 'key',
  uchwyty: 'scr',
  'przesyl-av': 'fiber',
  streaming: 'play',
}

const items = (count: number) => `${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])}`

/**
 * Columns of the „Sprzęt” mega menu (INST-K2): one per department of the catalog, its listed
 * categories linked to their pages with the count of cards. Departments without a category drop
 * out; with no columns the header shows the plain „Sprzęt” link.
 */
export function equipmentColumns(index: {
  groups: Pick<CatalogIndex['groups'][number], 'slug' | 'name'>[]
  categories: Pick<CatalogIndex['categories'][number], 'slug' | 'name' | 'group' | 'count'>[]
}): MenuColumn[] {
  return index.groups.flatMap((group) => {
    const categories = index.categories.filter((category) => category.group === group.slug)
    if (categories.length === 0) return []
    return [
      {
        label: group.name,
        items: categories.map((category) => ({
          key: category.slug,
          label: category.name,
          caption: items(category.count),
          icon: CATEGORY_ICON[category.slug] ?? 'tool',
          color: null,
          href: `/oferta/${category.slug}`,
        })),
      },
    ]
  })
}

/**
 * A short showcase of bundles: the first of each area in the panel order, then the rest — so three
 * bundles show a house, a guesthouse and a firm instead of three houses.
 */
export function pickBundles<T extends { slug: string; area: string }>(
  bundles: readonly T[],
  size: number,
): T[] {
  const seen = new Set<string>()
  const firsts = bundles.filter((bundle) => !seen.has(bundle.area) && seen.add(bundle.area))
  return [...firsts, ...bundles.filter((bundle) => !firsts.includes(bundle))].slice(0, size)
}

/** Bundles named in the „Sprzęt” mega menu. */
export const MENU_BUNDLES = 3

export type EquipmentExtras = {
  salons: HomeSalon[]
  bundles: { slug: string; name: string; label: string; href: string }[]
  bundleCount: number
}

/**
 * The rest of the „Sprzęt” mega menu (INST-K3): the salon logos and the first ready bundles of
 * the line (listed cards only, „Gotowe” only — like `/zestawy`), with their count.
 */
export function equipmentExtras(
  index: Pick<CatalogIndex, 'brands' | 'products'>,
  views: readonly BundleView[],
): EquipmentExtras {
  const bundles = listBundles(views, new Set(index.products.map((product) => product.slug))).filter(
    (bundle) => bundle.indexable,
  )
  return {
    salons: homeSalons(index),
    bundles: pickBundles(bundles, MENU_BUNDLES).map((bundle) => ({
      slug: bundle.slug,
      name: bundle.name,
      label: bundleLabel(bundle),
      href: bundleHref(bundle.slug),
    })),
    bundleCount: bundles.length,
  }
}

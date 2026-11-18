import type { CatalogIndex } from '../catalog/catalogIndex'
import { plural } from '../plural'
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

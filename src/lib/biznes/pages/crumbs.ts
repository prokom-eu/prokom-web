import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'

import { HOME_SLUG, pagePath } from '../../pages/slug'

const isCrumb = (value: unknown): value is Crumb =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Crumb).name === 'string' &&
  typeof (value as Crumb).href === 'string'

/** Blocks that emit their own `BreadcrumbList` (the procurement template): no second one. */
const OWN_CRUMBS = new Set(['bzProcurementPage'])

const blockType = (block: unknown) =>
  typeof block === 'object' && block !== null
    ? (block as { blockType?: unknown }).blockType
    : undefined

/**
 * Breadcrumbs of a Biznes CMS page for `BreadcrumbList` (BIZ-3 §10.2): the same path the page
 * shows — Strona główna, the middle items of its hero section (`data.trail`), the page. None on
 * the home page.
 */
export function pageCrumbs(page: { slug: string; title: string; layout?: unknown }): Crumb[] {
  if (page.slug === HOME_SLUG) return []
  const blocks: unknown[] = Array.isArray(page.layout) ? page.layout : []
  if (blocks.some((block) => OWN_CRUMBS.has(String(blockType(block))))) return []
  // The hero is the first block; only it draws the crumbs with its middle items (`withTrail`).
  const first = blocks[0] as { data?: { trail?: unknown } } | undefined
  const trail =
    blockType(first) === 'bzSection' && Array.isArray(first?.data?.trail) ? first.data.trail : []
  return [
    { name: 'Strona główna', href: '/' },
    ...trail.filter(isCrumb),
    { name: page.title, href: pagePath(page.slug) },
  ]
}

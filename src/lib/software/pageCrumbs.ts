/**
 * The breadcrumb label of the Software blocks that open a page with their `PageHero` (Strona
 * główna › …) — one source for the visible crumbs and their `BreadcrumbList` (SEO etap 1).
 * `null`: the page's own title (legal pages).
 */
export const SOFTWARE_HERO_CRUMBS = {
  swPricing: 'Cennik',
  swAuditForm: 'Darmowy audyt',
  swLegal: null,
} as const

/** The crumb of a page's first block: its label, `null` = the page title, `undefined` = none. */
export function heroCrumb(blockType: unknown): string | null | undefined {
  const crumbs: Readonly<Record<string, string | null>> = SOFTWARE_HERO_CRUMBS
  return typeof blockType === 'string' && blockType in crumbs ? crumbs[blockType] : undefined
}

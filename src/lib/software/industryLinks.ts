import { INDUSTRY_PAGE_PATH } from './industryPage'

/**
 * Is the address a dead industry link: the industries index (no page yet) or an industry page
 * that is not active (`notFound()`, SWV6 A1)?
 */
export function isDeadIndustryHref(href: string, active: ReadonlySet<string>): boolean {
  if (href === INDUSTRY_PAGE_PATH) return true
  const prefix = `${INDUSTRY_PAGE_PATH}/`
  if (!href.startsWith(prefix)) return false
  return !active.has(href.slice(prefix.length).split(/[?#]/)[0] ?? '')
}

/**
 * The Software navigation without links to dead industry pages (mega menu chips, „Dla branż” in
 * the phone menu and the footer). Links are `[label, href, …]` tuples wherever they sit, so the
 * whole JSON is walked; anything else stays as it is. An industry switched on in the panel needs
 * its link added back there (the package `nawigacja.json` keeps them all).
 */
export function withoutIndustryLinks<T>(value: T, active: ReadonlySet<string>): T {
  return walk(value, active) as T
}

function walk(value: unknown, active: ReadonlySet<string>): unknown {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) =>
          !(
            Array.isArray(item) &&
            typeof item[1] === 'string' &&
            isDeadIndustryHref(item[1], active)
          ),
      )
      .map((item) => walk(item, active))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, walk(item, active)]))
  }
  return value
}

/**
 * The footer card of the service line is „Serwis”, not „Tech” (SWV6, audyt 01.11 — a mistake of
 * the board); the colour key `tech` stays (it names the line's colour tokens).
 */
export function withServiceLineName<T>(navigation: T): T {
  if (!navigation || typeof navigation !== 'object') return navigation
  const footer = (navigation as { footer?: { lines?: unknown } }).footer
  if (!footer || !Array.isArray(footer.lines)) return navigation
  const lines = footer.lines.map((card: unknown) =>
    card && typeof card === 'object' && (card as { color?: unknown }).color === 'tech'
      ? { ...card, name: 'Serwis', label: 'SERWIS' }
      : card,
  )
  return { ...navigation, footer: { ...footer, lines } }
}

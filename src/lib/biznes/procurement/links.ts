import { normalizeText } from '../../shared/search/normalize'
import { CONFIGURATOR_ANCHOR, handoffHref } from './handoff'

/**
 * Hook-ins of the two „Zaopatrzenie firm” pages in the rest of the site (plan 0611 §6.4,
 * ZAOPATRZENIE §10). Texts come from `SiteSettings → biznes.procurement` („Zaopatrzenie —
 * linki”): an empty field hides its hook-in, and so does a target page that is not published.
 * Pure functions, no zod — the configurator island and the search read them in the browser.
 */

/** The two pages (ZAOPATRZENIE §1), by their kind. */
export const SUPPLY_PAGE = { agd: 'agd-rtv-dla-firm', it: 'dostawy-it-dla-firm' } as const
export type SupplyKind = keyof typeof SUPPLY_PAGE

/** What the public site reads from the panel group (`toPublicSiteSettings`). */
export type SupplyLinks = {
  categoryBand: string | null
  categoryBandCta: string | null
  itCategories: string[]
  productLink: string | null
  industryTiles: { industry: string; page: SupplyKind; title: string; text: string | null }[]
  scaleTitle: string | null
  scaleText: string | null
  searchAgd: string[]
  searchIt: string[]
}

export const EMPTY_SUPPLY_LINKS: SupplyLinks = {
  categoryBand: null,
  categoryBandCta: null,
  itCategories: [],
  productLink: null,
  industryTiles: [],
  scaleTitle: null,
  scaleText: null,
  searchAgd: [],
  searchIt: [],
}

/** Published pages of the site (the catalog index lists them). */
type Pages = { pages: readonly { slug: string; title: string }[] }

type Target = { href: string; title: string }

/** The page of a kind while it is published, else `null`. */
function target(kind: SupplyKind, index: Pages): Target | null {
  const page = index.pages.find(({ slug }) => slug === SUPPLY_PAGE[kind])
  return page ? { href: `/${page.slug}`, title: page.title } : null
}

const filled = (value: string | null | undefined) => value?.trim() || null

/** „Kupujesz 5 sztuk lub więcej?” above the grid of an IT category (§6.4 #2). */
export function categorySupplyBand(
  links: SupplyLinks,
  index: Pages,
  category: string,
): { text: string; cta: string; href: string } | null {
  const text = filled(links.categoryBand)
  const page = target('it', index)
  if (!text || !page || !links.itCategories.includes(category)) return null
  return { text, cta: filled(links.categoryBandCta) ?? page.title, href: page.href }
}

/** „Potrzebujesz kilku sztuk? Policz stanowiska” under „Do zapytania” (§6.4 #3). */
export function productSupplyLink(
  links: SupplyLinks,
  index: Pages,
  categories: readonly string[],
): { label: string; href: string } | null {
  const label = filled(links.productLink)
  const page = target('it', index)
  if (!label || !page || !categories.some((slug) => links.itCategories.includes(slug))) return null
  return { label, href: `${page.href}#${CONFIGURATOR_ANCHOR}` }
}

export type SupplyTile = { title: string; text: string | null; href: string; label: string }

/** Tiles of an industry page (§6.4 #4), in the panel's order. */
export function industrySupplyTiles(
  links: SupplyLinks,
  index: Pages,
  industry: string,
): SupplyTile[] {
  return links.industryTiles.flatMap((tile) => {
    const page = tile.industry === industry ? target(tile.page, index) : null
    const title = filled(tile.title)
    return page && title
      ? [{ title, text: filled(tile.text), href: page.href, label: page.title }]
      : []
  })
}

/** The configurator's card at the largest scale (§6.4 #5), as the island gets it. */
export type ScaleSupply = {
  title: string
  text: string | null
  it: Target | null
  agd: Target | null
}

export function scaleSupply(links: SupplyLinks, index: Pages): ScaleSupply | null {
  const title = filled(links.scaleTitle)
  const it = target('it', index)
  const agd = target('agd', index)
  if (!title || (!it && !agd)) return null
  return { title, text: filled(links.scaleText), it, agd }
}

/** Scale „Ponad 10” of the configurator (`WIZARD_SCALES`); the count handed over. */
const LARGEST_SCALE = '10'
const LARGEST_COUNT = 10
/** Configurator firm → type of the IT page (`?typ=`); others get the office. */
const IT_TYPE: Record<string, string> = { hotel: 'recepcja', biuro: 'biuro' }
const IT_DEFAULT_TYPE = 'biuro'
/** Firms that also get the AGD page (ZAOPATRZENIE §10 #5: noclegi), with its type. */
const AGD_TYPE: Record<string, string> = { hotel: 'pokoj' }

/** Links of the card for the picked firm and scale: none below „10+”. */
export function scaleSupplyLinks(
  supply: ScaleSupply,
  firm: string | null,
  scale: string | null,
): { label: string; href: string }[] {
  if (scale !== LARGEST_SCALE) return []
  const it = supply.it && {
    label: supply.it.title,
    href: handoffHref(SUPPLY_PAGE.it, (firm && IT_TYPE[firm]) || IT_DEFAULT_TYPE, LARGEST_COUNT),
  }
  const agdType = firm ? AGD_TYPE[firm] : undefined
  const agd = supply.agd &&
    agdType && {
      label: supply.agd.title,
      href: handoffHref(SUPPLY_PAGE.agd, agdType, LARGEST_COUNT),
    }
  return [it, agd].filter((link): link is { label: string; href: string } => Boolean(link))
}

/** Phrases of the search (§6.4 #10) for one published page. */
export type SupplySearchEntry = { kind: SupplyKind; href: string; title: string; phrases: string[] }

export function supplySearch(links: SupplyLinks, index: Pages): SupplySearchEntry[] {
  return (
    [
      ['agd', links.searchAgd],
      ['it', links.searchIt],
    ] as const
  ).flatMap(([kind, list]) => {
    const page = target(kind, index)
    const phrases = list.map(normalizeText).filter(Boolean)
    return page && phrases.length > 0 ? [{ kind, ...page, phrases }] : []
  })
}

/** A token of the query matches a word of a phrase: equal, half typed or inflected. */
function tokenMatches(token: string, word: string): boolean {
  if (token === word) return true
  if (token.length < 4) return false
  if (word.startsWith(token)) return true
  let common = 0
  while (common < token.length && token[common] === word[common]) common++
  return common >= Math.max(4, word.length - 2)
}

/**
 * Pages whose phrase the query names. Every word of 4+ letters of a phrase must match a token
 * („dostawa laptopów”, „dla dewelopera” → „dewelopera”); a phrase of short words only must be
 * there whole („agd”). Inflection: a shared beginning short of the last two letters
 * („pralki” → „pralka”).
 */
export function matchSupplySearch(
  entries: readonly SupplySearchEntry[],
  query: string,
): SupplySearchEntry[] {
  const tokens = normalizeText(query)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (tokens.length === 0) return []
  const matches = (phrase: string) => {
    const words = phrase.split(/[^a-z0-9]+/).filter(Boolean)
    const long = words.filter((word) => word.length >= 4)
    const required = long.length > 0 ? long : words
    return required.every((word) => tokens.some((token) => tokenMatches(token, word)))
  }
  return entries.filter((entry) => entry.phrases.some(matches))
}

/** A link to a procurement page stays only while that page is published (footer, Opieka IT). */
export function supplyHrefVisible(href: string, index: Pages): boolean {
  const path = href.split(/[?#]/)[0]
  const kind = (Object.keys(SUPPLY_PAGE) as SupplyKind[]).find(
    (key) => path === `/${SUPPLY_PAGE[key]}`,
  )
  return kind === undefined || target(kind, index) !== null
}

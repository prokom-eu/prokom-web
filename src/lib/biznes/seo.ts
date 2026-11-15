import { META_DESCRIPTION_MAX, metaDescription } from '../seo/description'
import { SUPPLY_PAGE } from './procurement/links'

/** Shortest meta description worth showing in results (audit 0611 P1-8: 100–155 characters). */
export const META_DESCRIPTION_MIN = 100

/** What a short text from the panel is completed with: who offers it and where. */
const CONTEXT =
  'Doradzimy, dobierzemy i dostarczymy z wdrożeniem i serwisem — PRO-KOM Biznes, Rabka-Zdrój.'
/** The same, shorter — for a text of 55+ characters, so the whole stays within 155. */
const CONTEXT_SHORT = 'Dobór, wdrożenie i serwis — PRO-KOM Biznes, Rabka-Zdrój.'

/**
 * Meta description of a Biznes page from a text of the panel: cut to 155 characters, and a text
 * under 100 characters („Drukarki etykiet”) completed with who offers it and where.
 */
export function biznesDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length >= META_DESCRIPTION_MIN) return metaDescription(clean)
  const sentence = clean.replace(/[\s.,;:–—-]+$/, '')
  if (!sentence) return CONTEXT
  const long = `${sentence}. ${CONTEXT}`
  return metaDescription(
    long.length <= META_DESCRIPTION_MAX ? long : `${sentence}. ${CONTEXT_SHORT}`,
  )
}

/** A text that already says where we work, as a whole word (`Grabka` is not Rabka). */
const REGION = /(?<!\p{L})(rabk|rabc|podhal|małopol)/iu

/**
 * Biznes pages that sell a service (SEO lokalne 13.11): they carry a `Service` with the area of
 * the salon. The procurement pages (`dostawy-it-dla-firm`, `agd-rtv-dla-firm`) have their own;
 * `/ksef` is a guide (its title is a question), not a service name.
 */
export const BIZNES_SERVICE_PAGES: ReadonlySet<string> = new Set([
  'opieka-it',
  'gopos',
  'insert',
  'automaty-vendingowe',
])

/**
 * Pages whose title and description name the region (SEO lokalne 13.11): the service pages and
 * the procurement ones. Legal pages, guides and the contact page stay as the panel writes them.
 */
export const BIZNES_LOCAL_PAGES: ReadonlySet<string> = new Set([
  ...BIZNES_SERVICE_PAGES,
  ...Object.values(SUPPLY_PAGE),
])

/** A title split by a dash or a colon („Wagi dla firm — Dibal”, „Systemy: GoPOS”). */
const DASHED = / — |: | – /

/** Where we work, closing a description that does not say it yet (within 155 characters). */
const REGION_SENTENCE = ' Dobór i serwis w Rabce-Zdroju i na Podhalu.'
/** The same for a text that already offers the choice („Zapytaj o dobór”). */
const REGION_SENTENCE_NO_CHOICE = ' Wdrożenie i serwis w Rabce-Zdroju i na Podhalu.'

/**
 * Meta description of a category-like page that always says where we work (SEO lokalne 13.11):
 * a text naming the region stays as `biznesDescription` makes it; another one keeps its whole
 * sentences that fit — or, when they make it too short, the text cut on a word — and ends with
 * the region sentence. Still under 100 characters: `biznesDescription` (it adds who and where).
 */
export function localDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  // The text names the region and it survives the cut to 155 characters (not only the context
  // `biznesDescription` adds to a short text — that one would repeat „dobór”).
  const described = biznesDescription(clean)
  if (REGION.test(clean) && REGION.test(described)) return described
  const region = /dob[óo]r|dobier/i.test(clean) ? REGION_SENTENCE_NO_CHOICE : REGION_SENTENCE
  const room = META_DESCRIPTION_MAX - region.length
  let body = ''
  for (const sentence of clean.split(/(?<=[.!?])\s+/)) {
    const next = body ? `${body} ${sentence}` : sentence
    if (next.length > room) break
    body = next
  }
  if (body.length < META_DESCRIPTION_MIN - region.length) body = metaDescription(clean, room)
  const description = `${body.replace(/[\s,;:–—-]+$/, '').replace(/([^.!?…])$/, '$1.')}${region}`
  return description.length >= META_DESCRIPTION_MIN ? description : described
}

/** What the site's title template adds to every subpage („%s | PRO-KOM Biznes”). */
export const TITLE_SUFFIX = ' | PRO-KOM Biznes'
/** A whole `<title>` of 30–60 characters (audit 0611 P1-8): the page's part within these. */
export const TITLE_BASE_MIN = 30 - TITLE_SUFFIX.length
export const TITLE_BASE_MAX = 60 - TITLE_SUFFIX.length

/**
 * The page's part of `<title>` within 30–60 characters together with the site's suffix: a short
 * one gets `extend` („dla firm — Rabka-Zdrój”) when that fits; a long one keeps its first part
 * (before „ — ” or „: ”) when that says enough, else it is cut on a word. Never invents words.
 */
export function fitTitle(
  base: string,
  extend?: string,
  { head: useHead = true }: { head?: boolean } = {},
): string {
  const title = base.replace(/\s+/g, ' ').trim()
  if (title.length < TITLE_BASE_MIN && extend) {
    const longer = `${title} ${extend}`
    return longer.length <= TITLE_BASE_MAX ? longer : title
  }
  if (title.length <= TITLE_BASE_MAX) return title
  const head = title.split(/ — |: | – /)[0]!.trim()
  if (useHead && head.length >= TITLE_BASE_MIN && head.length <= TITLE_BASE_MAX) return head
  const cut = title.slice(0, TITLE_BASE_MAX + 1)
  const space = cut.lastIndexOf(' ')
  // Cut on a word, without a dangling short word („… Omada z”) or punctuation.
  return (space > 0 ? cut.slice(0, space) : cut.slice(0, TITLE_BASE_MAX))
    .replace(/(?:\s+[a-ząćęłńóśźż]{1,2})+$/u, '')
    .replace(/[\s,.;:—–-]+$/u, '')
}

/**
 * The page's part of `<title>` with the region (SEO lokalne 13.11: „Kasy fiskalne — Rabka-Zdrój i
 * Podhale”): the longest form of the region that fits 60 characters with the site's suffix, „dla
 * firm” only when the title does not say it; a long title gets the region on its short part
 * (`fitTitle`); a title naming the region already stays as `fitTitle` makes it.
 */
export function localTitle(base: string): string {
  const title = base.replace(/\s+/g, ' ').trim()
  if (REGION.test(title)) return fitTitle(title)
  const forFirms = /dla firm/i.test(title) ? [] : [' dla firm — Rabka-Zdrój i Podhale']
  const forms = [
    ...forFirms,
    ' — Rabka-Zdrój i Podhale',
    ...(forFirms.length ? [' dla firm — Rabka-Zdrój'] : []),
    ' — Rabka-Zdrój',
    ' — Rabka',
  ]
  // A text with a dash already („Wagi dla firm — Dibal”) takes the region after a comma.
  const withRegion = (text: string) =>
    forms
      .map((form) => text + (DASHED.test(text) ? form.replace(/^ (dla firm )?— /, ', ') : form))
      .find((t) => t.length <= TITLE_BASE_MAX)
  // Too long for any form: its first part (before „ — ” or „: ”, e.g. „Automaty vendingowe —
  // modele Optivendi”) with the region — the place weighs more for local search than the
  // brands after the dash — else the title as `fitTitle` makes it.
  const short = fitTitle(title)
  const head = title.split(/ — |: | – /)[0]!.trim()
  const firstPart = head.length >= TITLE_BASE_MIN ? withRegion(head) : undefined
  return withRegion(title) ?? withRegion(short) ?? firstPart ?? short
}

/**
 * `<title>` of a brand salon: the first line of its heading, without trailing punctuation;
 * a salon of several brands its heading does not name takes their names.
 */
export function salonMetaTitle(h1a: string, brands: readonly string[] = []): string {
  const heading = h1a.replace(/[\s,:;.—–-]+$/u, '')
  const plain = localTitle(heading)
  // A salon of several brands the heading does not name („Niszczarki dla firm”) shares its
  // title with the category: the brands instead of „dla firm”, while „Rabka-Zdrój” still fits
  // (audit 14.11 P1-5).
  const named = brands.some((brand) => heading.toLowerCase().includes(brand.toLowerCase()))
  if (brands.length < 2 || named) return plain
  const withBrands = localTitle(
    `${heading.replace(/\s+dla firm$/i, '')} ${brands.slice(0, -1).join(', ')} i ${brands.at(-1)}`,
  )
  return withBrands.includes('Rabka-Zdrój') ? withBrands : plain
}

/**
 * `<title>` of a brand page: its „Marka — co sprzedaje” with the full region; when only „,
 * Rabka” fits at the end of a list (it reads as one more product) or no region at all, „<marka>
 * dla firm” with the region, as the salons.
 */
export function brandMetaTitle(name: string, title: string): string {
  const local = localTitle(title)
  return local.includes('Rabka-Zdrój') ? local : localTitle(`${name} dla firm`)
}

type LocalPage = {
  slug: string
  title: string
  seo?: { title?: string | null; description?: string | null } | null
}

/**
 * Metadata of a Biznes page that sells (`BIZNES_LOCAL_PAGES`) with the region in the title — also
 * over a panel SEO title (decision 14.11: the region wins) — and in the description; the
 * Open Graph copy follows. Another line or page: the metadata as they came.
 */
export function localPageMeta<
  M extends { title?: unknown; description?: unknown; openGraph?: unknown },
>(line: string, page: LocalPage, metadata: M): M {
  if (line !== 'biznes' || !BIZNES_LOCAL_PAGES.has(page.slug)) return metadata
  const title = localTitle(page.seo?.title?.trim() || page.title)
  const description = page.seo?.description ? localDescription(page.seo.description) : undefined
  const openGraph = (metadata.openGraph ?? {}) as Record<string, unknown>
  return {
    ...metadata,
    title,
    ...(description && { description }),
    openGraph: { ...openGraph, title, ...(description && { description }) },
  }
}

import { META_DESCRIPTION_MAX, metaDescription } from '../seo/description'

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

/** A text that already says where we work (SEO lokalne 13.11). */
const REGION = /rabk|podhal|małopol/i

/** Where we work, closing a description that does not say it yet (within 155 characters). */
const REGION_SENTENCE = ' Dobór i serwis w Rabce-Zdroju i na Podhalu.'

/**
 * Meta description of a category-like page that always says where we work (SEO lokalne 13.11):
 * a text naming the region stays as `biznesDescription` makes it; another one keeps its whole
 * sentences that fit (or its first one cut on a word) and ends with the region sentence.
 */
export function localDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  const described = biznesDescription(clean)
  if (REGION.test(described)) return described
  const room = META_DESCRIPTION_MAX - REGION_SENTENCE.length
  let body = ''
  for (const sentence of clean.split(/(?<=[.!?])\s+/)) {
    const next = body ? `${body} ${sentence}` : sentence
    if (next.length > room) break
    body = next
  }
  if (!body) body = metaDescription(clean, room)
  return `${body.replace(/[\s,;:–—-]+$/, '').replace(/([^.!?…])$/, '$1.')}${REGION_SENTENCE}`
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
  const withRegion = (text: string) =>
    forms.map((form) => text + form).find((t) => t.length <= TITLE_BASE_MAX)
  // Too long for any form: its first part (before „ — ” or „: ”, e.g. „Automaty vendingowe —
  // modele Optivendi”) with the region — the place weighs more for local search than the
  // brands after the dash — else the title as `fitTitle` makes it.
  const short = fitTitle(title)
  const head = title.split(/ — |: | – /)[0]!.trim()
  const firstPart = head.length >= TITLE_BASE_MIN ? withRegion(head) : undefined
  return withRegion(title) ?? withRegion(short) ?? firstPart ?? short
}

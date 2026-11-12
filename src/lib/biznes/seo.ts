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

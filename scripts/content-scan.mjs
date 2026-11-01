// Content scan before production (SW12; spec. prokomsoftware.pl §10 pkt 9–10):
//   node scripts/content-scan.mjs <origin>
//   node scripts/content-scan.mjs https://staging.prokomsoftware.pl   (SCAN_AUTH=user:password)
// Reads the site's sitemap.xml and checks every address, plus /dziekujemy and a missing page:
// no placeholder in square brackets ([TELEFON SOFTWARE], [ROK ZAKOPANE], [X]…) and no name of a
// competitor. Placeholders are visible on staging on purpose (production hides unfilled facts),
// so on staging the report is the list of facts to fill in the panel before production.
// Exit code 1 when anything is found. The functions are also used by tests (Vitest, Playwright).
import { pathToFileURL } from 'node:url'

// TODO(krystian): nazwy konkurencji (spec. §10 pkt 10: „listę nazw podam w sesji”). Lista żyje
// tylko tutaj — w testach i skanie, nigdy w treściach ani dokumentach.
/** @type {readonly string[]} */
export const COMPETITORS = []

/**
 * The HTML a visitor and a search engine read: without scripts (except JSON-LD) and styles —
 * Next's own scripts repeat the page text and carry code like `[A-Z]`.
 * @param {string} html
 * @returns {string}
 */
export function scannableHtml(html) {
  return html
    .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
}

// Upper-case word(s) in square brackets: the facts of `SiteSettings.software.facts` (ADR-014 §1.4).
const PLACEHOLDER = /\[[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ0-9 …._-]*\]/g

/**
 * Distinct placeholders left in a page.
 * @param {string} html
 * @returns {string[]}
 */
export function findPlaceholders(html) {
  return [...new Set(scannableHtml(html).match(PLACEHOLDER) ?? [])]
}

/** @param {string} text */
const fold = (text) => text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '')

/**
 * Names from the list that a page mentions (any case, with or without diacritics, as a whole word).
 * @param {string} html
 * @param {readonly string[]} names
 * @returns {string[]}
 */
export function findNames(html, names) {
  const text = fold(scannableHtml(html))
  return names.filter((name) => {
    const escaped = fold(name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}($|[^\\p{L}\\p{N}])`, 'u').test(text)
  })
}

/**
 * Addresses of a sitemap, as paths.
 * @param {string} xml
 * @returns {string[]}
 */
export function sitemapPaths(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => new URL(loc.trim()).pathname)
}

/** Pages outside the sitemap that must be clean as well (noindex, 404). */
export const EXTRA_PATHS = ['/dziekujemy', '/nie-ma-takiej-strony-skan']

/** @param {string} origin */
async function scan(origin) {
  const auth = process.env.SCAN_AUTH
  /** @type {Record<string, string>} */
  const headers = auth ? { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {}
  const get = (/** @type {string} */ path) => fetch(new URL(path, origin), { headers })

  const sitemap = await get('/sitemap.xml')
  if (!sitemap.ok) throw new Error(`sitemap.xml: HTTP ${sitemap.status}`)
  const paths = [...new Set([...sitemapPaths(await sitemap.text()), ...EXTRA_PATHS])]
  let problems = 0
  for (const path of paths) {
    const html = await (await get(path)).text()
    const placeholders = findPlaceholders(html)
    const names = findNames(html, COMPETITORS)
    if (placeholders.length === 0 && names.length === 0) {
      console.log(`ok    ${path}`)
      continue
    }
    problems += 1
    console.log(`FAIL  ${path}`)
    if (placeholders.length > 0) console.log(`      zaślepki: ${placeholders.join(', ')}`)
    if (names.length > 0) console.log(`      konkurencja: ${names.join(', ')}`)
  }
  if (COMPETITORS.length === 0) console.log('uwaga: lista konkurencji jest pusta')
  console.log(`${paths.length} stron, ${problems} z problemami`)
  return problems === 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const origin = process.argv[2]
  if (!origin) {
    console.error('usage: node scripts/content-scan.mjs <origin>')
    process.exit(2)
  }
  scan(origin).then(
    (clean) => process.exit(clean ? 0 : 1),
    (error) => {
      console.error(error instanceof Error ? error.message : error)
      process.exit(2)
    },
  )
}

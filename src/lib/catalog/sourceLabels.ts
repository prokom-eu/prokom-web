import { publicSources } from './sources'

export type SourceLink = { url: string; label: string; meta: string }

/** Length of the host and path next to a label (K31-ZMIANY §4 pkt 9). */
export const META_MAX = 40

const isPdf = (url: URL) => /\.pdf$/i.test(url.pathname)

const host = (url: URL) => url.hostname.replace(/^www\./, '')

/** Model from a PSREF file name: „…/ThinkBook_14_G8_IRL_Spec.pdf” → „ThinkBook 14 G8 IRL”. */
function psrefModel(url: URL): string | null {
  const file = decodeURIComponent(url.pathname.split('/').pop() ?? '')
  const model = file
    .replace(/\.(pdf|html?)$/i, '')
    .replace(/_(spec|specs|psref)$/i, '')
    .replace(/[_+]+/g, ' ')
    .trim()
  return model || null
}

/** Label computed from the address (K31-ZMIANY §4 pkt 9); `brand` names the producer. */
export function sourceLabel(link: string, brand: string | null): string {
  const url = new URL(link)
  const name = brand ?? host(url)
  const path = url.pathname.toLowerCase()
  if (url.hostname.endsWith('psref.lenovo.com')) {
    const model = psrefModel(url)
    return model ? `Specyfikacja PSREF — ${model}` : 'Specyfikacja PSREF'
  }
  if (url.hostname === 'gov.pl' || url.hostname.endsWith('.gov.pl')) {
    return `Informacja urzędowa — ${host(url)}`
  }
  if (isPdf(url)) {
    if (/datasheet|data-sheet|karta|spec|katalog|brochure|ulotk/.test(path)) {
      return `Karta katalogowa (PDF) — ${name}`
    }
    if (/manual|instrukcj|guide|podrecznik|podręcznik/.test(path)) {
      return `Instrukcja (PDF) — ${name}`
    }
    return `Dokument PDF — ${name}`
  }
  if (/support|manual|docs|documentation|pomoc|help/.test(`${url.hostname}${path}`)) {
    return `Dokumentacja producenta — ${name}`
  }
  return `Strona producenta — ${name}`
}

/** What stands next to a label: „host · PDF”, else the host and path up to 40 characters. */
export function sourceMeta(link: string): string {
  const url = new URL(link)
  if (isPdf(url)) return `${host(url)} · PDF`
  const full = `${host(url)}${url.pathname.replace(/\/$/, '')}`
  return full.length <= META_MAX ? full : `${full.slice(0, META_MAX - 1)}…`
}

/** The card's brand names a link only on its own domain („Lenovo” on psref.lenovo.com). */
function brandOf(link: string, brand: string | null): string | null {
  const key = brand?.toLowerCase().replace(/[^a-z0-9]/g, '')
  return key && new URL(link).hostname.includes(key) ? brand : null
}

/**
 * The „Źródła” list (K31-ZMIANY §4 pkt 9): producers' links only (`publicSources` — never
 * shops or resellers), datasheets first, each address once. Empty → the section is not shown.
 */
export function sourceLinks(
  sources: { productPages: string[]; datasheets: string[] },
  brand: string | null,
): SourceLink[] {
  const { datasheets, productPages } = publicSources(sources)
  return [...new Set([...datasheets, ...productPages])].map((url) => ({
    url,
    label: sourceLabel(url, brandOf(url, brand)),
    meta: sourceMeta(url),
  }))
}

/**
 * Sources with labels from the panel (`Products.sources.links`, K4 `zrodla`): the same filter
 * as `sourceLinks` (producers only, price pages last resort), each address once, the panel's
 * label instead of one computed from the address.
 */
export function labeledSourceLinks(links: readonly { label: string; url: string }[]): SourceLink[] {
  const { urls } = publicSources({ urls: links.map((link) => link.url.trim()) })
  const allowed = new Set(urls)
  const seen = new Set<string>()
  return links.flatMap(({ label, url }) => {
    const address = url.trim()
    const name = label.trim()
    if (!name || !allowed.has(address) || seen.has(address)) return []
    seen.add(address)
    return [{ url: address, label: name, meta: sourceMeta(address) }]
  })
}

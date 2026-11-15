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
  const seen = new Set<string>()
  const once = [...datasheets, ...productPages].filter((url) => {
    const key = sameAddress(url)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return once.map((url) => ({
    url,
    label: sourceLabel(url, brandOf(url, brand)),
    meta: sourceMeta(url),
  }))
}

/** One address however it is written: no `www.`, `http`, trailing slash or `#part`. */
export function sameAddress(link: string): string {
  const url = new URL(link)
  return `${host(url).toLowerCase()}${url.pathname.replace(/\/+$/, '')}${url.search}`
}

/** Path segments that say nothing about the page: languages, shop and catalogue levels. */
const GENERIC_SEGMENT =
  /^([a-z]{2}(-[a-z]{2})?|programy_dla_firm|products?|produkty|produkt|shop|p|spd|articles?|opis|index|home|default|pages?|files|pliki|download|uploads?|newsroom|news|aktualnosci|support|manuals?|docs|help|pomoc|guide|wymagania_systemowe|wymagania|requirements|system-requirements|specs?|specyfikacja|tech-specs|porownanie|compare|ekrany|screens|screenshots|datasheets?)$/i

/** What kind of page an address is, from its path: „wymagania systemowe”, „pomoc”, a PDF kind. */
function pageKind(url: URL): string | null {
  const path = `${url.hostname}${pathOf(url)}`.toLowerCase()
  if (/\.pdf$/.test(path)) {
    if (/datasheet|data-sheet|karta|spec|katalog|brochure|ulotk/.test(path))
      return 'karta katalogowa (PDF)'
    if (/manual|instrukcj|guide|podrecznik|podręcznik/.test(path)) return 'instrukcja (PDF)'
    return 'dokument PDF'
  }
  if (/datasheet|karta-katalogowa/.test(path)) return 'karta katalogowa'
  if (/wymagania|requirements/.test(path)) return 'wymagania systemowe'
  if (/porownanie|compare/.test(path)) return 'porównanie wersji'
  if (/ekrany|screens/.test(path)) return 'ekrany programu'
  if (/\/(specs?|specyfikacja|tech-specs)(\/|$)/.test(url.pathname.toLowerCase()))
    return 'specyfikacja'
  if (/newsroom|\/news\/|aktualnosci|\/press/.test(path)) return 'komunikat prasowy'
  if (/support|manual|docs|documentation|pomoc|help|guide/.test(path)) return 'pomoc'
  return null
}

/** A file named in the query (`files?p_File_Name=X_DATASHEET.pdf`) counts as the last segment. */
function pathOf(url: URL): string {
  const file = [...url.searchParams.values()].find((value) => /\.pdf$/i.test(value))
  return file ? `${url.pathname}/${file}` : url.pathname
}

/**
 * The page's subject from its address: the last segment of several words with the model code
 * after it — „subiekt_nexo_pro/opis.html” → „Subiekt nexo pro”, „sprawdzarki-cen/llt” →
 * „Sprawdzarki cen llt”.
 */
function pageSubject(url: URL): string | null {
  const segments = pathOf(url)
    .split('/')
    .map((segment) => decodeURIComponent(segment).replace(/\.(x?html?|php|aspx?|pdf)$/i, ''))
    .filter((segment) => /[a-z]/i.test(segment) && !GENERIC_SEGMENT.test(segment))
  const words = (segment: string) =>
    segment
      .replace(/^\d{5,}-/, '') // an article id in front („11508519-kasa-wirtualna”)
      .replace(/[-_+]+/g, ' ')
      .replace(/\bdatasheet\b/gi, '') // the kind is said after the comma
      .replace(/(\s+(pl|en|de|gb|us))+\s*$/i, '') // a language at the end of a file name
      .replace(/\s{2,}/g, ' ')
      .trim()
  const named = [...segments].reverse().find((segment) => /[-_+ ]/.test(segment))
  const code = segments.at(-1)
  const parts = [named, code && code !== named ? code : undefined]
    .filter((part): part is string => !!part)
    .map(words)
  // A code already in the name („dell-pro-p-22-monitor-p2226h/p2226h”) is not repeated.
  const subject = parts.length === 2 && parts[0]!.includes(parts[1]!) ? parts[0]! : parts.join(' ')
  return subject ? `${subject[0]!.toUpperCase()}${subject.slice(1)}` : null
}

/** Language segment of an address: „/en-gb/shop/…” → „en-gb”. */
function languageOf(link: string): string | null {
  return (
    new URL(link).pathname.split('/').find((segment) => /^[a-z]{2}-[a-z]{2}$/i.test(segment)) ??
    null
  )
}

/** The producer of a label „Strona producenta — InsERT” (after the last dash), else the host. */
function producerOf(label: string, url: URL): string {
  const name = label.split(' — ').at(-1)?.trim()
  return name && name !== label.trim() ? name : host(url)
}

/**
 * A label that says what is under the link: „InsERT — Subiekt nexo, wymagania systemowe”, from
 * the producer of the panel label and the page's path (audit 14.11 P1-3).
 */
/**
 * Words of an address written as the card writes them (przegląd 14.11): „Subiekt nexo pro” →
 * „Subiekt nexo PRO”. Only the case and only words with a capital in the name — Polish letters
 * are not restored (an inflected „kasą” of the name is not the „kasa” of the address).
 */
function spelled(subject: string, names: readonly string[]): string {
  const known = new Map(
    names
      .flatMap((name) => name.split(/[\s/,()]+/))
      .filter((word) => /\p{Lu}/u.test(word))
      .map((word) => [word.toLowerCase(), word]),
  )
  return subject
    .split(' ')
    .map((word) => known.get(word.toLowerCase()) ?? word)
    .join(' ')
}

function describedLabel(label: string, link: string, names: readonly string[]): string {
  const url = new URL(link)
  const raw = pageSubject(url)
  const subject = raw && spelled(raw, names)
  const kind = pageKind(url)
  const what = [subject, kind].filter(Boolean).join(', ') || sourceMeta(link)
  return `${producerOf(label, url)} — ${what}`
}

/**
 * Sources with labels from the panel (`Products.sources.links`, K4 `zrodla`): the same filter
 * as `sourceLinks` (producers only, price pages last resort), each address once (`sameAddress`),
 * the panel's label instead of one computed from the address. A label repeated on the card
 * (10 × „Strona producenta — InsERT”) names the page from its address instead (audit 14.11
 * P1-3); a label still repeated gets its number, so no two links read the same.
 */
export function labeledSourceLinks(
  links: readonly { label: string; url: string }[],
  /** Name, short name and versions of the card: the spelling of words taken from an address. */
  names: readonly string[] = [],
): SourceLink[] {
  const { urls } = publicSources({ urls: links.map((link) => link.url.trim()) })
  const allowed = new Set(urls)
  const seen = new Set<string>()
  const kept = links.flatMap(({ label, url }) => {
    const address = url.trim()
    const name = label.trim()
    if (!name || !allowed.has(address)) return []
    const key = sameAddress(address)
    if (seen.has(key)) return []
    seen.add(key)
    return [{ url: address, label: name }]
  })
  const count = (labels: string[], label: string) => labels.filter((item) => item === label).length
  const panel = kept.map((link) => link.label)
  const described = kept.map((link) =>
    count(panel, link.label) > 1 ? describedLabel(link.label, link.url, names) : link.label,
  )
  // Still the same: one page in two languages gets the language, else its number on the card.
  return kept.map((link, index) => {
    const label = described[index]!
    const nth = described.slice(0, index + 1).filter((item) => item === label).length
    const twins = kept.filter((_, other) => described[other] === label)
    const language = languageOf(link.url)
    const languages = new Set(twins.map((twin) => languageOf(twin.url)))
    const suffix = language && languages.size === twins.length ? language : String(nth)
    return {
      url: link.url,
      label: twins.length > 1 ? `${label} (${suffix})` : label,
      meta: sourceMeta(link.url),
    }
  })
}

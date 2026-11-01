/**
 * Links to the producer's pages and datasheets of a product (`Products.sources`, katalog v2).
 * Only absolute http(s) links: they are shown as links on the product page (B6).
 */
export function validateHttpUrls(value: string[] | null | undefined): true | string {
  for (const link of value ?? []) {
    if (!isHttpUrl(link)) return `Link musi zaczynać się od https:// albo http:// — „${link}”.`
  }
  return true
}

/**
 * Links that must be https only (`Partners.brandPage.sources`), like the source of a brand fact
 * (`isHttpsUrl`) — one rule for both lists of a brand page.
 */
export function validateHttpsUrls(value: string[] | null | undefined): true | string {
  for (const link of value ?? []) {
    if (!isHttpUrl(link) || !link.startsWith('https://')) {
      return `Link musi zaczynać się od https:// — „${link}”.`
    }
  }
  return true
}

/**
 * Producers' sites a source link may point to on the page (K31-ZMIANY §4 pkt 9, ADR-012
 * rozstrz. 19): the domain itself or its subdomain. Shops, resellers and distributors stay in
 * the panel only. The package list ends with "m.in." — the rest are producers of cards in the
 * catalog (Avtek, InsERT's Subiekt 123, Insoft, Comarch, Stormshield, SATO, Rice Lake, Adobe…).
 */
const PRODUCER_DOMAINS = [
  'lenovo.com',
  'dell.com',
  'delltechnologies.com',
  'posnet.com.pl',
  'elzab.com.pl',
  'sunmi.com',
  'gopos.pl',
  'insert.com.pl',
  'subiekt123.pl',
  'ui.com',
  'synology.com',
  'qnap.com',
  'apc.com',
  'se.com',
  'microsoft.com',
  'eset.com',
  'sharpdisplays.eu',
  'sharpnecdisplays.eu',
  'konicaminolta.pl',
  'konicaminolta.eu',
  'kyoceradocumentsolutions.pl',
  'kyoceradocumentsolutions.eu',
  'samsung.com',
  'tp-link.com',
  'omadanetworks.com',
  'eurocert.pl',
  'zebra.com',
  'godexintl.com',
  'dibal.com',
  // Every government site (KSeF, ISAP, ministries): official sources of the regulations.
  'gov.pl',
  'avtek.pl',
  'insoft.com.pl',
  'comarch.pl',
  'stormshield.com',
  'nfhotel.pl',
  'satoeurope.com',
  'ricelake.com',
  'adobe.com',
  // K4 (K36 §13: sources of Apple, Brother, HP, Logitech, Fellowes, Kobra; COMEX, Optivendi,
  // PolCard salons). Producers' shops are left out by `SHOP_HOST`.
  'apple.com',
  'brother.eu',
  'brother.pl',
  'hp.com',
  'logitech.com',
  'fellowes.com',
  'kobra.com',
  'comex.com.pl',
  'optivendi.pl',
  'polcard.pl',
]

/** Paths of pages with prices (`K31-ZMIANY` §4 pkt 9): shown only when nothing else is left. */
const PRICE_PATH = /pricing|cennik|\/price|\/ceny/i

const isPricePage = (link: string) => PRICE_PATH.test(new URL(link).pathname)

/**
 * A producer's own shop (`store.brother.pl`, `eu.store.ui.com`, `sklep.eurocert.pl`): pages with
 * prices (K4-FINAL §1), never a source on the page.
 */
const SHOP_HOST = /^(?:[a-z0-9-]+.)?(?:store|sklep|shop)./

export function isProducerSource(link: string): boolean {
  if (!isHttpUrl(link)) return false
  const host = new URL(link).hostname.toLowerCase()
  if (SHOP_HOST.test(host)) return false
  return PRODUCER_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}

/**
 * Source links the page shows: producers' sites only, price pages only when no other link is
 * left. The record keeps every link — the filter works at render (ADR-012 rozstrz. 19).
 */
export function publicSources<T extends Record<string, string[]>>(lists: T): T {
  const allowed = Object.entries(lists).map(
    ([key, links]) => [key, links.filter(isProducerSource)] as const,
  )
  const hasOther = allowed.some(([, links]) => links.some((link) => !isPricePage(link)))
  return Object.fromEntries(
    allowed.map(([key, links]) => [
      key,
      hasOther ? links.filter((link) => !isPricePage(link)) : links,
    ]),
  ) as T
}

function isHttpUrl(link: string): boolean {
  if (/[\s\\]/.test(link)) return false
  try {
    const url = new URL(link)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

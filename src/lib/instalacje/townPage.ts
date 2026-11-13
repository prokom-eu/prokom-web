import { areaHref } from './area'

/** What the site's title template adds to a subpage's title (`SiteSettings.seo.titleTemplate`). */
export const TITLE_SUFFIX = ' | PRO-KOM Instalacje'
const TITLE_MAX = 60

/**
 * `<title>` of a town page without the site name (ADR-I006 §5): the longest variant of
 * „Instalacje <miasto>: monitoring, alarmy” that fits 60 characters with the suffix. The h1 keeps
 * the whole „…: monitoring, alarmy, smart home”.
 */
export function townTitle(name: string): string {
  const variants = [
    `Instalacje ${name}: monitoring, alarmy`,
    `Instalacje ${name}: monitoring`,
    `${name}: monitoring`,
  ]
  return variants.find((title) => (title + TITLE_SUFFIX).length <= TITLE_MAX) ?? name
}

/**
 * Realizations of this town: the part of „place” before „·” names it (e.g. „Zakopane i Kraków ·
 * salony sprzedaży”). Matched by whole names, so „Ponice” never matches „Poronin”.
 */
export function townRealizations<T extends { place: string | null }>(
  realizations: readonly T[],
  names: readonly string[],
): T[] {
  return realizations.filter((r) => {
    const where = r.place?.split('·')[0] ?? ''
    const parts = where
      .split(/,| i /)
      .map((part) => part.trim())
      .filter(Boolean)
    return parts.some((part) => names.includes(part))
  })
}

/**
 * `Service` of one town page (ADR-I006 §7): the salon's `LocalBusiness` (`/#oddzial-1`, emitted by
 * the layout) is the provider, the town is the only area served — no fake branch in the town.
 */
export function townServiceJsonLd({
  origin,
  slug,
  name,
  description,
  services,
}: {
  origin: string
  slug: string
  name: string
  description: string
  /** Names of the services the page lists. */
  services: readonly string[]
}) {
  const url = `${origin}${areaHref(slug)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Instalacje ${name}: monitoring, alarmy, smart home`,
    serviceType: services.join(', '),
    description,
    url,
    provider: { '@id': `${origin}/#oddzial-1` },
    areaServed: { '@type': 'City', name },
    offers: { '@type': 'Offer', url, availability: 'https://schema.org/InStock' },
  }
}

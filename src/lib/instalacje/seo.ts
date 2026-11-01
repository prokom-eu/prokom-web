/**
 * Towns of the line's area (SEO §1): in the structured data, never as clone pages. I13: the list
 * stays in code (Zakopane is a town of the travel zone — no salon there, boss 01.11.2026); a
 * panel field only if the boss wants to edit it.
 */
export const AREA_SERVED = [
  'Rabka-Zdrój',
  'Zakopane',
  'Nowy Targ',
  'Jordanów',
  'Mszana Dolna',
  'Limanowa',
  'Szczawnica',
  'Białka Tatrzańska',
  'Bukowina Tatrzańska',
  'Poronin',
] as const

/**
 * `Service` of one Instalacje service page (SEO §2.3): the provider is the salon's
 * `LocalBusiness` the layout emits from `CompanyData` (`/#oddzial-1`, the first location — the
 * only one since 01.11.2026), the offer has no price (spec §2).
 */
export function serviceJsonLd({
  origin,
  path,
  name,
  description,
  serviceType,
  audience,
}: {
  origin: string
  path: string
  name: string
  description: string | null | undefined
  serviceType: string
  /** Who the service is for (`BusinessAudience`, e.g. the page for architects, spec §7). */
  audience?: readonly string[]
}) {
  const url = `${origin}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    ...(description && { description }),
    url,
    ...(audience?.length && {
      audience: { '@type': 'BusinessAudience', audienceType: audience.join(', ') },
    }),
    provider: { '@id': `${origin}/#oddzial-1` },
    areaServed: AREA_SERVED.map((town) => ({ '@type': 'City', name: town })),
    offers: { '@type': 'Offer', url, availability: 'https://schema.org/InStock' },
  }
}

/**
 * `WebSite` of the line's home page (SEO §2.3): the site's name and address, published by the
 * Organization the layout already emits (`/#organization`). No search action — the site has no
 * search page yet (I12).
 */
export function websiteJsonLd({ origin, name }: { origin: string; name: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${origin}/#website`,
    name,
    url: `${origin}/`,
    inLanguage: 'pl-PL',
    publisher: { '@id': `${origin}/#organization` },
  }
}

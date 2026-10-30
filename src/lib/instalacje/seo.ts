/**
 * Towns of the line's area (SEO §1): in the structured data, never as clone pages.
 * TODO(krystian): the list moves to the panel with the LocalBusiness data in I13 (SEO §2.3).
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
 * `Service` of one Instalacje service page (SEO §2.3): the provider is the site's
 * Organization from the layout (`/#organization`), the offer has no price (spec §2).
 * TODO(krystian): I13 — provider → the line's LocalBusiness once it exists (SEO §2.3).
 */
export function serviceJsonLd({
  origin,
  path,
  name,
  description,
  serviceType,
}: {
  origin: string
  path: string
  name: string
  description: string | null | undefined
  serviceType: string
}) {
  const url = `${origin}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    serviceType,
    ...(description && { description }),
    url,
    provider: { '@id': `${origin}/#organization` },
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

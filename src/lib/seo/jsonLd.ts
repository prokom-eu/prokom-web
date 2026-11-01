import { brandAsset } from '../brand/lines'
import { toTelHref } from '../site/link'
import type { PublicCompanyData } from '../site/public'
import type { Line } from '../tenant/lines'

const DAYS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

type OrganizationInput = {
  company: PublicCompanyData
  tenant: { name: string; line: Line }
  /** Phone and e-mail of the line (`SiteSettings`); company ones are the fallback. */
  contact: { phone: string | null; email: string | null }
  origin: string
}

/** Where the Software line works (its texts: Podhale, Małopolska and remotely in Poland). */
export const SOFTWARE_AREA_SERVED = ['Rabka-Zdrój', 'Podhale', 'Małopolska', 'Polska'] as const

/**
 * The Software office for search engines (audyt 01.11 P2): its place on the map — the same point
 * as the contact map (`scripts/software-osm-map.mjs`, ul. Orkana 16B) — and the line's image.
 * `CompanyData` has no coordinates; Software has one office, so they live here.
 */
const SOFTWARE_OFFICE = {
  geo: { '@type': 'GeoCoordinates', latitude: 49.60994, longitude: 19.95339 },
  image: '/brand/prokom-software_og.png',
} as const

/** `tel:+48…` from the panel's number as schema.org wants it (E.164): `+48883200151`. */
const e164 = (phone: string | undefined) => (phone ? toTelHref(phone)?.slice(4) : undefined)

/**
 * `Organization` (the line as the public face of the company) plus one `LocalBusiness` per
 * branch with its opening hours — all from `CompanyData`, so a change in the panel updates it.
 * Software lists only the first branch.
 */
export function organizationJsonLd({ company, tenant, contact, origin }: OrganizationInput) {
  const orgId = `${origin}/#organization`
  const telephone = e164(contact.phone ?? company.phones[0]?.number)
  const email = contact.email ?? company.email
  const organization = {
    '@type': 'Organization',
    '@id': orgId,
    name: tenant.name,
    legalName: company.name,
    url: `${origin}/`,
    logo: origin + brandAsset(tenant.line, 'poziome_kolor.svg'),
    telephone,
    email,
    taxID: company.nip,
  }
  // Software works only in Rabka (prokomsoftware ZMIANY-v23 §1): its pages name only the main
  // office (the first location), never the other salons of the company.
  const locations = tenant.line === 'software' ? company.locations.slice(0, 1) : company.locations
  const branches = locations.map((location, index) => ({
    '@type': 'LocalBusiness',
    // By position, not city: two branches in one city must stay two nodes.
    '@id': `${origin}/#oddzial-${index + 1}`,
    name: `${company.name} — ${location.name}`,
    parentOrganization: { '@id': orgId },
    url: `${origin}/`,
    telephone,
    email,
    ...(tenant.line === 'software' && {
      geo: SOFTWARE_OFFICE.geo,
      image: origin + SOFTWARE_OFFICE.image,
      areaServed: SOFTWARE_AREA_SERVED,
    }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.street,
      postalCode: location.postalCode,
      addressLocality: location.city,
      addressCountry: 'PL',
    },
    openingHoursSpecification: location.hours.map(({ days, opens, closes }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.flatMap((day) => (DAYS[day] ? [`https://schema.org/${DAYS[day]}`] : [])),
      opens,
      closes,
    })),
  }))
  return { '@context': 'https://schema.org', '@graph': [organization, ...branches] }
}

/** `FAQPage` for the FAQ block (the answers are plain text in the panel). */
export function faqJsonLd(items: readonly { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
}

type ProductInput = {
  name: string
  description: string | null
  /** Absolute address of the product page. */
  url: string
  brand: string | null
  category: string | null
  /** Absolute image addresses, the main one first. */
  images: readonly string[]
  /** `productGroupID` of a `ProductGroup` (the card's slug). */
  groupId?: string
  /** Versions of a card with many models: ≥ 2 make it a `ProductGroup` (K31-ZMIANY §13.5). */
  variants?: readonly { name: string; sku: string; url: string }[]
}

/**
 * `Product` of the product page — never with `offers`: the catalog has no prices (spec. §6.2,
 * spec. §1). A card with ≥ 2 versions is a `ProductGroup` whose `hasVariant` link to
 * `?wersja=` (canonical stays on the card). Missing fields are left out rather than sent empty.
 */
export function productJsonLd({
  name,
  description,
  url,
  brand,
  category,
  images,
  groupId,
  variants = [],
}: ProductInput) {
  const common = {
    '@context': 'https://schema.org',
    name,
    ...(description && { description }),
    url,
    ...(brand && { brand: { '@type': 'Brand', name: brand } }),
    ...(category && { category }),
    ...(images.length > 0 && { image: [...images] }),
  }
  if (variants.length < 2) return { ...common, '@type': 'Product' }
  return {
    ...common,
    '@type': 'ProductGroup',
    ...(groupId && { productGroupID: groupId }),
    variesBy: ['https://schema.org/model'],
    hasVariant: variants.map((variant) => ({
      '@type': 'Product',
      name: variant.name,
      sku: variant.sku,
      url: variant.url,
    })),
  }
}

type VideoInput = { id: string; title: string; channel: string | null }

/**
 * `VideoObject` of a producer's video (ADR-016): the poster address from `i.ytimg.com` and the
 * youtube-nocookie player — only in JSON-LD, the browser loads neither before „▶”. Without
 * `uploadDate`: neither the import nor oEmbed gives it (STAN, K31b).
 */
export function videoJsonLd({ id, title, channel }: VideoInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: title,
    description: channel ? `${title} — film producenta (${channel}).` : title,
    thumbnailUrl: [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`],
    embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
  }
}

type ArticleInput = {
  headline: string
  description: string | null
  /** Absolute address of the post. */
  url: string
  /** Origin of the site: author and publisher point at its `Organization` node. */
  origin: string
  datePublished: string | null
  dateModified: string | null
  /** Absolute image addresses. */
  images: readonly string[]
}

/**
 * `Article` of a news post (spec. §6.9). Author and publisher are the line's `Organization`
 * from the layout (`#organization`), so the company data stay in one place.
 */
export function articleJsonLd({
  headline,
  description,
  url,
  origin,
  datePublished,
  dateModified,
  images,
}: ArticleInput) {
  const organization = { '@id': `${origin}/#organization` }
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description && { description }),
    url,
    mainEntityOfPage: url,
    inLanguage: 'pl-PL',
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: organization,
    publisher: organization,
    ...(images.length > 0 && { image: [...images] }),
  }
}

/**
 * `BreadcrumbList` from the visible breadcrumbs, with absolute addresses. `url: null` → the item
 * has no `item`: its page is not indexed (a filtered catalog view), so it is named, not linked.
 */
export function breadcrumbJsonLd(items: readonly { name: string; url: string | null }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      ...(url && { item: url }),
    })),
  }
}

/**
 * One service with its page (Software solution page, spec. §6.1). `offers` only with a price:
 * the „od” price as `minPrice`, net (prices on the site are net); no price → no `offers`.
 */
export function serviceJsonLd({
  name,
  description,
  url,
  provider,
  priceFrom,
  areaServed,
}: {
  name: string
  description: string | undefined
  url: string
  provider: string
  priceFrom: number | null
  /** Places the service is offered in (`SOFTWARE_AREA_SERVED`). */
  areaServed?: readonly string[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    ...(description && { description }),
    url,
    provider: { '@type': 'Organization', name: provider },
    ...(areaServed && { areaServed }),
    ...(priceFrom !== null && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PLN',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: priceFrom,
          priceCurrency: 'PLN',
          valueAddedTaxIncluded: false,
        },
      },
    }),
  }
}

/** A list of services with their pages (the Software catalog, spec. §5). */
export function serviceListJsonLd({
  name,
  provider,
  items,
}: {
  name: string
  provider: string
  items: readonly { name: string; description: string | undefined; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: item.name,
        ...(item.description && { description: item.description }),
        url: item.url,
        provider: { '@type': 'Organization', name: provider },
      },
    })),
  }
}

/**
 * List of linked pages (K3c: the items of a ready bundle, the bundles of `/zestawy`): `ListItem`
 * with a name and an address only — never `offers` (no prices on the site).
 */
export function itemListJsonLd({
  name,
  items,
}: {
  name: string
  items: readonly { name: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

/** JSON for `<script type="application/ld+json">`; `<` escaped so text cannot end the tag (Next docs). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

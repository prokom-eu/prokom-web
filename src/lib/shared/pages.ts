import { plural } from '../plural'
import { openingHoursText } from '../seo/jsonLd'
import { toTelHref } from '../site/link'
import type { SharedCompany, SharedSalon } from './project'

/** „{placeKind} · Rabka-Zdrój” on the address card (spec §6.1 pkt 1, field `contact.placeKind`). */
export const PLACE_KIND_LABEL = {
  salon: 'Salon',
  spotkanie: 'Miejsce spotkań',
  serwis: 'Serwis',
} as const

export type PlaceKind = keyof typeof PLACE_KIND_LABEL

/**
 * The salons of a line (`contact.salonKeys`, keys of `CompanyData.locations`), in the company's
 * order; only published ones reach here (`getSharedData`). No keys → the first salon, the office.
 */
export function lineSalons(
  salons: readonly SharedSalon[],
  keys: readonly string[] | null | undefined,
): SharedSalon[] {
  if (!keys?.length) return salons.slice(0, 1)
  return salons.filter((salon) => salon.key !== null && keys.includes(salon.key))
}

const DAYS: Record<string, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

/** `tel:+48…` → `+48…` (E.164, as schema.org wants it). */
const e164 = (phone: string | null) => (phone ? (toTelHref(phone)?.slice(4) ?? null) : null)

type PageInput = {
  company: Pick<SharedCompany, 'name' | 'nip'>
  /** The line's name as the public face, e.g. „PRO-KOM Biznes”. */
  lineName: string
  phone: string | null
  email: string | null
  /** `https://prokombiznes.pl` — no trailing slash. */
  origin: string
  /** The page's breadcrumbs, last = the page itself. */
  breadcrumbs: readonly { name: string; path: string }[]
}

/** BreadcrumbList as a node of the page's graph (no own @context). */
const crumbs = (origin: string, items: PageInput['breadcrumbs']) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(({ name, path }, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name,
    item: origin + path,
  })),
})

function organization({ company, lineName, phone, email, origin }: PageInput) {
  return {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: lineName,
    legalName: company.name,
    url: `${origin}/`,
    ...(e164(phone) && { telephone: e164(phone) }),
    ...(email && { email }),
    taxID: company.nip,
  }
}

/**
 * Kontakt (spec §6.1, §8): a `LocalBusiness` per salon of the line — only real, published ones —
 * with its hours, and the `BreadcrumbList`. Same NAP on every domain (from `CompanyData`).
 */
export function contactPageJsonLd(input: PageInput & { salons: readonly SharedSalon[] }) {
  const { company, phone, email, origin, salons } = input
  const branches = salons.map((salon, index) => ({
    '@type': 'LocalBusiness',
    '@id': `${origin}/#oddzial-${index + 1}`,
    name: `${company.name} — ${salon.name}`,
    parentOrganization: { '@id': `${origin}/#organization` },
    url: `${origin}/`,
    ...(e164(phone) && { telephone: e164(phone) }),
    ...(email && { email }),
    address: {
      '@type': 'PostalAddress',
      streetAddress: salon.street,
      postalCode: salon.postalCode,
      addressLocality: salon.city,
      addressCountry: 'PL',
    },
    ...(salon.geo && {
      geo: { '@type': 'GeoCoordinates', latitude: salon.geo.lat, longitude: salon.geo.lng },
    }),
    openingHours: salon.hours.map(openingHoursText),
    openingHoursSpecification: salon.hours.map(({ days, opens, closes }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days.flatMap((day) => (DAYS[day] ? [`https://schema.org/${DAYS[day]}`] : [])),
      opens,
      closes,
    })),
  }))
  return {
    '@context': 'https://schema.org',
    '@graph': [organization(input), ...branches, crumbs(origin, input.breadcrumbs)],
  }
}

/** O firmie (spec §6.2): `Organization` and the `BreadcrumbList`. */
export function aboutPageJsonLd(input: PageInput) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organization(input), crumbs(input.origin, input.breadcrumbs)],
  }
}

/**
 * Since when the company works (spec §6.2: hero pill, the „2004” outline, the first stat).
 * TODO(krystian): not in the panel yet — a `CompanyData` field needs a migration (ADR-022 D2-3b).
 */
export const FOUNDED = { year: '2004', label: 'na Podhalu, w Rabce-Zdroju' } as const

type Stat = { value: string; label: string; flag?: string | null }

/**
 * The four cards of `StatsStrip` (spec §6.2 pkt 2): since 2004, the line's own numbers
 * (`about.stats`, a flagged one hidden on production by the strip) and the published lines.
 */
export function aboutStats(
  own: readonly Stat[] | null | undefined,
  lines: readonly { kind: 'linia' | 'marka' }[],
): Stat[] {
  const count = lines.filter((line) => line.kind === 'linia').length
  return [
    { value: FOUNDED.year, label: FOUNDED.label },
    ...(own ?? []).map(({ value, label, flag }) => ({ value, label, flag: flag ?? null })),
    {
      value: String(count),
      label: `${plural(count, ['linia', 'linie', 'linii'])} w jednej firmie`,
    },
  ]
}

import type { CompanyDatum, SiteSetting } from '@/payload-types'

import { hasMarker, stripMarked } from './markers'
import type { SharedLineKey } from './lines'

type Hours = { days: string[]; opens: string; closes: string }[]
type Geo = { lat: number; lng: number } | null

export type SharedCompany = {
  name: string
  nip: string
  /** Company e-mail — the fallback when a line has none. */
  email: string
  /** Address of the company = the first published location (spec §4.1). */
  address: { street: string; postalCode: string; city: string } | null
  geo: Geo
  hours: Hours
  /** Closed days, `YYYY-MM-DD`. */
  holidays: string[]
  mapsUrl: string | null
  ceidgUrl: string | null
  legal: { privacy: string; cookies: string; accessibility: string; sitemap: string }
  consent: { mode: 'checkbox' | 'info'; version: string | null; clause: string | null }
  recentlyViewed: boolean
  serviceZones: { name: string; towns: string[]; note: string | null }[]
}

export type SharedLine = {
  key: SharedLineKey
  name: string
  kind: 'linia' | 'marka'
  order: number
  domain: string | null
  url: string | null
  logoLabel: string | null
  color: string | null
  colorOnDark: string | null
  description: string | null
  descriptionLong: string | null
}

export type SharedSalon = {
  key: string | null
  name: string
  street: string
  postalCode: string
  city: string
  geo: Geo
  parkingNote: string | null
  hours: Hours
}

type SharedGroup = NonNullable<SiteSetting['shared']>

/** The line's contact fields of `SiteSettings` plus its `shared` group (spec §4.2). */
export type SharedLineData = {
  phone: string | null
  phone2: string | null
  email: string | null
  footerDescription: string | null
} & { [K in keyof SharedGroup]-?: NonNullable<SharedGroup[K]> | null }

export type SharedData = {
  company: SharedCompany
  line: SharedLineData
  lines: SharedLine[]
  salons: SharedSalon[]
}

const LEGAL_DEFAULTS: SharedCompany['legal'] = {
  privacy: '/polityka-prywatnosci',
  cookies: '/cookies',
  accessibility: '/dostepnosc',
  sitemap: '/mapa-strony',
}

// `sv-SE` formats as YYYY-MM-DD. A day picked in the panel is saved as midnight in Poland,
// i.e. the evening before in UTC — so the day is read in Polish time, never by cutting the ISO.
const WARSAW_DAY = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' })
const warsawDay = (iso: string): string => WARSAW_DAY.format(new Date(iso))

const toGeo = (geo: { lat?: number | null; lng?: number | null } | undefined): Geo =>
  typeof geo?.lat === 'number' && typeof geo.lng === 'number'
    ? { lat: geo.lat, lng: geo.lng }
    : null

const toHours = (hours: CompanyDatum['locations'][number]['hours']): Hours =>
  (hours ?? []).map(({ days, opens, closes }) => ({ days, opens, closes }))

function toSalons(locations: CompanyDatum['locations']): SharedSalon[] {
  return locations
    .filter((location) => location.published !== false)
    .map((location) => ({
      key: location.key ?? null,
      name: location.name,
      street: location.street,
      postalCode: location.postalCode,
      city: location.city,
      geo: toGeo(location.geo),
      parkingNote: location.parkingNote ?? null,
      hours: toHours(location.hours),
    }))
}

function toCompany(doc: CompanyDatum, salons: SharedSalon[]): SharedCompany {
  const office = salons[0]
  const legal = doc.legal ?? {}
  return {
    name: doc.name,
    nip: doc.nip,
    email: doc.email,
    address: office
      ? { street: office.street, postalCode: office.postalCode, city: office.city }
      : null,
    geo: office?.geo ?? null,
    hours: office?.hours ?? [],
    holidays: (doc.holidays ?? []).map(({ date }) => warsawDay(date)),
    mapsUrl: doc.mapsUrl ?? null,
    ceidgUrl: doc.ceidgUrl ?? null,
    legal: {
      privacy: legal.privacy || LEGAL_DEFAULTS.privacy,
      cookies: legal.cookies || LEGAL_DEFAULTS.cookies,
      accessibility: legal.accessibility || LEGAL_DEFAULTS.accessibility,
      sitemap: legal.sitemap || LEGAL_DEFAULTS.sitemap,
    },
    consent: {
      mode: doc.consent?.mode ?? 'checkbox',
      version: doc.consent?.version ?? null,
      clause: doc.consent?.clause ?? null,
    },
    recentlyViewed: doc.recentlyViewed ?? false,
    serviceZones: (doc.serviceZones ?? []).map(({ name, towns, note }) => ({
      name,
      towns: towns ?? [],
      note: note ?? null,
    })),
  }
}

function toLines(lines: CompanyDatum['lines']): SharedLine[] {
  return (lines ?? [])
    .filter((line) => line.published)
    .sort((a, b) => a.order - b.order)
    .map((line) => ({
      key: line.key,
      name: line.name,
      kind: line.kind,
      order: line.order,
      domain: line.domain ?? null,
      url: line.url ?? null,
      logoLabel: line.logoLabel ?? null,
      color: line.color ?? null,
      colorOnDark: line.colorOnDark ?? null,
      description: line.description ?? null,
      descriptionLong: line.descriptionLong ?? null,
    }))
}

function toLineData(settings: SiteSetting | null, companyEmail: string): SharedLineData {
  const shared: SharedGroup = settings?.shared ?? {}
  return {
    phone: settings?.phone ?? null,
    phone2: settings?.phone2 ?? null,
    email: settings?.email || companyEmail,
    footerDescription: settings?.footer?.text ?? null,
    phoneLabel: shared.phoneLabel ?? null,
    hours: shared.hours ?? null,
    responsePromise: shared.responsePromise ?? null,
    brandBarSlot: shared.brandBarSlot ?? null,
    headerCta: shared.headerCta ?? null,
    tabBar: shared.tabBar ?? null,
    rail: shared.rail ?? null,
    footerPromises: shared.footerPromises ?? null,
    footerColumns: shared.footerColumns ?? null,
    legalNote: shared.legalNote ?? null,
    contact: shared.contact ?? null,
    about: shared.about ?? null,
  }
}

/**
 * Shared data of one line (spec §4): the company from `CompanyData`, the line from its own
 * `SiteSettings` (already filtered by tenant), published lines and salons. Texts with a
 * `[SZEF…]` / `[Krystian…]` marker never leave here (`stripMarked`). `null` on a fresh database.
 */
type Fact = NonNullable<NonNullable<SharedGroup['contact']>['facts']>[number]

/** Facts of the contact hero pointing to the line's e-mail or phones take them from there. */
function resolveFacts(line: SharedLineData): SharedLineData {
  const facts = line.contact?.facts
  if (!line.contact || !facts) return line
  const from: Record<Fact['kind'], string | null> = {
    text: null,
    email: line.email,
    phone: line.phone,
    phone2: line.phone2,
  }
  const resolved = facts
    .map((fact) => (fact.kind === 'text' ? fact : { ...fact, value: from[fact.kind] }))
    .filter((fact) => Boolean(fact.value))
  return { ...line, contact: { ...line.contact, facts: resolved } }
}

export function toSharedData(
  company: CompanyDatum,
  settings: SiteSetting | null,
): SharedData | null {
  // A marked name or NIP means the company data is not ready — like an unsaved global.
  if (!company.name || hasMarker(company.name) || hasMarker(company.nip)) return null
  // Salons first: the company address is the first salon still shown after the markers.
  const salons = stripMarked(toSalons(company.locations ?? []))
  return {
    company: stripMarked(toCompany(company, salons)),
    line: resolveFacts(stripMarked(toLineData(settings, company.email))),
    lines: stripMarked(toLines(company.lines)),
    salons,
  }
}

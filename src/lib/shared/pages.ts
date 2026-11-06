import { plural } from '../plural'
import type { SharedSalon } from './project'

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

/**
 * `BreadcrumbList` of a shared page (spec §6.1, §6.2), absolute addresses. The `Organization` and
 * a `LocalBusiness` per salon are on every page already (the site layout, `organizationJsonLd`) —
 * a second copy here would give the same `@id` two meanings.
 */
export function pageBreadcrumbsJsonLd(
  origin: string,
  items: readonly { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: origin + path,
    })),
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

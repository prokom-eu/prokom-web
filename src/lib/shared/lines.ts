/**
 * Keys of `CompanyData.lines` (spec §4.1): the four tenants' lines plus Tech (prokomserwis.pl,
 * repo `prokom-system`), Zakopane and the Gaming brand — wider than `tenant/lines`, which lists
 * only the lines with a site in this app.
 */
export const SHARED_LINE_KEYS = [
  'prokom',
  'biznes',
  'instalacje',
  'software',
  'tech',
  'zakopane',
  'gaming',
] as const

export type SharedLineKey = (typeof SHARED_LINE_KEYS)[number]

/** Gaming last, whatever its order in the panel (spec §2.4: brand bar, lines band, menu chips). */
export function withGamingLast<T extends { key: SharedLineKey }>(lines: readonly T[]): T[] {
  return [
    ...lines.filter((line) => line.key !== 'gaming'),
    ...lines.filter((line) => line.key === 'gaming'),
  ]
}

/**
 * Domains of all PRO-KOM lines, here and in the other repos (Tech, Gaming) — the links that carry
 * the theme choice (`lib/shared/themeCarry`, ADR-028 pkt 5). `www.` and `staging.` hosts count too.
 */
export const LINE_DOMAINS = [
  'pro-kom.eu',
  'prokombiznes.pl',
  'prokominstalacje.pl',
  'prokomsoftware.pl',
  'prokomserwis.pl',
  'prokomgaming.pl',
] as const

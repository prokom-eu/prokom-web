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

import type { Partner } from '@/payload-types'

export type PartnerBadge = { label: string; kind: 'partner' | 'service' }

/** „A”, „A i B”, „A, B i C”. */
export const joinNames = (names: readonly string[]) =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} i ${names.at(-1)}`

/** Names in the order K4-FINAL §1 writes them („Posnet i Elzab”, „GoPOS i InsERT”), the rest after. */
const K4_ORDER = ['posnet', 'elzab', 'gopos', 'insert']
const k4Rank = (name: string) => {
  const rank = K4_ORDER.indexOf(name.toLowerCase())
  return rank === -1 ? K4_ORDER.length : rank
}
const byK4Order = <T extends { name: string }>(items: readonly T[]) =>
  [...items].sort((a, b) => k4Rank(a.name) - k4Rank(b.name))

/**
 * Status badges of the footer: "Autoryzowany partner GoPOS" for each partner, one
 * "Autoryzowany serwis Posnet i Elzab" for the authorized services (K4-FINAL §1: full wording). Only statuses confirmed in the
 * panel ([SZEF], spec. §13) — a brand without a status gets no badge.
 */
export function partnerBadges(
  partners: { name: string; status: Partner['partnerStatus'] }[],
): PartnerBadge[] {
  // The panel's list is alphabetical („Elzab i Posnet”); the badges follow K4-FINAL §1 (audit 01.11).
  const ordered = byK4Order(partners)
  const partnerNames = ordered.filter((p) => p.status === 'authorized-partner')
  const services = ordered.filter((p) => p.status === 'authorized-service').map((p) => p.name)
  return [
    ...partnerNames.map((p) => ({
      label: `Autoryzowany partner ${p.name}`,
      kind: 'partner' as const,
    })),
    ...(services.length
      ? [{ label: `Autoryzowany serwis ${joinNames(services)}`, kind: 'service' as const }]
      : []),
  ]
}

/**
 * Badge of one partner card (home page systems, B7b): the status confirmed in the panel
 * ([SZEF]), never a free text — `none` or no status → no badge.
 */
export function partnerStatusLabel(status: Partner['partnerStatus'] | null | undefined) {
  if (status === 'authorized-partner') return 'Autoryzowany partner'
  if (status === 'authorized-service') return 'Autoryzowany serwis'
  // K4-FINAL §1: Optivendi and COMEX — never „Autoryzowany”.
  if (status === 'partner') return 'Partner'
  if (status === 'cooperation') return 'We współpracy'
  return null
}

/**
 * Status per partner name (the Biznes phone menu, M1′): only statuses confirmed in the panel,
 * in their full wording (`partnerStatusLabel`); partners without one are left out.
 */
export function partnerStatusesByName(
  partners: { name: string; status: Partner['partnerStatus'] | null | undefined }[],
): Record<string, string> {
  return Object.fromEntries(
    partners.flatMap(({ name, status }) => {
      const label = partnerStatusLabel(status)
      return label ? [[name, label]] : []
    }),
  )
}

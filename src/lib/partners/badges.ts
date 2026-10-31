import type { Partner } from '@/payload-types'

export type PartnerBadge = { label: string; kind: 'partner' | 'service' }

/** „A”, „A i B”, „A, B i C”. */
export const joinNames = (names: readonly string[]) =>
  names.length < 2 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} i ${names.at(-1)}`

/**
 * Status badges of the footer: "Autoryzowany partner GoPOS" for each partner, one
 * "Autoryzowany serwis Posnet i Elzab" for the authorized services (K4-FINAL §1: full wording). Only statuses confirmed in the
 * panel ([SZEF], spec. §13) — a brand without a status gets no badge.
 */
export function partnerBadges(
  partners: { name: string; status: Partner['partnerStatus'] }[],
): PartnerBadge[] {
  const partnerNames = partners.filter((p) => p.status === 'authorized-partner')
  const services = partners.filter((p) => p.status === 'authorized-service').map((p) => p.name)
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

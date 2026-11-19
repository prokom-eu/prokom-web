import type { Partner } from '@/payload-types'

import { brandLogo } from '../catalog/brandLogo'
import { isHttpsUrl } from '../site/link'
import type { IndexLogo } from '../catalog/catalogIndex'
import { partnerStatusLabel } from './badges'

/**
 * Partner networks (runda 1811, D4): partners that are a network of shops, not a brand of
 * products — no salon, no products, never among the brands of the strips or /marki tiles. They
 * stand next to the authorisations as their own group („Sieci partnerskie”) and are not counted
 * in them (decision of Krystian 18.11). The record is a normal `partners` row (slug below).
 */
export const PARTNER_NETWORKS: readonly string[] = ['alsen']

export const isPartnerNetwork = (slug: string | null | undefined) =>
  !!slug && PARTNER_NETWORKS.includes(slug.toLowerCase())

export type PartnerNetwork = {
  slug: string
  name: string
  /** The network's own site (opens in a new tab); `null` when the panel has no https address. */
  website: string | null
  logo: IndexLogo
  /** The status confirmed in the panel, in full wording („Autoryzowany partner”). */
  status: string
}

/** Networks of a tenant's partners: only with the confirmed status and a logo, in their order. */
export function partnerNetworks(partners: readonly Partner[]): PartnerNetwork[] {
  return partners.flatMap((partner) => {
    if (!isPartnerNetwork(partner.slug)) return []
    const status = partnerStatusLabel(partner.partnerStatus)
    const logo = brandLogo(partner)
    if (!status || !logo) return []
    const website = partner.website && isHttpsUrl(partner.website) ? partner.website : null
    return [{ slug: partner.slug!, name: partner.name, website, logo, status }]
  })
}

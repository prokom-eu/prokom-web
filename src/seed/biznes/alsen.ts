import { readFile } from 'fs/promises'
import path from 'path'

import type { Partner } from '../../payload-types'

/**
 * ALSEN (runda 1811, D4): PRO-KOM is an authorised partner of the ALSEN network (decision of
 * Krystian 18.11.2026). A shared `partners` record shown on Biznes and pro-kom.eu — a network,
 * not a product brand: no salon, no page (`brandPage.hasPage: false`), never in the brand tiles.
 */
export const ALSEN = {
  name: 'ALSEN',
  slug: 'alsen',
  website: 'https://www.alsen.pl/',
  partnerStatus: 'authorized-partner',
} as const

/** Logo from Krystian (cropped PNG); TODO(krystian): the vector from ALSEN's partner materials. */
export const ALSEN_LOGO = {
  source: path.join('seed', 'partnerzy', 'alsen.png'),
  uploadName: 'alsen-logo.png',
  mimetype: 'image/png',
} as const

type Stored = Pick<Partner, 'website' | 'partnerStatus' | 'filename' | 'tenants' | 'brandPage'>

/** Fields the import writes (a new record gets all of them). */
export type AlsenData = Partial<Pick<Partner, 'name' | 'slug' | 'website' | 'partnerStatus'>> & {
  brandPage?: Partner['brandPage']
  tenants?: number[]
}

const idOf = (value: number | { id: number }) => (typeof value === 'number' ? value : value.id)

/**
 * What the import writes on the ALSEN record: the status and „no page” always (package wins),
 * the site only while the panel has none, the tenants added (others kept), the logo only while
 * the record has no file (a file chosen in the panel stays). `null` when nothing changes.
 */
export function alsenChanges(
  existing: Stored | null,
  tenantIds: readonly number[],
): { data: AlsenData; uploadLogo: boolean } | null {
  if (!existing) {
    return {
      data: { ...ALSEN, brandPage: { hasPage: false }, tenants: [...tenantIds] },
      uploadLogo: true,
    }
  }
  const stored = (existing.tenants ?? []).map(idOf)
  const tenants = [...new Set([...stored, ...tenantIds])]
  const data: AlsenData = {}
  if (existing.partnerStatus !== ALSEN.partnerStatus) data.partnerStatus = ALSEN.partnerStatus
  if (!existing.website) data.website = ALSEN.website
  if (existing.brandPage?.hasPage) data.brandPage = { ...existing.brandPage, hasPage: false }
  if (tenants.length !== stored.length) data.tenants = tenants
  const uploadLogo = !existing.filename
  return Object.keys(data).length > 0 || uploadLogo ? { data, uploadLogo } : null
}

export async function readAlsenLogo() {
  const data = await readFile(ALSEN_LOGO.source)
  return { data, mimetype: ALSEN_LOGO.mimetype, name: ALSEN_LOGO.uploadName, size: data.length }
}

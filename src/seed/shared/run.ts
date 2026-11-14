import type { Payload } from 'payload'

import type { Line } from '../../lib/tenant/lines'
import { hasSameValues } from '../compare'
import { SEED_CONTEXT } from '../config'
import { BIZNES_SHARED } from './biznes'
import { SHARED_COMPANY } from './company'
import { INSTALACJE_SHARED } from './instalacje'
import { PROKOM_SHARED } from './prokom'
import { SOFTWARE_SHARED } from './software'
import type { SharedGroup } from './types'

type Count = (name: string, result: boolean | 'updated') => void

/** The `shared` group seeded for each line with a site of its own (spec §6.3). */
export const LINE_SHARED: Partial<Record<Line, SharedGroup>> = {
  biznes: BIZNES_SHARED,
  instalacje: INSTALACJE_SHARED,
  software: SOFTWARE_SHARED,
  prokom: PROKOM_SHARED,
}

const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const

/**
 * Shared data of the company and of one line (D1, spec §4): `CompanyData` from
 * `shared/company.ts` and the line's `SiteSettings.shared`. Each record is written only when a
 * value differs, so a second run changes nothing; values the package does not set (e.g. holidays
 * added in the panel) stay. Runs at the end of each line's import, after its settings exist.
 */
export async function seedSharedData(
  payload: Payload,
  line: Line,
  tenantId: number,
  count: Count,
): Promise<void> {
  const company = await payload.findGlobal({ slug: 'company-data', ...local })
  const companySame = hasSameValues(company, SHARED_COMPANY)
  count('company-data shared', companySame ? false : 'updated')
  if (!companySame) {
    await payload.updateGlobal({ slug: 'company-data', data: SHARED_COMPANY, ...local })
  }

  const shared = LINE_SHARED[line]
  if (!shared) return
  const {
    docs: [settings],
  } = await payload.find({
    collection: 'site-settings',
    where: { tenant: { equals: tenantId } },
    limit: 1,
    ...local,
  })
  if (!settings) {
    count('site-settings shared (no settings)', false)
    return
  }
  const same = hasSameValues(settings.shared, shared)
  count('site-settings shared', same ? false : 'updated')
  if (!same) {
    await payload.update({
      collection: 'site-settings',
      id: settings.id,
      data: { shared },
      ...local,
    })
  }
}

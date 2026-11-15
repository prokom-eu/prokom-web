import type { Payload } from 'payload'

import type { CompanyDatum } from '../payload-types'
import { hasSameValues } from './compare'
import { SEED_CONTEXT } from './config'

type Count = (name: string, result: boolean | 'updated') => void

/**
 * `SEED_KEEP_COMPANY_DATA=1` — a line import into production (ADR-027,
 * `scripts/prod-line-content.sh`): the shared company data belongs to every live line there and
 * is edited in the production panel, so the import leaves it as it is.
 */
export function companyDataKept(env: Record<string, string | undefined> = process.env): boolean {
  return env.SEED_KEEP_COMPANY_DATA === '1'
}

/**
 * Writes `data` to the global `company-data` only when a value differs (a second run changes
 * nothing). Kept (production): never writes, the report says whether the package differs.
 */
export async function writeCompanyData(
  payload: Payload,
  data: Partial<CompanyDatum>,
  name: string,
  count: Count,
): Promise<void> {
  const local = { overrideAccess: true, context: SEED_CONTEXT, depth: 0 } as const
  const company = await payload.findGlobal({ slug: 'company-data', ...local })
  const same = hasSameValues(company, data)
  if (companyDataKept()) {
    count(same ? `${name} (kept)` : `${name} (kept, differs)`, false)
    return
  }
  count(name, same ? false : 'updated')
  if (!same) await payload.updateGlobal({ slug: 'company-data', data, ...local })
}

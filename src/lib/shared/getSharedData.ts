import { cache } from 'react'

import { getCompanyDoc, getSiteSettingsDoc } from '../site/data'
import { type SharedData, toSharedData } from './project'

export type { SharedData } from './project'

/**
 * The one loader of shared data (spec §4, ADR-022): company, the line of `tenantId`, published
 * lines and salons. It reuses the cached documents of `getCompanyData` / `getSiteSettings`, so a
 * page that uses both runs each query once. Shared components get its result through props.
 */
export const getSharedData = cache(async (tenantId: number): Promise<SharedData | null> => {
  const [company, settings] = await Promise.all([getCompanyDoc(), getSiteSettingsDoc(tenantId)])
  return toSharedData(company, settings?.doc ?? null)
})

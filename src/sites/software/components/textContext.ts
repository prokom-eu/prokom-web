import { getEnv } from '@/lib/env'
import { getSoftwareFacts } from '@/lib/software/data'
import type { TextContext } from '@/lib/software/facts'

/**
 * Facts of the tenant for `fillText` in texts without solution prices; on production a text with
 * a missing value is not shown (ADR-014 §1.4).
 */
export async function softwareTextContext(tenantId: number): Promise<TextContext> {
  return {
    tenantId,
    facts: await getSoftwareFacts(tenantId),
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
}

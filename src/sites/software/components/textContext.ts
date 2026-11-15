import { getEnv } from '@/lib/env'
import { getSoftwareFacts, getSolutionsIndex } from '@/lib/software/data'
import type { TextContext } from '@/lib/software/facts'

/**
 * Facts of the tenant and the „od” prices and terms of its published solutions for `fillText`
 * (`[KLUCZ]`, `{cena:<slug>}`, `{termin:<slug>}` — decyzja 10: one price change in the panel
 * changes every text); on production a text with a missing value is not shown (ADR-014 §1.4).
 */
export async function softwareTextContext(tenantId: number): Promise<TextContext> {
  const [facts, index] = await Promise.all([
    getSoftwareFacts(tenantId),
    getSolutionsIndex(tenantId),
  ])
  return {
    tenantId,
    facts,
    prices: Object.fromEntries(index.solutions.map((s) => [s.slug, s.priceFrom])),
    terms: Object.fromEntries(index.solutions.map((s) => [s.slug, s.leadTime])),
    strict: getEnv().SITE_ENV === 'production',
  }
}

import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSoftwareWizard, getSolutionsIndex } from '@/lib/software/data'
import { parseParams, type WizardSolution } from '@/lib/software/wizard/flow'
import { wizardSolutionSlugs } from '@/lib/software/wizard/schema'

import type { WizardProps } from './Wizard'

/**
 * What the wizard island needs, prepared on the server for one Software tenant — the same for
 * `/dobierz` and the `#dobierz` section of the start page: the v3 rules, the published solutions
 * the kinds point to, the steps preset by the link and a fresh form token. `null` while the panel
 * has no valid rules (no wizard to show).
 */
export async function loadWizardProps(
  tenantId: number,
  query: Record<string, string | string[] | undefined> = {},
): Promise<Omit<WizardProps, 'headingLevel'> | null> {
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [rules, index] = await Promise.all([
    getSoftwareWizard(tenantId),
    getSolutionsIndex(tenantId),
  ])
  if (!rules) return null
  const wanted = new Set(wizardSolutionSlugs(rules))
  const solutions: WizardSolution[] = index.solutions
    .filter((solution) => wanted.has(solution.slug))
    .map(({ slug, name, priceFrom, leadTime, priceMonthly, features }) => ({
      slug,
      name,
      priceFrom,
      leadTime,
      priceMonthly,
      features,
    }))
  return {
    rules,
    solutions,
    initial: parseParams(rules, query),
    formToken: issueFormToken(getEnv().PAYLOAD_SECRET),
  }
}

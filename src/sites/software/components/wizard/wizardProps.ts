import { connection } from 'next/server'

import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareFacts, getSoftwareWizard, getSolutionsIndex } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import { wizardSolutionSlugs } from '@/lib/software/wizard'
import { fillWizardTexts, parseWizardParams, type WizardSolution } from '@/lib/software/wizardFlow'

import type { WizardProps } from './Wizard'

/**
 * What the wizard island needs, prepared on the server for one Software tenant — the same for
 * `/dobierz` and the `#dobierz` section of the start page (spec. §4 pkt 7): rules with facts,
 * prices of the published solutions the results point to, the preset steps and a fresh form
 * token. `null` while the panel has no valid rules (no wizard to show).
 */
export async function loadWizardProps(
  tenantId: number,
  query: Record<string, string | string[] | undefined> = {},
): Promise<Omit<WizardProps, 'headingLevel'> | null> {
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [rules, index, facts, settings] = await Promise.all([
    getSoftwareWizard(tenantId),
    getSolutionsIndex(tenantId),
    getSoftwareFacts(tenantId),
    getSiteSettings(tenantId),
  ])
  if (!rules) return null

  // `{cena:<slug>}` / `{termin:<slug>}` in the rules (shop hint, sentences) — published only.
  const context: TextContext = {
    tenantId,
    facts,
    prices: Object.fromEntries(index.solutions.map((s) => [s.slug, s.priceFrom])),
    terms: Object.fromEntries(index.solutions.map((s) => [s.slug, s.leadTime])),
    strict: getEnv().SITE_ENV === 'production',
  }
  // Only the solutions the results and add-ons are priced with, published on this site.
  const wanted = new Set(wizardSolutionSlugs(rules))
  const solutions: Record<string, WizardSolution> = Object.fromEntries(
    index.solutions
      .filter((solution) => wanted.has(solution.slug))
      .map(({ slug, name, priceFrom, leadTime, priceMonthly, levels }) => [
        slug,
        {
          name,
          priceFrom,
          leadTime,
          priceMonthly,
          levels: levels.map((level) => ({ name: level.name, price: level.price })),
        },
      ]),
  )
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  return {
    rules: fillWizardTexts(rules, (text) => fillText(text, context)),
    solutions,
    initial: parseWizardParams(rules, query),
    formToken: issueFormToken(getEnv().PAYLOAD_SECRET),
    phone: phone && tel ? { label: phone, href: tel } : null,
  }
}

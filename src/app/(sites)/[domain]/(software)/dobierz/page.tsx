import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { getSoftwareFacts, getSoftwareWizard, getSolutionsIndex } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import { wizardSolutionSlugs } from '@/lib/software/wizard'
import {
  fillWizardTexts,
  parseWizardParams,
  WIZARD_PATH,
  type WizardSolution,
} from '@/lib/software/wizardFlow'
import { Wizard } from '@/sites/software/components/wizard/Wizard'

import { requestOrigin, requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Dobierz rozwiązanie w 60 sekund'
// TODO(krystian): opis meta /dobierz (spec. §9 — `TODO`, SW12); dziś lead kreatora z planszy.
const DESCRIPTION =
  'Kliknij kilka razy i zobacz, co dla Ciebie zbudujemy: rozwiązanie, cena wybranej wersji, termin i podgląd. Wycena na piśmie, gdy zechcesz.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'software')
  const origin = await requestOrigin()
  return {
    title: TITLE,
    description: DESCRIPTION,
    // The parameters only preset steps: one address for search engines.
    alternates: { canonical: `${origin}${WIZARD_PATH}` },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: `${origin}${WIZARD_PATH}`,
      title: TITLE,
      description: DESCRIPTION,
    },
  }
}

/**
 * The wizard `/dobierz` (spec. §6.3, board `Kreator`): rules, prices of the results and the
 * form token on the server; the steps, the preview and the form are one client island. The
 * parameters `?potrzeba=`, `?firma=` and `?tryb=opis` preset steps; unknown ones are ignored.
 */
export default async function WizardPage({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'software')
  // The token carries the render time (minimum fill time): never from a cache.
  await connection()
  const [rules, index, facts, settings, query] = await Promise.all([
    getSoftwareWizard(tenant.id),
    getSolutionsIndex(tenant.id),
    getSoftwareFacts(tenant.id),
    getSiteSettings(tenant.id),
    searchParams,
  ])
  // No valid rules in the panel yet: there is no wizard to show.
  if (!rules) notFound()

  const context: TextContext = {
    tenantId: tenant.id,
    facts,
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
  // Only the solutions the results are priced with, published on this site.
  const wanted = new Set(wizardSolutionSlugs(rules))
  const solutions: Record<string, WizardSolution> = Object.fromEntries(
    index.solutions
      .filter((solution) => wanted.has(solution.slug))
      .map(({ slug, name, prices, leadTimes, priceMonthly }) => [
        slug,
        { name, prices, leadTimes, priceMonthly },
      ]),
  )
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  return (
    <div className="overflow-x-clip pt-6 pb-16 sm:pt-10 sm:pb-24">
      <Container wide>
        <nav aria-label="Okruszki" className="mb-6 text-sm text-ink-2">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:text-ink hover:underline">
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href={WIZARD_PATH} aria-current="page" className="text-ink">
                Dobierz rozwiązanie
              </Link>
            </li>
          </ol>
        </nav>
        <Wizard
          rules={fillWizardTexts(rules, (text) => fillText(text, context))}
          solutions={solutions}
          initial={parseWizardParams(rules, query)}
          formToken={issueFormToken(getEnv().PAYLOAD_SECRET)}
          phone={phone && tel ? { label: phone, href: tel } : null}
          headingLevel="h1"
        />
      </Container>
    </div>
  )
}

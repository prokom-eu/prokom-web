import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { robotsMeta } from '@/lib/seo/robots'
import { SOFTWARE_ROUTE_DESCRIPTIONS } from '@/lib/software/meta'
import { WIZARD_PATH } from '@/lib/software/wizardFlow'
import { Wizard } from '@/sites/software/components/wizard/Wizard'
import { loadWizardProps } from '@/sites/software/components/wizard/wizardProps'

import { requestOrigin, requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Dobierz rozwiązanie w 60 sekund'
const DESCRIPTION = SOFTWARE_ROUTE_DESCRIPTIONS.wizard

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
  const props = await loadWizardProps(tenant.id, await searchParams)
  // No valid rules in the panel yet: there is no wizard to show.
  if (!props) notFound()

  return (
    // `data-final-cta`: the wizard is the page's CTA — the footer drops its CTA band (SWR2).
    <div data-final-cta className="overflow-x-clip pt-6 pb-16 sm:pt-10 sm:pb-24">
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
        <Wizard {...props} headingLevel="h1" />
      </Container>
    </div>
  )
}

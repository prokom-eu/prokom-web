import { EmText } from '@/sites/software/components/ui/EmText'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { SOFTWARE_ROUTE_DESCRIPTIONS } from '@/lib/software/meta'
import { WIZARD_PATH } from '@/lib/software/wizard/flow'
import { Glass } from '@/sites/software/components/ui/Glass'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'
import { Wizard } from '@/sites/software/components/wizard/WizardLazy'
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
  const [origin, settings] = await Promise.all([requestOrigin(), getSiteSettings(tenant.id)])
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
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * The wizard `/dobierz` (v3, ZMIANY-v24 §7 and §9.5, board `AU-kreator`): the hero with the H1,
 * the wizard without a second heading, „Cztery kroki do startu”. Rules, the kinds' solutions and the form token on the
 * server; the steps, the live card and the form are one client island. The parameters `?firma=`,
 * `?rodzaj=` and `?tryb=opis` preset steps; unknown ones are ignored.
 */
export default async function WizardPage({ params, searchParams }: Props) {
  const tenant = await requireLine(params, 'software')
  const props = await loadWizardProps(tenant.id, await searchParams)
  // No valid rules in the panel yet: there is no wizard to show.
  if (!props) notFound()

  const { page } = props.rules
  return (
    // The band „Zacznij od podglądu” follows the wizard (board AU-kreator, ZMIANY-v24 §3.5).
    <div className="overflow-x-clip pt-6 pb-16 sm:pt-10 sm:pb-24">
      <Container wide>
        <nav aria-label="Okruszki" className="mb-6 text-sm text-ink-2">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="inline-flex min-h-6 items-center hover:text-ink hover:underline"
              >
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link
                href={WIZARD_PATH}
                aria-current="page"
                className="inline-flex min-h-6 items-center text-ink"
              >
                Kreator
              </Link>
            </li>
          </ol>
        </nav>
        <SectionHead
          level="h1"
          eyebrow={page.eyebrow ?? props.rules.ui.eyebrow}
          title={page.title}
          em={page.em}
          lead={page.lead}
          // The board sets the H1 in two lines at 1440 px: wider than a section head.
          className="mb-8 max-w-[1100px]!"
        />
        <Wizard {...props} headingLevel="h1" head={false} />
        <section aria-labelledby="cztery-kroki" className="mt-24">
          {page.stepsEyebrow && <p className="sw-eyebrow text-center">{page.stepsEyebrow}</p>}
          <h2 id="cztery-kroki" className="sw-h2 mt-4 text-center">
            <EmText text={page.stepsTitle} />
          </h2>
          <ol className="wz-four">
            {page.steps.map((item, i) => (
              <Glass as="li" key={item.title}>
                <b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Glass>
            ))}
          </ol>
        </section>
      </Container>
    </div>
  )
}

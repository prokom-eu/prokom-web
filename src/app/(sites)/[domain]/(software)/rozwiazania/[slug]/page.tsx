import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import {
  breadcrumbJsonLd,
  serializeJsonLd,
  serviceJsonLd,
  SOFTWARE_AREA_SERVED,
} from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { CATALOG_PATH } from '@/lib/software/catalog'
import { getSoftwareFacts, getSolutionPage } from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { fitTitle, richDescription } from '@/lib/software/meta'
import { WIZARD_PATH } from '@/lib/software/wizardFlow'
import { ContactBlock } from '@/sites/software/components/ContactBlock'
import { FaqSection } from '@/sites/software/components/FaqSection'
import { FieldCrewDemo } from '@/sites/software/components/solution/FieldCrewDemo'
import {
  SolutionCompare,
  SolutionHero,
  SolutionHowItWorks,
  SolutionOffer,
} from '@/sites/software/components/solution/SolutionSections'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

// A short card lead gets the price, term and place (audyt 01.11 P2: 120–155 characters).
const description = (lead: string | null, name: string) =>
  richDescription(lead ?? `${name} — podgląd na żywo i zakres w cenie.`)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'software')
  const { slug } = await params
  const [page, settings, origin] = await Promise.all([
    getSolutionPage(tenant.id, slug),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  if (!page) return {}
  const url = `${origin}${CATALOG_PATH}/${page.slug}`
  const title = page.title.accent
    ? fitTitle(`${page.name}. ${page.title.accent}`, page.name)
    : page.name
  return {
    title,
    description: description(page.lead, page.name),
    alternates: { canonical: url },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url,
      title,
      description: description(page.lead, page.name),
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Solution page `/rozwiazania/[slug]` (spec. §6.1, board `Rozwiazanie`, `stany/89a`): only a
 * solution published in this tenant (`getSolutionPage` filters by both), otherwise 404. With
 * `Solutions.page` texts — the board's full page with the demo; without — the template from the
 * card and the offer window. Ends with one contact block (§6.0).
 */
export default async function SolutionPage({ params }: Props) {
  const tenant = await requireLine(params, 'software')
  const { slug } = await params
  const [page, facts, settings, origin] = await Promise.all([
    getSolutionPage(tenant.id, slug),
    getSoftwareFacts(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  if (!page) notFound()

  const strict = getEnv().SITE_ENV === 'production'
  const fill = (value: string) =>
    fillText(value, { tenantId: tenant.id, facts, prices: {}, strict })
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  const url = `${origin}${CATALOG_PATH}/${page.slug}`

  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Strona główna', url: `${origin}/` },
      { name: 'Pełna oferta', url: `${origin}${CATALOG_PATH}` },
      { name: page.name, url },
    ]),
    serviceJsonLd({
      name: page.name,
      description: page.lead ?? undefined,
      url,
      provider: tenant.name,
      priceFrom: page.priceFrom,
      areaServed: SOFTWARE_AREA_SERVED,
    }),
  ]

  return (
    <>
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <div className="overflow-x-clip">
        <SolutionHero page={page} />
        {page.demo && (
          <div className="mx-auto w-full max-w-[1320px] px-4 min-[641px]:px-6">
            <FieldCrewDemo demo={page.demo} project={{ id: page.slug, name: page.projectName }} />
          </div>
        )}
        <SolutionHowItWorks page={page} />
        <SolutionCompare page={page} />
        <SolutionOffer page={page} />
        <FaqSection
          id="pytania"
          eyebrow={page.faq.eyebrow}
          heading="Zanim zapytasz"
          lead={
            <>
              Nie ma Twojego?{' '}
              <Link
                href="/kontakt"
                className="font-extrabold text-accent-text underline-offset-4 hover:underline"
              >
                Napisz
              </Link>
              , odpowiadamy konkretnie.
            </>
          }
          aside={
            <Link
              href={WIZARD_PATH}
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
            >
              Policz cały projekt w kreatorze
            </Link>
          }
          items={page.faq.items}
        />
      </div>
      <ContactBlock
        eyebrow={page.contact.eyebrow}
        title={page.contact.title}
        lead={
          page.contact.lead ??
          fill(
            'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Uczciwie powiemy też, czego nie warto budować.',
          )
        }
        quoteCaption={
          page.contact.quoteCaption ?? fill('Opisz problem, odpiszemy w ciągu [CZAS ODPOWIEDZI]')
        }
        phone={
          settings?.phone && tel
            ? { label: settings.phone, href: tel, caption: fill('[GODZINY] · [ADRES]') }
            : null
        }
      />
    </>
  )
}

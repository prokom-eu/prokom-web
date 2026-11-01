import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { fitTitle, richDescription } from '@/lib/software/meta'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { CATALOG_PATH } from '@/lib/software/catalog'
import {
  getIndustryPage,
  getOfferViews,
  getSoftwareFacts,
  getSolutionsIndex,
} from '@/lib/software/data'
import { fillText } from '@/lib/software/facts'
import { industryPageHref } from '@/lib/software/industryPage'
import { FaqSection } from '@/sites/software/components/FaqSection'
import { IndustryCards } from '@/sites/software/components/industry/IndustryCards'
import {
  IndustryContact,
  IndustryHero,
  OfflineBox,
} from '@/sites/software/components/industry/IndustrySections'
import { ProblemsExplorer } from '@/sites/software/components/industry/ProblemsExplorer'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; branza: string }> }

const titleOf = (page: { title: { plain: string; accent: string | null } }) =>
  [page.title.plain, page.title.accent].filter(Boolean).join(' ')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'software')
  const { branza } = await params
  const [page, settings, origin] = await Promise.all([
    getIndustryPage(tenant.id, branza),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  if (!page) return {}
  const url = `${origin}${industryPageHref(page.slug)}`
  const title = fitTitle(
    `${page.name}: oprogramowanie dla branży`,
    `${page.name} — systemy i strony`,
  )
  const description = richDescription(page.lead ?? titleOf(page), { priced: false })
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url,
      title,
      description,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Industry page `/dla-branz/[branza]` (spec. §6.2, board `Branza` v22): only an active industry
 * of this tenant with its own texts, otherwise 404. Hero with the modules → problems with the
 * answer → „Działa bez zasięgu” → six solution cards (offer window) → questions (`FAQPage`) →
 * dark contact. No section „W 60 sekund” (v22 board; decision 31.10): the hero opens the wizard.
 */
export default async function IndustryPage({ params }: Props) {
  const tenant = await requireLine(params, 'software')
  const { branza } = await params
  const [page, index, offers, facts, settings, origin] = await Promise.all([
    getIndustryPage(tenant.id, branza),
    getSolutionsIndex(tenant.id),
    getOfferViews(tenant.id),
    getSoftwareFacts(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  if (!page) notFound()

  const strict = getEnv().SITE_ENV === 'production'
  const fill = (value: string) =>
    fillText(value, { tenantId: tenant.id, facts, prices: {}, strict })
  const tel = settings?.phone ? toTelHref(settings.phone) : null
  // Only the windows of these cards and of their „Dobrze łączy się z” (the window switches to
  // them) go to the browser, not all the tenant's solutions.
  const cardSlugs = page.solutions.items.map((card) => card.slug)
  const windowSlugs = new Set(
    cardSlugs.flatMap((slug) => [slug, ...(offers[slug]?.related ?? []).map((card) => card.slug)]),
  )
  const cardOffers = Object.fromEntries(
    [...windowSlugs].flatMap((slug) => {
      const view = offers[slug]
      return view ? [[slug, view] as const] : []
    }),
  )

  const jsonLd = breadcrumbJsonLd([
    { name: 'Strona główna', url: `${origin}/` },
    { name: 'Branże', url: null },
    { name: page.name, url: `${origin}${industryPageHref(page.slug)}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <IndustryHero page={page} />

      <section
        id="problemy"
        aria-labelledby="problemy-h"
        className="scroll-mt-24 py-12 min-[641px]:py-20"
      >
        <Container wide>
          <div className="grid gap-4 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] min-[1081px]:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
                {page.problems.eyebrow}
              </p>
              <h2
                id="problemy-h"
                className="mt-2 font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-5xl min-[1081px]:text-[56px]"
              >
                Kliknij swój problem, a pokażemy, co na to mamy
              </h2>
            </div>
            {page.problems.lead && (
              <p className="text-lg text-ink-2 min-[641px]:text-xl">{page.problems.lead}</p>
            )}
          </div>
          <ProblemsExplorer problems={page.problems.items} />
        </Container>
      </section>

      <OfflineBox page={page} />

      {page.solutions.items.length > 0 && (
        <section aria-labelledby="rozwiazania-h" className="py-12 min-[641px]:py-20">
          <Container wide>
            <div className="flex flex-col gap-4 min-[641px]:flex-row min-[641px]:items-end min-[641px]:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text">
                  {page.solutions.eyebrow}
                </p>
                <h2
                  id="rozwiazania-h"
                  className="mt-2 max-w-[22ch] font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-5xl"
                >
                  Sześć rzeczy, od których zaczynają firmy takie jak Twoja
                </h2>
              </div>
              <Link
                href={CATALOG_PATH}
                className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-card px-5 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
              >
                Pełna oferta →
              </Link>
            </div>
            <IndustryCards
              cards={page.solutions.items}
              display={index.priceDisplay}
              offers={cardOffers}
            />
          </Container>
        </section>
      )}

      <FaqSection
        id="pytania"
        eyebrow={page.faq.eyebrow}
        heading="Zanim zapytasz"
        lead={
          <>
            Nie ma Twojego pytania?{' '}
            <Link
              href="/kontakt"
              className="font-extrabold text-accent-text underline-offset-4 hover:underline"
            >
              Napisz albo zadzwoń
            </Link>
            , odpowiadamy konkretnie.
          </>
        }
        items={page.faq.items}
      />

      <IndustryContact
        page={page}
        phone={
          settings?.phone && tel
            ? { label: settings.phone, href: tel, caption: fill('[GODZINY]') }
            : null
        }
      />
    </>
  )
}

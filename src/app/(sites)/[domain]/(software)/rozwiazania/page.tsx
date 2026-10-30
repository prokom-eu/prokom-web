import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

import { Container } from '@/components/ui/Container'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd, serviceListJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import {
  CATALOG_PATH,
  catalogSeo,
  parseCatalogState,
  type ParamSource,
} from '@/lib/software/catalog'
import { getOfferViews, getSoftwareFacts, getSolutionsIndex } from '@/lib/software/data'
import { fillText, type TextContext } from '@/lib/software/facts'
import { Catalog } from '@/sites/software/components/catalog/Catalog'
import { ContactBlock } from '@/sites/software/components/ContactBlock'

import { requestOrigin, requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Pełna oferta: strony, systemy i aplikacje dla firm'
const LEAD =
  'Zawęź listę do swojej sytuacji i branży. Przy stronach i systemach od razu widzisz cenę „od” i termin, aplikacje i automatyzacje wyceniamy po krótkiej rozmowie. Otwórz kartę, a zobaczysz, co jest w cenie, przykład z życia i termin.'

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'software')
  const [settings, query] = await Promise.all([getSiteSettings(tenant.id), searchParams])
  const seo = catalogSeo(parseCatalogState(query as ParamSource))
  return {
    title: TITLE,
    description: LEAD,
    alternates: { canonical: seo.canonical },
    // Staging stays closed whatever the view; elsewhere a filtered view is not indexed.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (seo.index ? undefined : { index: false, follow: true }),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: seo.canonical,
      title: TITLE,
      description: LEAD,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Catalog `/rozwiazania` (spec. §5, board `Katalog`): the header on the server, the list as a
 * client island reading the same URL; contact block at the end (§6.0). Only published solutions
 * of this tenant (`getSolutionsIndex`).
 */
export default async function SolutionsCatalogPage({ params }: Props) {
  const tenant = await requireLine(params, 'software')
  const [index, offers, facts, settings, origin] = await Promise.all([
    getSolutionsIndex(tenant.id),
    getOfferViews(tenant.id),
    getSoftwareFacts(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])
  const context: TextContext = {
    tenantId: tenant.id,
    facts,
    prices: {},
    strict: getEnv().SITE_ENV === 'production',
  }
  const fill = (value: string) => fillText(value, context)
  const tel = settings?.phone ? toTelHref(settings.phone) : null

  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Strona główna', url: `${origin}/` },
      { name: 'Pełna oferta', url: `${origin}${CATALOG_PATH}` },
    ]),
    serviceListJsonLd({
      name: 'Pełna oferta',
      provider: tenant.name,
      items: index.solutions.map((solution) => ({
        name: solution.name,
        description: solution.lead,
        url: `${origin}${CATALOG_PATH}/${solution.slug}`,
      })),
    }),
  ]

  const hero = (
    <div className="max-w-3xl">
      {/* „Start / Pełna oferta” with spaces, 44 px targets (spec. §5, v21). */}
      <nav aria-label="Okruszki" className="text-sm text-ink-2">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center px-1 hover:text-ink hover:underline"
            >
              Start
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={CATALOG_PATH}
              aria-current="page"
              className="inline-flex min-h-11 items-center px-1 text-ink"
            >
              Pełna oferta
            </Link>
          </li>
        </ol>
      </nav>
      <p className="mt-4 text-sm font-extrabold uppercase tracking-[0.14em] text-accent-text">
        Pełna oferta
      </p>
      <h1 className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight sm:text-6xl">
        Cała oferta, <span className="text-grad-h1">z&nbsp;ceną i&nbsp;terminem.</span>
      </h1>
      <p className="mt-5 text-lg text-ink-2 sm:text-xl">{LEAD}</p>
    </div>
  )

  return (
    <>
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <div className="overflow-x-clip pt-8 sm:pt-12">
        <Container wide>
          {/* `useSearchParams` in the island: the shell around it renders without waiting. */}
          <Suspense fallback={hero}>
            <Catalog index={index} offers={offers} hero={hero} />
          </Suspense>
        </Container>
      </div>
      <ContactBlock
        lead={fill(
          'Odpowiadamy w ciągu [CZAS ODPOWIEDZI]. Uczciwie powiemy też, czego nie warto budować.',
        )}
        quoteCaption={fill('Opisz problem, odpiszemy w ciągu [CZAS ODPOWIEDZI]')}
        phone={
          settings?.phone && tel
            ? { label: settings.phone, href: tel, caption: fill('[GODZINY] · [ADRES]') }
            : null
        }
      />
    </>
  )
}

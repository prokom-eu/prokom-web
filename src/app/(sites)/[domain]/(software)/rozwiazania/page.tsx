import type { Metadata } from 'next'
import { connection } from 'next/server'

import { Icon } from '@/components/ui/Icon'
import { getEnv } from '@/lib/env'
import type { IconName } from '@/lib/catalog/options'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd, serviceListJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import {
  CATALOG_PATH,
  catalogSeo,
  parseCatalogState,
  type ParamSource,
} from '@/lib/software/catalog'
import { getOfferViews, getSolutionsIndex } from '@/lib/software/data'
import { SOFTWARE_ROUTE_DESCRIPTIONS } from '@/lib/software/meta'
import { plural } from '@/lib/plural'
import { Catalog } from '@/sites/software/components/catalog/Catalog'
import { Glass } from '@/sites/software/components/ui/Glass'
import { PageHero } from '@/sites/software/components/ui/PageHero'
import { SectionHead } from '@/sites/software/components/ui/SectionHead'

import { requestOrigin, requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// ≤ 65 characters with „ | PRO-KOM Software” (audyt 01.11 P2).
const TITLE = 'Pełna oferta: strony, systemy, aplikacje'
// Texts of the board (TRESCI-v24 `p_oferta`).
const LEAD =
  'Strony, przebudowy, systemy i automatyzacje dla każdej firmy. Kliknij kategorię albo kartę: zobaczysz, co dostajesz, jak to przebiega i kiedy płacisz.'

/** „Bez dopłat za rzeczy oczywiste”: what every page includes (`p_oferta · wcenie`). */
const INCLUDED: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'phone',
    title: 'Wersja na telefon',
    text: 'Zaprojektowana najpierw na telefon, bo stamtąd wchodzi większość klientów.',
  },
  {
    icon: 'search',
    title: 'SEO i dane dla AI',
    text: 'Opisy, dane o firmie i mapa strony, żeby znalazł Cię Google i asystenci AI.',
  },
  {
    icon: 'panel',
    title: 'Panel po polsku',
    text: 'Ceny, zdjęcia i godziny zmieniasz sam, bez dzwonienia do informatyka.',
  },
  {
    icon: 'shield',
    title: 'SSL i szybkość',
    text: 'Certyfikat bezpieczeństwa i treść na ekranie w mniej niż 2,5 sekundy.',
  },
]

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'software')
  const [settings, query] = await Promise.all([getSiteSettings(tenant.id), searchParams])
  const seo = catalogSeo(parseCatalogState(query as ParamSource))
  return {
    title: TITLE,
    description: SOFTWARE_ROUTE_DESCRIPTIONS.catalog,
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
      description: SOFTWARE_ROUTE_DESCRIPTIONS.catalog,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * „Oferta” `/rozwiazania` (ZMIANY-v24 §6.2, board `AU-oferta`): the subpage hero on the server,
 * the groups, chips and cards as a client island reading the same URL, then „Bez dopłat za
 * rzeczy oczywiste”. Only published solutions of this tenant (`getSolutionsIndex`).
 */
export default async function SolutionsCatalogPage({ params }: Props) {
  // Rendered per request, so the catalog reads the URL on the server: all cards and one H1 in
  // the HTML, no `Suspense` fallback with a second copy of the header (audyt 01.11 P2).
  await connection()
  const tenant = await requireLine(params, 'software')
  const [index, offers, origin] = await Promise.all([
    getSolutionsIndex(tenant.id),
    getOfferViews(tenant.id),
    requestOrigin(),
  ])
  const count = index.solutions.length

  const jsonLd = [
    breadcrumbJsonLd([
      { name: 'Strona główna', url: `${origin}/` },
      { name: 'Oferta', url: `${origin}${CATALOG_PATH}` },
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
    <PageHero
      crumb="Oferta"
      eyebrow={`Pełna oferta · ${count} ${plural(count, ['rozwiązanie', 'rozwiązania', 'rozwiązań'])}`}
      title="Oferta."
      em="Cena i termin przy każdej pozycji."
      lead={LEAD}
    />
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
      <Catalog index={index} offers={offers} hero={hero} />
      <section className="v-sec" aria-labelledby="w-cenie-h">
        <div className="v-wrap">
          <SectionHead
            id="w-cenie-h"
            align="center"
            eyebrow="W cenie każdej strony"
            title="Bez dopłat za rzeczy oczywiste"
            width="max-w-none"
          />
          <ul className="sw-included">
            {INCLUDED.map((item) => (
              <Glass as="li" key={item.title} rise>
                <span className="sw-included-icon" aria-hidden="true">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Glass>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

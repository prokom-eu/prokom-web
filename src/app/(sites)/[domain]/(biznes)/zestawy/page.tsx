import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import {
  BUNDLES_PATH,
  bundleCard,
  bundleHref,
  bundlePhotos,
  listBundles,
} from '@/lib/catalog/bundle'
import { getBundles, getCatalogIndex } from '@/lib/catalog/data'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { BUNDLE_AREAS } from '@/lib/catalog/options'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { plural } from '@/lib/plural'
import { breadcrumbJsonLd, itemListJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { BundleList } from '@/sites/biznes/components/bundle/BundleList'
import { BundlesHero } from '@/sites/biznes/components/bundle/BundleSections'
import { PageLink } from '@/sites/biznes/components/PageLink'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

const TITLE = 'Gotowe zestawy dla firm — sprzęt, program i usługi'
const DESCRIPTION =
  'Zestawy dla sklepu, gastronomii, noclegów, biura, gabinetu i szkoły: sprzęt, program i wdrożenie, które działają razem. Wycena na piśmie.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'biznes')
  const settings = await getSiteSettings(tenant.id)
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: BUNDLES_PATH },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: BUNDLES_PATH,
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Ready bundles `/zestawy` (K3c, spec. §6.10, `k31/screens/Web-Zestawy-1440`): the dark hero and
 * the grid with the area chips. Every bundle shows, „Do sprawdzenia” too (`noindex` on its page);
 * items of hidden cards drop out, a bundle without a required item is not listed.
 */
export default async function BundlesPage({ params }: Props) {
  const tenant = await requireLine(params, 'biznes')
  const [index, all, origin] = await Promise.all([
    getCatalogIndex(tenant.id),
    getBundles(tenant.id),
    requestOrigin(),
  ])
  const products = new Map(index.products.map((product) => [product.slug, product]))
  const bundles = listBundles(all, new Set(products.keys()))
  const cards = bundles.map((bundle) => bundleCard(bundle, products))
  const areas = BUNDLE_AREAS.filter(({ value }) => bundles.some((b) => b.area === value))
  const heroPhotos = [
    ...new Map(
      bundles.flatMap((bundle) => bundlePhotos(bundle, products, 1)).map((p) => [p.url, p]),
    ).values(),
  ].slice(0, 3)

  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Gotowe zestawy', href: BUNDLES_PATH },
  ]
  const jsonLd = [
    itemListJsonLd({
      name: 'Gotowe zestawy',
      items: bundles.map((bundle) => ({
        name: bundle.name,
        url: origin + bundleHref(bundle.slug),
      })),
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BundlesHero
        crumbs={crumbs}
        eyebrow={`${bundles.length} ${plural(bundles.length, ['zestaw', 'zestawy', 'zestawów'])} · ${areas.length} ${plural(areas.length, ['obszar', 'obszary', 'obszarów'])}`}
        photos={heroPhotos}
      />
      <Container wide className="pt-8 pb-14 sm:pt-10 sm:pb-20">
        {cards.length > 0 ? (
          <BundleList bundles={cards} areas={areas.map(({ value, label }) => ({ value, label }))} />
        ) : (
          // No bundle to show (none yet, or their cards hidden): say so, point to the catalog.
          <div className="flex flex-col items-start gap-4 rounded-[26px] bg-surface-2 p-6 sm:p-8">
            <p className="text-lg leading-relaxed text-ink-2">
              Zestawy właśnie przygotowujemy. Sprzęt i programy znajdziesz w katalogu — dobierzemy
              komplet pod Twoją firmę.
            </p>
            <PageLink href={CATALOG_PATH} arrow>
              Przejdź do katalogu
            </PageLink>
          </div>
        )}
      </Container>
    </>
  )
}

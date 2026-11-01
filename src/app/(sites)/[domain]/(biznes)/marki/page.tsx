import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { buildBrandsPage } from '@/lib/catalog/brandsPage'
import { getBrandsPageInput, getCatalogIndex } from '@/lib/catalog/data'
import { BRANDS_PATH } from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, itemListJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { BrandsDirectory } from '@/sites/biznes/components/brand/BrandsDirectory'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'

import { requestOrigin, requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

const TITLE = 'Marki i salony producentów dla firm'
const DESCRIPTION =
  'Posnet, Elzab, GoPOS, InsERT, Lenovo, Dell, Apple i inne: salony marek z doborem modelu, porównaniem serii, wdrożeniem i serwisem w Rabce-Zdroju.'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'biznes')
  const settings = await getSiteSettings(tenant.id)
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: BRANDS_PATH },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: BRANDS_PATH,
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages(settings?.seo.ogImage ?? null, 'biznes'),
    },
  }
}

/**
 * Brands `/marki` (K33 §6, board `Web-Marki`): the dark header with the search and the
 * authorized brands, the group tabs and a tile per brand — to its showroom, own page or the
 * offer filtered by the brand. Groups and their brands come from `BiznesSettings.brands`.
 */
export default async function BrandsPage({ params }: Props) {
  const tenant = await requireLine(params, 'biznes')
  const [index, input, origin] = await Promise.all([
    getCatalogIndex(tenant.id),
    getBrandsPageInput(tenant.id),
    requestOrigin(),
  ])
  const page = buildBrandsPage({ ...input, index })
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Marki', href: BRANDS_PATH },
  ]
  const unique = [
    ...new Map(page.groups.flatMap((g) => g.tiles).map((tile) => [tile.id, tile])).values(),
  ]
  const jsonLd = [
    itemListJsonLd({
      name: 'Marki',
      items: unique.map((tile) => ({ name: tile.name, url: origin + tile.href })),
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Container wide className="pt-6 pb-14 sm:pt-8 sm:pb-20">
        <Breadcrumbs items={crumbs} />
        <BrandsDirectory total={page.total} groups={page.groups} authorized={page.authorized} />
      </Container>
    </>
  )
}

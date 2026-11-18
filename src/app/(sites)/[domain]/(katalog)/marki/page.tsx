import type { Metadata } from 'next'

import { Container } from '@/components/ui/Container'
import { buildBrandsPage } from '@/lib/catalog/brandsPage'
import { getBrandsPageInput, getCatalogIndex, getCatalogTexts } from '@/lib/catalog/data'
import { BRANDS_PATH } from '@/lib/catalog/filters'
import { CATALOG_UI, catalogTextLine } from '@/lib/catalog/texts'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, itemListJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { BrandsDirectory } from '@/sites/biznes/components/brand/BrandsDirectory'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'

import { requestOrigin, requireCatalogTenant } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tenant = await requireCatalogTenant(params)
  const [settings, texts] = await Promise.all([
    getSiteSettings(tenant.id),
    getCatalogTexts(tenant.id, catalogTextLine(tenant.line)),
  ])
  return {
    title: texts.brandsTitle,
    description: texts.brandsDescription,
    alternates: { canonical: BRANDS_PATH },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: BRANDS_PATH,
      title: texts.brandsTitle,
      description: texts.brandsDescription,
      images: ogImages(settings?.seo.ogImage ?? null, tenant.line),
    },
  }
}

/**
 * Brands `/marki` (runda 1411 R7, board `Marki.dc.html`): the dark header with the search, the
 * four authorisations and one grid of the other brands — each to its showroom, own page or the
 * offer filtered by the brand. Biznes: the groups of `BiznesSettings.brands`; Instalacje: all its
 * brands (ADR-029).
 */
export default async function BrandsPage({ params }: Props) {
  const tenant = await requireCatalogTenant(params)
  const [index, input, origin] = await Promise.all([
    getCatalogIndex(tenant.id),
    getBrandsPageInput(tenant.id),
    requestOrigin(),
  ])
  // Instalacje has no brand groups in its settings: one group of all its brands (the page shows
  // the tiles, not the groups); brands without a salon or listed cards drop out in the builder.
  const groups = input.groups.length
    ? input.groups
    : [
        {
          title: '',
          iconPath: null,
          description: null,
          partnerIds: input.partners.map((p) => p.id),
        },
      ]
  const page = buildBrandsPage({ ...input, groups, index })
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Marki', href: BRANDS_PATH },
  ]
  const unique = [...page.authorized, ...page.others]
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
        <BrandsDirectory
          total={page.total}
          authorized={page.authorized}
          others={page.others}
          ui={CATALOG_UI[catalogTextLine(tenant.line)]}
        />
      </Container>
    </>
  )
}

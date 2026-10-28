import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import {
  brandHref,
  brandJsonLd,
  brandPageHref,
  brandProducts,
  brandTitle,
} from '@/lib/catalog/brand'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { DEFAULTS } from '@/lib/catalog/category'
import { getBrandView, getCatalogIndex, getShowroomView } from '@/lib/catalog/data'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { listShowroom, showroomStats } from '@/lib/catalog/showroom'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { pickSource } from '@/lib/media/sizes'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { BrandAbout, BrandHero } from '@/sites/biznes/components/brand/BrandSections'
import { ShowroomBody } from '@/sites/biznes/components/brand/ShowroomBody'
import {
  ShowroomCtaBand,
  ShowroomHero,
  ShowroomServices,
} from '@/sites/biznes/components/brand/ShowroomSections'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { CategoryGrid } from '@/sites/biznes/components/category/CategoryGrid'
import { HowInquiryWorks } from '@/sites/biznes/components/HowInquiryWorks'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** Logo width in JSON-LD: the original file when it is no larger. */
const JSON_LD_LOGO_WIDTH = 600

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { slug } = await params
  if (!isValidSlug(slug)) return { tenant, index: null, brand: null }
  const index = await getCatalogIndex(tenant.id)
  // A page only for a listed brand with `hasPage` (K3-KATALOG §6): Ingenico, PRO-KOM → 404.
  const brand = brandPageHref(index, slug) ? await getBrandView(tenant.id, slug) : null
  return { tenant, index, brand }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, brand } = await load(params)
  if (!brand) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = brandTitle(brand.name, brand.shortDescription)
  const description = brand.shortDescription ?? undefined
  const canonical = brandHref(brand.slug)
  return {
    title,
    description,
    alternates: { canonical },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: canonical,
      title,
      description,
      // `openGraph` of a page replaces the layout's whole: the site's picture, as on the others.
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Brand page `/marki/[slug]` (K3-KATALOG §6, spec. §6.11, `k3/screens/Web-Marka*`): the brand,
 * its description, lines and facts, then its products with a category filter (from 2
 * categories). A brand with a showroom (Lenovo, Dell — K31c, K31-ZMIANY §5) gets it instead:
 * segments, series, the comparison, the wizard, the film of a series and services.
 */
export default async function BrandPage({ params }: Props) {
  const { tenant, index, brand } = await load(params)
  if (!index || !brand) notFound()
  const [settings, origin, showroom] = await Promise.all([
    getSiteSettings(tenant.id),
    requestOrigin(),
    getShowroomView(tenant.id, brand.slug),
  ])
  const callback = settings?.biznes?.promises.callbackTime ?? null

  const products = brandProducts(index, brand.slug)
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
    { name: brand.name, href: brandHref(brand.slug) },
  ]
  const url = origin + brandHref(brand.slug)
  const logo = brand.logo ? pickSource(brand.logo.sources, JSON_LD_LOGO_WIDTH) : null
  const jsonLd = [
    brandJsonLd({
      name: brand.name,
      url,
      description: brand.shortDescription,
      logo: logo && new URL(logo, origin).toString(),
      website: brand.website,
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]

  // The client island gets only this brand's products, not the whole catalog.
  const islandIndex: CatalogIndex = {
    ...index,
    products,
    industries: [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }

  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  )

  // Only the cards listed on this site: an unpublished card never shows in the showroom.
  const listed = showroom && listShowroom(showroom, new Set(products.map(({ slug }) => slug)))
  if (listed) {
    const bySlug = new Map(products.map((product) => [product.slug, product]))
    const hero = listed.hero.length > 0 ? listed.hero : products.map(({ slug }) => slug)
    const photos = hero.flatMap((slug) => bySlug.get(slug)?.image ?? []).slice(0, 3)
    const phoneLabel = settings?.phone ?? null
    const tel = phoneLabel ? toTelHref(phoneLabel) : null
    return (
      <>
        {jsonLdScript}
        <ShowroomHero
          brand={brand}
          view={listed}
          crumbs={crumbs}
          stats={showroomStats(listed)}
          photos={photos}
        />
        <Container wide className="flex flex-col gap-16 pt-10 pb-14 sm:gap-24 sm:pt-14 sm:pb-20">
          <ShowroomBody
            brand={brand.name}
            view={listed}
            index={islandIndex}
            poster={photos[0] ?? null}
          />
          <ShowroomServices services={listed.services} />
          <ShowroomCtaBand phone={phoneLabel && tel ? { label: phoneLabel, href: tel } : null} />
        </Container>
      </>
    )
  }

  return (
    <>
      {jsonLdScript}
      <BrandHero brand={brand} crumbs={crumbs} count={products.length} />
      <BrandAbout brand={brand} />
      <Container wide className="pb-14 sm:pb-20">
        <CategoryGrid
          index={islandIndex}
          help={DEFAULTS.help}
          printersHref={null}
          segments="category"
          title="W katalogu"
        />
      </Container>
      <HowInquiryWorks callbackTime={callback} />
      <CatalogContactPanel
        tenantId={tenant.id}
        id="kontakt"
        heading={DEFAULTS.contact.heading}
        lead={DEFAULTS.contact.lead}
        callbackTime={callback}
      />
    </>
  )
}

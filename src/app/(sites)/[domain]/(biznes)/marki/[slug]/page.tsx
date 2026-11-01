import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

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
import { getBrandView, getCatalogIndex, getSalonDoc, getSalonSlugOfBrand } from '@/lib/catalog/data'
import { BRANDS_PATH } from '@/lib/catalog/filters'
import { buildSalonView, salonTitle, type SalonView } from '@/lib/catalog/salon'
import { getEnv } from '@/lib/env'
import { pickSource } from '@/lib/media/sizes'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { metaDescription } from '@/lib/seo/description'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { BrandAbout, BrandHero } from '@/sites/biznes/components/brand/BrandSections'
import { SalonChooser, SalonFamily } from '@/sites/biznes/components/brand/salon/SalonClient'
import {
  familyHeading,
  SalonAbout,
  SalonFaq,
  SalonHero,
  SalonPlans,
  SalonRollout,
  SalonService,
  SectionHead,
} from '@/sites/biznes/components/brand/salon/SalonSections'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { CategoryGrid } from '@/sites/biznes/components/category/CategoryGrid'
import { HowInquiryWorks } from '@/sites/biznes/components/HowInquiryWorks'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** Logo width in JSON-LD: the original file when it is no larger. */
const JSON_LD_LOGO_WIDTH = 600

/**
 * What `/marki/[slug]` shows: the salon 2.0 of that slug (K4f), else — for a brand inside a
 * showroom — a redirect there (Kyocera → `/marki/druk`, ADR-017 D-K4-1), else the brand page of
 * K3b′ (a brand with `hasPage` and listed products), else nothing (404).
 */
async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { slug } = await params
  if (!isValidSlug(slug)) return { tenant, index: null, salon: null, brand: null, redirect: null }
  const [index, doc] = await Promise.all([getCatalogIndex(tenant.id), getSalonDoc(tenant.id, slug)])
  const salon = doc && buildSalonView(doc, tenant.id, index.products)
  if (salon) return { tenant, index, salon, brand: null, redirect: null }
  const redirect = await getSalonSlugOfBrand(tenant.id, slug)
  if (redirect && redirect !== slug) return { tenant, index, salon: null, brand: null, redirect }
  // A page only for a listed brand with `hasPage` (K3-KATALOG §6): Ingenico, PRO-KOM → 404.
  const brand = brandPageHref(index, slug) ? await getBrandView(tenant.id, slug) : null
  return { tenant, index, salon: null, brand, redirect: null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, salon, brand } = await load(params)
  const page = salon
    ? {
        title: salonTitle(salon.h1a, salon.h1b),
        description: salon.lead ? metaDescription(salon.lead) : undefined,
        slug: salon.slug,
      }
    : brand
      ? {
          title: brandTitle(brand.name, brand.shortDescription),
          description: brand.shortDescription ? metaDescription(brand.shortDescription) : undefined,
          slug: brand.slug,
        }
      : null
  if (!page) return {}
  const settings = await getSiteSettings(tenant.id)
  const canonical = brandHref(page.slug)
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: robotsMeta(getEnv().SITE_ENV),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: canonical,
      title: page.title,
      description: page.description,
      // `openGraph` of a page replaces the layout's whole: the site's picture, as on the others.
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

export default async function BrandPage({ params }: Props) {
  const { tenant, index, salon, brand, redirect } = await load(params)
  if (redirect) permanentRedirect(brandHref(redirect))
  if (!index) notFound()
  if (salon) return <Salon tenantId={tenant.id} index={index} view={salon} />
  if (!brand) notFound()

  const [settings, origin] = await Promise.all([getSiteSettings(tenant.id), requestOrigin()])
  const callback = settings?.biznes?.promises.callbackTime ?? null
  const products = brandProducts(index, brand.slug)
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Marki', href: BRANDS_PATH },
    { name: brand.name, href: brandHref(brand.slug) },
  ]
  const logo = brand.logo ? pickSource(brand.logo.sources, JSON_LD_LOGO_WIDTH) : null
  const jsonLd = [
    brandJsonLd({
      name: brand.name,
      url: origin + brandHref(brand.slug),
      description: brand.shortDescription,
      logo: logo && new URL(logo, origin).toString(),
      website: brand.website,
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BrandHero brand={brand} crumbs={crumbs} count={products.length} />
      <BrandAbout brand={brand} />
      <Container wide className="pb-14 sm:pb-20">
        <CategoryGrid
          index={islandIndex(index, products)}
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

/** The client islands get only the products they show, not the whole catalog. */
function islandIndex(index: CatalogIndex, products: CatalogIndex['products']): CatalogIndex {
  return {
    ...index,
    products,
    industries: [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }
}

/**
 * Salon 2.0 (K4-FINAL §6, board „SALON MARKI 2.0”): hero → recommended models with the table →
 * more models → full offer → „Pomóż mi wybrać” → service → rollout → about the brand → FAQ.
 * A block without data has no section.
 */
async function Salon({
  tenantId,
  index,
  view,
}: {
  tenantId: number
  index: CatalogIndex
  view: SalonView
}) {
  const [settings, origin] = await Promise.all([getSiteSettings(tenantId), requestOrigin()])
  const url = origin + brandHref(view.slug)
  const brand = view.multi ? view.name : (view.brands[0]?.name ?? view.name)
  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Marki', href: BRANDS_PATH },
    { name: view.name, href: brandHref(view.slug) },
  ]
  const jsonLd = [
    ...view.brands.map((item) =>
      brandJsonLd({
        name: item.name,
        url,
        description: item.description,
        logo: item.logo && new URL(item.logo.url, origin).toString(),
        website: item.website,
      }),
    ),
    ...(view.faq.length > 0 ? [faqJsonLd(view.faq)] : []),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]
  const phoneLabel = settings?.phone ?? null
  const tel = phoneLabel ? toTelHref(phoneLabel) : null
  const phone = phoneLabel && tel ? { label: phoneLabel, href: tel } : null
  const contact = [phoneLabel, settings?.email].filter((value): value is string => Boolean(value))
  const shown = [
    ...new Map(
      view.family.flatMap((tab) => tab.products).map((product) => [product.slug, product]),
    ).values(),
  ]
  const family = familyHeading(view)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Container wide className="flex flex-col gap-12 pt-6 pb-14 sm:gap-24 sm:pt-8 sm:pb-20">
        <div>
          <SalonHero view={view} crumbs={crumbs} />
        </div>
        {view.plans && (
          <SalonPlans
            id="oferta"
            section={view.plans}
            compare={view.compare}
            brand={brand}
            eyebrow={view.headings.offer}
          />
        )}
        {view.morePlans && (
          <SalonPlans
            id="oferta2"
            section={view.morePlans}
            compare={view.plans ? null : view.compare}
            brand={brand}
            eyebrow={view.headings.offer}
          />
        )}
        {view.family.length > 0 && (
          <section
            id="oferta-cala"
            aria-labelledby="oferta-cala-h"
            className="flex scroll-mt-28 flex-col gap-8"
          >
            <SectionHead id="oferta-cala-h" eyebrow={family.eyebrow} title={family.title} note />
            <SalonFamily family={view.family} index={islandIndex(index, shown)} />
          </section>
        )}
        {view.chooser && <SalonChooser chooser={view.chooser} brand={brand} />}
        {view.service && <SalonService service={view.service} phone={phone} />}
        {view.rollout && <SalonRollout rollout={view.rollout} />}
        {view.about && <SalonAbout about={view.about} headings={view.headings} />}
        <SalonFaq
          faq={view.faq}
          headings={view.headings}
          hasPlans={Boolean(view.plans)}
          contact={contact}
        />
      </Container>
    </>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { MediaImage } from '@/components/MediaImage'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getBundles, getCatalogIndex, getIndustryView } from '@/lib/catalog/data'
import { catalogHref, DEFAULT_STATE } from '@/lib/catalog/filters'
import { industryHref, industryProducts, otherIndustries, wizardHref } from '@/lib/catalog/industry'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { bundleCard, bundlesOfIndustry, listBundles } from '@/lib/catalog/bundle'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { metaDescription } from '@/lib/seo/description'
import { BzOrderFlowBlock } from '@/sites/biznes/blocks/BzOrderFlow/Component'
import { BzTimelineBlock } from '@/sites/biznes/blocks/BzTimeline/Component'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { CatalogContactPanel } from '@/sites/biznes/components/catalog/CatalogContactPanel'
import { CatalogHero } from '@/sites/biznes/components/catalog/CatalogHero'
import { FaqBiznes } from '@/sites/biznes/components/home/FaqBiznes'
import {
  IndustryBundles,
  IndustryProducts,
  OtherIndustriesSection,
} from '@/sites/biznes/components/industry/IndustrySections'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; branza: string }> }

/** „Branże” in the breadcrumbs: the industries grid of the home page (there is no list page). */
const INDUSTRIES_CRUMB = '/#dla-kogo'

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { branza: slug } = await params
  if (!isValidSlug(slug)) return { tenant, index: null, industry: null }
  const index = await getCatalogIndex(tenant.id)
  // Only active industries have a page (as in the sitemap): „Wkrótce”, unknown or another
  // site's slug → 404 without a database query.
  const active = index.industries.some((item) => item.active && item.slug === slug)
  const industry = active ? await getIndustryView(tenant.id, slug) : null
  return { tenant, index, industry }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, industry } = await load(params)
  if (!industry) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = industry.seo.title ?? industry.name
  // Panel texts can run long: cut to what results show in full (audit 01.11, as Software).
  const descriptionSource = industry.seo.description ?? industry.lead
  const description = descriptionSource ? metaDescription(descriptionSource) : undefined
  const canonical = industryHref(industry.slug)
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
      images: ogImages(industry.image ?? settings?.seo.ogImage ?? null, 'biznes'),
    },
  }
}

/**
 * Industry page `/branze/[branza]` (spec. §6.7, board `Branza`): one template for the active
 * industries — hero with the way to the wizard, featured products, the day line, „Jak to
 * działa”, FAQ, other industries and the contact form.
 */
export default async function IndustryPage({ params }: Props) {
  const { tenant, index, industry } = await load(params)
  if (!index || !industry) notFound()
  const [settings, origin, allBundles] = await Promise.all([
    getSiteSettings(tenant.id),
    requestOrigin(),
    getBundles(tenant.id),
  ])
  const products = new Map(index.products.map((product) => [product.slug, product]))
  const bundles = bundlesOfIndustry(
    listBundles(allBundles, new Set(products.keys())),
    industry.slug,
  ).map((bundle) => bundleCard(bundle, products))

  const { featured, total } = industryProducts(index, industry.slug, industry.featured)
  const callback = settings?.biznes?.promises.callbackTime ?? null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  // `indexed: false`: a section of the home page — shown to people, left out of JSON-LD.
  const crumbs: (Crumb & { indexed?: false })[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Branże', href: INDUSTRIES_CRUMB, indexed: false },
    { name: industry.name, href: industryHref(industry.slug) },
  ]
  const breadcrumbs = breadcrumbJsonLd(
    crumbs
      .filter(({ indexed }) => indexed !== false)
      .map(({ name, href }) => ({ name, url: origin + href })),
  )
  // Product cards need only the brands, categories and groups of the index.
  const cardIndex: CatalogIndex = {
    ...index,
    products: featured,
    industries: [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <CatalogHero
        crumbs={crumbs}
        pill={`Branże · ${industry.name}`}
        title={industry.title}
        lead={industry.lead}
        primary={industry.cta}
        phone={phone && tel ? { label: phone, href: tel } : null}
        chips={industry.chips}
        chipStyle="plain"
        visual={
          industry.image && (
            <MediaImage
              image={industry.image}
              sizes="(min-width: 1080px) 45vw, 100vw"
              eager
              className="mx-auto h-auto w-full max-w-[560px] object-contain drop-shadow-[0_32px_40px_var(--glow)]"
            />
          )
        }
      />
      <IndustryBundles bundles={bundles} />
      <IndustryProducts
        section={industry.products}
        products={featured}
        total={total}
        index={cardIndex}
        catalogHref={catalogHref({ ...DEFAULT_STATE, industries: [industry.slug] })}
      />
      {industry.day && <BzTimelineBlock block={industry.day} tone="accent" />}
      {industry.flow && <BzOrderFlowBlock block={industry.flow} tenantId={tenant.id} />}
      {industry.faq.items.length > 0 && (
        <FaqBiznes
          tenantId={tenant.id}
          block={{
            blockType: 'faq',
            eyebrow: industry.faq.eyebrow,
            heading: industry.faq.title,
            lead: industry.faq.lead,
            items: industry.faq.items,
          }}
        />
      )}
      <OtherIndustriesSection
        industries={otherIndustries(index, industry.slug)}
        wizardHref={wizardHref(null)}
      />
      <CatalogContactPanel
        tenantId={tenant.id}
        id="kontakt"
        heading={industry.contact.heading}
        lead={industry.contact.lead}
        callbackTime={callback}
      />
    </>
  )
}

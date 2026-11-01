import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import {
  BUNDLES_PATH,
  bundleHref,
  bundleLabel,
  bundlePhotos,
  listBundle,
} from '@/lib/catalog/bundle'
import { productHref } from '@/lib/catalog/card'
import { categoryHref } from '@/lib/catalog/category'
import { getBundles, getCatalogIndex } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, faqJsonLd, itemListJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { pageRobots } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { biznesDescription } from '@/lib/biznes/seo'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { BundleInquiry, type BundleRow } from '@/sites/biznes/components/bundle/BundleInquiry'
import {
  BundleHero,
  BundleReasons,
  BundleRelated,
  BundleSwaps,
} from '@/sites/biznes/components/bundle/BundleSections'
import { ProductThumb } from '@/sites/biznes/components/ProductThumb'
import { ProductFaq } from '@/sites/biznes/components/product/ProductSections'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** Title in search results: the bundle name, cut to fit with the site name (≤ 70). */
const TITLE_LENGTH = 45

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { slug } = await params
  if (!isValidSlug(slug)) return { tenant, index: null, bundle: null }
  const [index, bundles] = await Promise.all([getCatalogIndex(tenant.id), getBundles(tenant.id)])
  const view = bundles.find((bundle) => bundle.slug === slug)
  // Only the cards listed on this site; a bundle without a required item → 404 (spec. §6.10).
  const bundle = view ? listBundle(view, new Set(index.products.map((p) => p.slug))) : null
  return { tenant, index, bundle }
}

const cut = (text: string, length: number) =>
  text.length <= length ? text : `${text.slice(0, length - 1).trimEnd()}…`

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, bundle } = await load(params)
  if (!bundle) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = `Zestaw: ${cut(bundle.name, TITLE_LENGTH)}`
  const canonical = bundleHref(bundle.slug)
  const description = bundle.benefit ? biznesDescription(bundle.benefit) : undefined
  return {
    title,
    description,
    alternates: { canonical },
    // „Do sprawdzenia”: shown, but out of the index until Krystian checks the list (K3-KATALOG §7).
    robots: pageRobots(getEnv().SITE_ENV, bundle.indexable),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: canonical,
      title,
      description,
      images: ogImages(settings?.seo.ogImage ?? null, 'biznes'),
    },
  }
}

/**
 * A ready bundle `/zestawy/[slug]` (K3c, spec. §6.10, `k31/screens/Web-Zestaw-1440`): hero,
 * benefit and description, „W zestawie” with „Twój zestaw” on the side, „Możesz zamienić”,
 * „Dlaczego taki zestaw”, FAQ and „Zobacz też”. No prices, no sums.
 */
export default async function BundlePage({ params }: Props) {
  const { tenant, index, bundle } = await load(params)
  if (!index || !bundle) notFound()
  const [settings, origin] = await Promise.all([getSiteSettings(tenant.id), requestOrigin()])
  const products = new Map(index.products.map((product) => [product.slug, product]))
  const product = (slug: string) => products.get(slug)!
  const phoneLabel = settings?.phone ?? null
  const tel = phoneLabel ? toTelHref(phoneLabel) : null
  const phone = phoneLabel && tel ? { label: phoneLabel, href: tel } : null

  const rows: BundleRow[] = bundle.items.map((item) => ({
    ...item,
    name: product(item.product).name,
    href: productHref(item.product),
    thumb: <ProductThumb product={product(item.product)} index={index} />,
  }))
  const related = bundle.related.flatMap((slug) => {
    const category = index.categories.find((c) => c.slug === slug)
    return category ? [{ name: category.name, href: categoryHref(slug) }] : []
  })
  const link = (slug: string) => ({ name: product(slug).name, href: productHref(slug) })

  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Gotowe zestawy', href: BUNDLES_PATH },
    { name: bundle.areaLabel, href: bundleHref(bundle.slug) },
  ]
  const jsonLd = [
    itemListJsonLd({
      name: bundle.name,
      items: rows.map((row) => ({ name: row.name, url: origin + row.href })),
    }),
    // The last crumb shows the area; in search results the bundle name says more.
    breadcrumbJsonLd(
      crumbs.map(({ name, href }, position) => ({
        name: position === crumbs.length - 1 ? bundle.name : name,
        url: origin + href,
      })),
    ),
    ...(bundle.indexable && bundle.faq.length > 0 ? [faqJsonLd(bundle.faq)] : []),
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BundleHero
        label={bundleLabel(bundle)}
        name={bundle.name}
        audience={bundle.audience}
        crumbs={crumbs}
        photos={bundlePhotos(bundle, products, 6)}
        phone={phone}
      />
      <Container wide className="pt-10 pb-14 sm:pt-14 sm:pb-20">
        <BundleInquiry
          name={bundle.name}
          rows={rows}
          services={bundle.services.map((slug) => product(slug).name)}
          after={
            <>
              <BundleSwaps
                swaps={bundle.swaps.map((swap) => ({
                  from: link(swap.from),
                  to: link(swap.to),
                  when: swap.when,
                }))}
              />
              <BundleReasons reasons={bundle.reasons} />
              <ProductFaq id="faq" faq={bundle.faq} phone={phone} />
              <BundleRelated links={related} />
            </>
          }
        >
          <p className="rounded-2xl bg-surface-2 px-5 py-4 font-extrabold leading-relaxed text-ink">
            {bundle.benefit}
          </p>
          {bundle.description.map((paragraph) => (
            <p key={paragraph} className="max-w-[70ch] leading-relaxed text-ink-2">
              {paragraph}
            </p>
          ))}
        </BundleInquiry>
      </Container>
    </>
  )
}

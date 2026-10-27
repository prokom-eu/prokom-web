import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { cardIcon, productBadges, productHref } from '@/lib/catalog/card'
import { getCatalogIndex, getProductView } from '@/lib/catalog/data'
import { categoryHref } from '@/lib/catalog/category'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { alternativeProducts, kitProducts, similarProducts } from '@/lib/catalog/related'
import { getEnv } from '@/lib/env'
import { pickSource } from '@/lib/media/sizes'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, productJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { pageRobots } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref, toWhatsAppHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { ProductBox } from '@/sites/biznes/components/product/ProductBox'
import { ProductDetails } from '@/sites/biznes/components/product/ProductDetails'
import { ProductAlternatives } from '@/sites/biznes/components/product/ProductAlternatives'
import { ProductGallery } from '@/sites/biznes/components/product/ProductGallery'
import { ProductKit, type KitItem } from '@/sites/biznes/components/product/ProductKit'
import { SimilarProducts } from '@/sites/biznes/components/product/SimilarProducts'
import { HowInquiryWorks } from '@/sites/biznes/components/HowInquiryWorks'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** Width of the image in JSON-LD: Google asks for large images (≥ 1200 px when there is one). */
const JSON_LD_IMAGE_WIDTH = 1200

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { slug } = await params
  // Unknown or another site's slug → `null` → 404; a malformed one never reaches the database.
  const product = isValidSlug(slug) ? await getProductView(tenant.id, slug) : null
  return { tenant, product }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, product } = await load(params)
  if (!product) return {}
  const title = product.seo.title ?? product.name
  const description = product.seo.description ?? product.benefit ?? undefined
  const settings = await getSiteSettings(tenant.id)
  const canonical = productHref(product.slug)
  return {
    title,
    description,
    alternates: { canonical },
    // A card „Do sprawdzenia” is shown, but kept out of the index (K3a).
    robots: pageRobots(getEnv().SITE_ENV, product.indexable),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: canonical,
      title,
      description,
      images: ogImages(product.images[0] ?? settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Product page `/produkt/[slug]` (spec. §6.2): gallery and box (B6a), then tabs, alternatives,
 * „Skompletuj stanowisko”, „Podobne” and how the inquiry works (B6b).
 */
export default async function ProductPage({ params }: Props) {
  const { tenant, product } = await load(params)
  if (!product) notFound()
  const [index, settings, origin] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
  ])

  // Badges and the picture without a photo are the card's (catalog index), so both agree.
  const listed = index.products.find((item) => item.slug === product.slug)
  const category = index.categories.find((item) => item.slug === product.category?.slug)
  const badges = listed ? productBadges(listed, index.brands) : []

  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const whatsapp = settings?.biznes?.whatsapp ?? null
  const contact = {
    phone: phone && tel ? { label: phone, href: tel } : null,
    whatsapp: whatsapp ? toWhatsAppHref(whatsapp) : null,
  }

  // The category page exists only for a listed category (rozstrzygnięcie 7).
  const categoryLink = category ? categoryHref(category.slug) : null

  const crumbs: Crumb[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
    ...(category && categoryLink ? [{ name: category.name, href: categoryLink }] : []),
    { name: product.name, href: productHref(product.slug) },
  ]
  const jsonLd = [
    productJsonLd({
      name: product.name,
      description: product.benefit,
      url: origin + productHref(product.slug),
      brand: product.brand?.name ?? null,
      category: product.category?.name ?? null,
      images: product.images.map(
        (image) => origin + pickSource(image.sources, JSON_LD_IMAGE_WIDTH),
      ),
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
  ]

  // Sections under the content (B6b): only this site's published products (catalog index).
  const kit: KitItem[] = kitProducts(index, product.slug).map((item) => ({
    slug: item.slug,
    name: item.name,
    benefit: item.benefit ?? null,
    image: item.image ?? null,
    icon: cardIcon(item, index),
  }))
  const alternatives = alternativeProducts(index, product.slug, product.alternatives)
  const similar = similarProducts(index, product.slug)

  return (
    <>
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <div className="relative bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_55%)]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-5 sm:px-6 sm:pb-16 sm:pt-9 lg:px-8">
          <Breadcrumbs items={crumbs} />
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:items-start lg:gap-10">
            <ProductGallery
              name={product.name}
              images={product.images}
              hotspots={product.hotspots}
              modules={product.modules}
              badges={badges}
              icon={listed ? cardIcon(listed, index) : 'store'}
            />
            <ProductBox
              product={product}
              contact={contact}
              callbackTime={settings?.biznes?.promises.callbackTime ?? null}
            />
          </div>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 sm:gap-20 sm:px-6 sm:pb-24 lg:px-8">
        {product.tabs.length > 0 && <ProductDetails product={product} />}
        {alternatives.length > 0 && <ProductAlternatives products={alternatives} />}
        {kit.length > 0 && <ProductKit items={kit} />}
        {similar.length > 0 && (
          <SimilarProducts
            products={similar}
            index={index}
            category={
              category && categoryLink
                ? { name: category.name, count: category.count, href: categoryLink }
                : null
            }
          />
        )}
      </div>
      <HowInquiryWorks callbackTime={settings?.biznes?.promises.callbackTime ?? null} />
    </>
  )
}

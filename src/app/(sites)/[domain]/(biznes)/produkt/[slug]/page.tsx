import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { bentoTiles } from '@/lib/catalog/bento'
import { brandPageHref } from '@/lib/catalog/brand'
import { BUNDLES_PATH, bundleCard, bundlesWithProduct, listBundles } from '@/lib/catalog/bundle'
import { cardIcon, productHref } from '@/lib/catalog/card'
import { categoryHref } from '@/lib/catalog/category'
import { getBundles, getCatalogIndex, getProductView } from '@/lib/catalog/data'
import { CATALOG_PATH, catalogHref, parseCatalogState, updateState } from '@/lib/catalog/filters'
import { productTitle, uniqueVersions, variantKey, variantSlug } from '@/lib/catalog/productName'
import { productGallery } from '@/lib/catalog/product'
import { familyProducts, recommendedProducts, suggestedProducts } from '@/lib/catalog/related'
import { getEnv } from '@/lib/env'
import { pickSource } from '@/lib/media/sizes'
import { ogImages } from '@/lib/pages/metadata'
import { prepareSearch } from '@/lib/search'
import {
  breadcrumbJsonLd,
  faqJsonLd,
  productJsonLd,
  serializeJsonLd,
  videoJsonLd,
} from '@/lib/seo/jsonLd'
import { pageRobots } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { metaDescription } from '@/lib/seo/description'
import { Breadcrumbs, type Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { BundleGrid } from '@/sites/biznes/components/bundle/BundleCard'
import { PageLink } from '@/sites/biznes/components/PageLink'
import { ProductAbout } from '@/sites/biznes/components/product/ProductAbout'
import { ProductBento } from '@/sites/biznes/components/product/ProductBento'
import { StickyAction } from '@/sites/biznes/components/mobile/StickyAction'
import { ProductAddButton } from '@/sites/biznes/components/product/ProductAddButton'
import { ProductConfigProvider } from '@/sites/biznes/components/product/ProductConfig'
import { ProductConfigurator } from '@/sites/biznes/components/product/ProductConfigurator'
import { ProductHero } from '@/sites/biznes/components/product/ProductHero'
import { ProductSection } from '@/sites/biznes/components/product/ProductSection'
import {
  ProductSectionNav,
  type NavSection,
} from '@/sites/biznes/components/product/ProductSectionNav'
import {
  ProductCtaBand,
  ProductFamily,
  ProductFaq,
  ProductSources,
  ProductSuggestions,
  ProductVersions,
} from '@/sites/biznes/components/product/ProductSections'
import { ProductSpecs } from '@/sites/biznes/components/product/ProductSpecs'
import { CONFIGURATOR_ID } from '@/sites/biznes/components/product/ProductVersionPicker'
import { ProductVideos } from '@/sites/biznes/components/product/ProductVideos'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; slug: string }> }

/** Width of the image in JSON-LD: Google asks for large images (≥ 1200 px when there is one). */
const JSON_LD_IMAGE_WIDTH = 1200

/** Anchors of the sections, in the order of the page (K31-ZMIANY §4 pkt 2). */
const ID = {
  overview: 'przeglad',
  about: 'opis',
  video: 'film',
  specs: 'parametry',
  versions: 'wersje',
  bundles: 'zestawy',
  suggestions: 'dobierz',
  family: 'rodzina',
  faq: 'faq',
  sources: 'zrodla',
} as const

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
  const title =
    product.seo.title ??
    productTitle(
      product.shortName ?? product.heading,
      product.variants.map((variant) => variant.name),
    )
  // Panel texts can run long: cut to what results show in full (audit 01.11, as Software).
  const descriptionSource = product.seo.description ?? product.benefit
  const description = descriptionSource ? metaDescription(descriptionSource) : undefined
  const settings = await getSiteSettings(tenant.id)
  // One canonical per card: `?wersja=` only picks the configurator (K31-ZMIANY §13.5).
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
 * Product page 2.0 `/produkt/[slug]` (spec. §6.2, K31-ZMIANY §4, §7, §13.5, §13.7): hero, the
 * section bar, „W skrócie”, description, configurator, video, parameters, versions, „Do tego
 * zwykle dobierają”, the family, FAQ, sources and the CTA band. An empty section is not shown.
 */
export default async function ProductPage({ params }: Props) {
  const { tenant, product } = await load(params)
  if (!product) notFound()
  const [index, settings, origin, allBundles] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    requestOrigin(),
    getBundles(tenant.id),
  ])

  // The picture without a photo is the card's (catalog index), so both agree.
  const listed = index.products.find((item) => item.slug === product.slug)
  const category = index.categories.find((item) => item.slug === product.category?.slug)
  const phoneLabel = settings?.phone ?? null
  const tel = phoneLabel ? toTelHref(phoneLabel) : null
  const phone = phoneLabel && tel ? { label: phoneLabel, href: tel } : null

  // The category page exists only for a listed category (rozstrzygnięcie 7).
  const categoryLink = category ? categoryHref(category.slug) : null
  // The brand's salon 2.0 or page (K4f, K3b′), else the brand's catalog.
  const brandLink = product.brand
    ? (brandPageHref(index, product.brand.slug) ??
      catalogHref(
        updateState(parseCatalogState(new URLSearchParams(), index), {
          brands: [product.brand.slug],
        }),
      ))
    : null

  const tiles = bentoTiles(product.specs)
  const variantNames = uniqueVersions(product.variants.map((variant) => variant.name))
  // „Do tego zwykle dobierają”: `polecane` of K4, then „pasuje do”; a card without them keeps
  // the phrase matching of K31b (K36 §13 W14).
  const recommended = recommendedProducts(index, product.slug, product.recommended)
  const suggestions =
    recommended.length > 0
      ? { cards: recommended, chips: [] }
      : suggestedProducts(index, prepareSearch(index), product.slug, product.suggestions)
  // Colours (K32 §9): their pictures open the gallery, then the card's own photos.
  const gallery = productGallery(product.colors, product.images)
  const family = familyProducts(index, product.slug)
  // „W zestawach” (spec. §6.2 pkt 7, K3c): up to 3 bundles listing this card.
  const products = new Map(index.products.map((item) => [item.slug, item]))
  const bundles = bundlesWithProduct(
    listBundles(allBundles, new Set(products.keys())),
    product.slug,
  )
    .slice(0, 3)
    .map((bundle) => bundleCard(bundle, products))
  const video = product.videos.length > 0
  const hasVersions = variantNames.length >= 2

  const sections: NavSection[] = [
    ...(tiles.length > 0 ? [{ id: ID.overview, label: 'Przegląd' }] : []),
    { id: ID.about, label: 'Opis' },
    ...(product.configurator ? [{ id: CONFIGURATOR_ID, label: 'Wybierz wersję' }] : []),
    ...(video ? [{ id: ID.video, label: 'Film' }] : []),
    ...(product.specs.length > 0 ? [{ id: ID.specs, label: 'Parametry' }] : []),
    ...(hasVersions ? [{ id: ID.versions, label: 'Wersje' }] : []),
    ...(bundles.length > 0 ? [{ id: ID.bundles, label: 'Zestawy' }] : []),
    ...(product.faq.length > 0 ? [{ id: ID.faq, label: 'FAQ' }] : []),
    ...(product.sources.length > 0 ? [{ id: ID.sources, label: 'Źródła' }] : []),
  ]

  const crumbs: Crumb[] = [
    { name: 'Start', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
    ...(category && categoryLink ? [{ name: category.name, href: categoryLink }] : []),
    { name: product.heading, href: productHref(product.slug) },
  ]
  const url = origin + productHref(product.slug)
  const jsonLd = [
    productJsonLd({
      name: product.name,
      description: product.subtitle ?? product.benefit,
      url,
      groupId: product.slug,
      brand: product.brand?.name ?? null,
      category: product.category?.name ?? null,
      images: product.images.map(
        (image) => origin + pickSource(image.sources, JSON_LD_IMAGE_WIDTH),
      ),
      variants: hasVersions
        ? variantNames.map((name) => ({
            name: `${product.heading} ${name}`,
            sku: variantKey(name),
            url: `${url}?wersja=${variantSlug(name)}`,
          }))
        : [],
    }),
    breadcrumbJsonLd(crumbs.map(({ name, href }) => ({ name, url: origin + href }))),
    // FAQPage only for a card „Gotowe” (K3-KATALOG §5.2).
    ...(product.indexable && product.faq.length > 0 ? [faqJsonLd(product.faq)] : []),
    ...product.videos.slice(0, 1).map((item) => videoJsonLd(item)),
  ]

  return (
    <ProductConfigProvider
      slug={product.slug}
      name={product.name}
      config={product.configurator}
      variants={variantNames}
      colors={product.colors.map((color) => color.name)}
    >
      {jsonLd.map((data, position) => (
        <script
          key={position}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
      ))}
      <div className="mx-auto w-full max-w-7xl px-4 pt-5 pb-12 sm:px-6 sm:pt-8 sm:pb-16 lg:px-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-5 sm:mt-7">
          <ProductHero
            product={product}
            icon={listed ? cardIcon(listed, index) : 'store'}
            brandHref={brandLink}
            categoryHref={categoryLink}
            phone={phone}
            videoTarget={video ? ID.video : null}
            gallery={gallery.images}
            colorSlides={gallery.colorSlides}
          />
        </div>
      </div>
      <ProductSectionNav
        sections={sections}
        name={product.heading}
        image={product.images[0] ?? null}
      />
      {/* Phone (MOBILE-APLIKACJA §1): „Dodaj do zapytania” sticks to the bottom of the screen. */}
      <StickyAction>
        <ProductAddButton className="w-full" />
      </StickyAction>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 pt-14 pb-16 sm:gap-28 sm:px-6 sm:pt-20 sm:pb-24 lg:px-8">
        <ProductBento id={ID.overview} heading={product.heading} tiles={tiles} />
        <ProductAbout id={ID.about} product={product} />
        {product.configurator && <ProductConfigurator config={product.configurator} />}
        <ProductVideos id={ID.video} videos={product.videos} poster={product.images[0] ?? null} />
        <ProductSpecs id={ID.specs} rows={product.specs} />
        <ProductVersions id={ID.versions} variants={product.variants} />
        {bundles.length > 0 && (
          <ProductSection
            id={ID.bundles}
            eyebrow="Gotowe zestawy"
            heading="W zestawach"
            action={
              <PageLink href={BUNDLES_PATH} kind="outline" arrow>
                Wszystkie zestawy
              </PageLink>
            }
          >
            <BundleGrid bundles={bundles} />
          </ProductSection>
        )}
        <ProductSuggestions
          id={ID.suggestions}
          cards={suggestions.cards}
          chips={suggestions.chips}
          index={index}
        />
        <ProductFamily
          id={ID.family}
          products={family}
          index={index}
          heading={product.series ? `Inne z rodziny ${product.series}` : 'Z tej samej rodziny'}
          brandLink={
            product.brand && brandLink
              ? { label: `Cała oferta ${product.brand.name}`, href: brandLink }
              : null
          }
        />
        <ProductFaq id={ID.faq} faq={product.faq} phone={phone} />
        <ProductSources id={ID.sources} sources={product.sources} checkedAt={product.checkedAt} />
        <ProductCtaBand phone={phone} />
      </div>
    </ProductConfigProvider>
  )
}

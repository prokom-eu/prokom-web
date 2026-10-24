import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/ui/Container'
import {
  boughtWithTiles,
  categoryBrands,
  categoryHref,
  categoryPill,
  categoryProducts,
  registerOptions,
} from '@/lib/catalog/category'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getCatalogIndex, getCategoryView } from '@/lib/catalog/data'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { groupHref } from '@/lib/catalog/menu'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import type { Crumb } from '@/sites/biznes/components/Breadcrumbs'
import { CategoryGrid } from '@/sites/biznes/components/category/CategoryGrid'
import { CategoryHero } from '@/sites/biznes/components/category/CategoryHero'
import {
  BoughtWith,
  CategoryFacts,
  IncludedCards,
} from '@/sites/biznes/components/category/CategorySections'
import { ContactPanel } from '@/sites/biznes/components/forms/ContactPanel'
import { FaqBiznes } from '@/sites/biznes/components/home/FaqBiznes'
import { HowInquiryWorks } from '@/sites/biznes/components/HowInquiryWorks'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; kategoria: string }> }

/** „…potrzebujesz drukarki fiskalnej, nie kasy →” under the cash register picker (board). */
const PRINTERS_SLUG = 'drukarki-fiskalne'

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { kategoria: slug } = await params
  if (!isValidSlug(slug)) return { tenant, index: null, listed: null, category: null }
  const index = await getCatalogIndex(tenant.id)
  // Only listed categories have a page: one without published products is 404 (rozstrz. 7).
  const listed = index.categories.find((item) => item.slug === slug) ?? null
  const category = listed ? await getCategoryView(tenant.id, slug) : null
  return { tenant, index, listed, category }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, category } = await load(params)
  if (!category) return {}
  const settings = await getSiteSettings(tenant.id)
  const title = category.seo.title ?? category.name
  const description = category.seo.description ?? category.lead ?? undefined
  const canonical = categoryHref(category.slug)
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
      images: ogImages(category.image ?? settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Category page `/oferta/[kategoria]` (spec. §6.1, board `Kategoria`): one template for every
 * listed category; the cash register picker appears when the products have register types.
 * Without the comparison (stage 2).
 */
export default async function CategoryPage({ params }: Props) {
  const { tenant, index, listed, category } = await load(params)
  if (!index || !listed || !category) notFound()
  const [settings, origin] = await Promise.all([getSiteSettings(tenant.id), requestOrigin()])

  const products = categoryProducts(index, category.slug)
  const group = index.groups.find((item) => item.slug === listed.group) ?? null
  const registers = registerOptions(products) !== null
  const callback = settings?.biznes?.promises.callbackTime ?? null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null

  // `indexed: false`: the group link is a filtered catalog view (`noindex`) — shown to people,
  // left out of JSON-LD, where every item but the last needs its own address (Google).
  const crumbs: (Crumb & { indexed?: false })[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
    ...(group ? [{ name: group.name, href: groupHref(group.slug), indexed: false as const }] : []),
    { name: category.name, href: categoryHref(category.slug) },
  ]
  const breadcrumbs = breadcrumbJsonLd(
    crumbs
      .filter(({ indexed }) => indexed !== false)
      .map(({ name, href }) => ({ name, url: origin + href })),
  )

  // The client island gets only this category's products, not the whole catalog.
  const islandIndex: CatalogIndex = {
    ...index,
    products,
    industries: [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }
  const logos = categoryBrands(products, index).flatMap(({ slug, name }) => {
    const logo = index.brands.find((brand) => brand.slug === slug)?.logo
    return logo ? [{ name, logo }] : []
  })
  const photos = products.flatMap((product) => (product.image ? [product.image] : [])).slice(0, 3)
  const printers =
    registers &&
    category.slug !== PRINTERS_SLUG &&
    index.categories.some((item) => item.slug === PRINTERS_SLUG)
      ? categoryHref(PRINTERS_SLUG)
      : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <CategoryHero
        category={category}
        crumbs={crumbs}
        pill={categoryPill(group?.name ?? null, products, index)}
        primary={
          registers
            ? { label: 'Dobierz kasę w 1 kliknięciu', href: '#dobor' }
            : { label: 'Zobacz produkty', href: '#produkty' }
        }
        phone={phone && tel ? { label: phone, href: tel } : null}
        photos={photos}
        logos={logos.slice(0, 3)}
      />
      <Container wide className="pb-14 sm:pb-20">
        <CategoryGrid index={islandIndex} help={category.help} printersHref={printers} />
      </Container>
      <IncludedCards included={category.included} />
      <CategoryFacts facts={category.facts} />
      <BoughtWith
        heading="Często dobierane razem"
        tiles={boughtWithTiles(index, category.slug, category.boughtWith)}
      />
      {category.faq.items.length > 0 && (
        <FaqBiznes
          tenantId={tenant.id}
          block={{
            blockType: 'faq',
            eyebrow: category.faq.eyebrow,
            heading: category.faq.title,
            lead: category.faq.lead,
            items: category.faq.items,
          }}
        />
      )}
      <HowInquiryWorks callbackTime={callback} />
      <ContactPanel
        tenantId={tenant.id}
        id="kontakt"
        heading={category.contact.heading}
        lead={[category.contact.lead, callback && `${callback} w godzinach pracy.`]
          .filter(Boolean)
          .join(' ')}
        formHeading="Formularz zapytania"
        formNote="Pola z gwiazdką są wymagane. Resztę dopiszemy razem przez telefon."
        // Like the catalog's form; the call-back time only from the panel [SZEF].
        promises={[callback, 'Wycena na piśmie', 'Bez zobowiązań'].filter(
          (promise): promise is string => Boolean(promise),
        )}
        successText={
          callback
            ? `${callback} w godzinach pracy. Poza godzinami pracy odezwiemy się następnego dnia roboczego rano.`
            : null
        }
      />
    </>
  )
}

import { Container } from '@/components/ui/Container'
import {
  boughtWithTiles,
  categoryBrands,
  categoryHref,
  categoryPill,
  categoryProducts,
  registerOptions,
  seriesFilter,
  subcategoryHref,
  subcategoryLinks,
  subcategoryProducts,
  subcategoryTitle,
  type CategoryView,
} from '@/lib/catalog/category'
import type { CatalogIndex, IndexSubcategory } from '@/lib/catalog/catalogIndex'
import { CATALOG_PATH } from '@/lib/catalog/filters'
import { groupHref } from '@/lib/catalog/menu'
import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'

import type { Crumb } from '../Breadcrumbs'
import { CatalogContactPanel } from '../catalog/CatalogContactPanel'
import { FaqBiznes } from '../home/FaqBiznes'
import { HowInquiryWorks } from '../HowInquiryWorks'
import { CategoryGrid } from './CategoryGrid'
import { CategoryHero } from './CategoryHero'
import { BoughtWith, CategoryFacts, IncludedCards } from './CategorySections'
import { SubcategoryNav } from './SubcategoryNav'

/** „…potrzebujesz drukarki fiskalnej, nie kasy →” under the cash register picker (board). */
const PRINTERS_SLUG = 'drukarki-fiskalne'

type Props = {
  tenantId: number
  origin: string
  index: CatalogIndex
  /** The category as the index lists it (with its subcategories and counts). */
  listed: CatalogIndex['categories'][number]
  category: CategoryView
  /** Set on a subcategory page `/oferta/<kategoria>/<podkategoria>` (K3b′). */
  subcategory?: IndexSubcategory & { slug: string }
}

/**
 * Category page (spec. §6.1, board `Kategoria`) and its subcategory pages (K3-KATALOG §9): one
 * template for every listed category; the cash register picker appears when the products have
 * register types. A subcategory page shows its products under its own H1 and address; the facts
 * and FAQ of the category stay on the category page only (no duplicate content, one FAQPage).
 */
export async function CategoryPageView({
  tenantId,
  origin,
  index,
  listed,
  category,
  subcategory,
}: Props) {
  const settings = await getSiteSettings(tenantId)
  const products = subcategory
    ? subcategoryProducts(index, category.slug, subcategory.name)
    : categoryProducts(index, category.slug)
  const brands = categoryBrands(products, index)
  const group = index.groups.find((item) => item.slug === listed.group) ?? null
  const registers = registerOptions(products) !== null
  const callback = settings?.biznes?.promises.callbackTime ?? null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const self = subcategory
    ? subcategoryHref(category.slug, subcategory.slug)
    : categoryHref(category.slug)

  // `indexed: false`: the group link is a filtered catalog view (`noindex`) — shown to people,
  // left out of JSON-LD, where every item but the last needs its own address (Google).
  const crumbs: (Crumb & { indexed?: false })[] = [
    { name: 'Strona główna', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
    ...(group ? [{ name: group.name, href: groupHref(group.slug), indexed: false as const }] : []),
    { name: category.name, href: categoryHref(category.slug) },
    ...(subcategory ? [{ name: subcategory.name, href: self }] : []),
  ]
  const breadcrumbs = breadcrumbJsonLd(
    crumbs
      .filter(({ indexed }) => indexed !== false)
      .map(({ name, href }) => ({ name, url: origin + href })),
  )

  // The client island gets only these products, not the whole catalog.
  const bySeries = seriesFilter(true, products).length > 0
  // Industries only for „Do czego” of a category with series (K31c).
  const islandIndex: CatalogIndex = {
    ...index,
    products,
    industries: bySeries ? index.industries : [],
    pages: [],
    search: { synonyms: {}, stopWords: [], popular: [] },
  }
  const logos = brands.flatMap(({ slug, name }) => {
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
  const links = subcategoryLinks(listed)
  const hero = subcategory
    ? { ...category, title: subcategoryTitle(subcategory.name, brands), highlights: [] }
    : category

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <CategoryHero
        category={hero}
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
        <SubcategoryNav
          category={{ name: category.name, href: categoryHref(category.slug), count: listed.count }}
          items={links.pages}
          current={self}
        />
        <CategoryGrid
          index={islandIndex}
          help={category.help}
          printersHref={printers}
          chips={subcategory ? null : { category: category.slug, items: links.chips }}
          bySeriesFilter={bySeries}
        />
      </Container>
      <IncludedCards included={category.included} />
      {!subcategory && <CategoryFacts facts={category.facts} />}
      <BoughtWith
        heading="Często dobierane razem"
        tiles={boughtWithTiles(index, category.slug, category.boughtWith)}
      />
      {!subcategory && category.faq.items.length > 0 && (
        <FaqBiznes
          tenantId={tenantId}
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
      <CatalogContactPanel
        tenantId={tenantId}
        id="kontakt"
        heading={category.contact.heading}
        lead={category.contact.lead}
        callbackTime={callback}
      />
    </>
  )
}

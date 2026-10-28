import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  categoryBrands,
  findSubcategory,
  subcategoryHref,
  subcategoryProducts,
  subcategoryTitle,
} from '@/lib/catalog/category'
import { getCatalogIndex, getCategoryView } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { plural } from '@/lib/plural'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { CategoryPageView } from '@/sites/biznes/components/category/CategoryPageView'

import { requestOrigin, requireLine } from '../../../../tenant'

type Props = { params: Promise<{ domain: string; kategoria: string; podkategoria: string }> }

async function load(params: Props['params']) {
  const tenant = await requireLine(params, 'biznes')
  const { kategoria, podkategoria } = await params
  if (!isValidSlug(kategoria) || !isValidSlug(podkategoria)) return { tenant, found: null }
  const index = await getCatalogIndex(tenant.id)
  // A page only for a subcategory with an address and listed products (ADR-012 rozstrz. 14).
  const match = findSubcategory(index, kategoria, podkategoria)
  const category = match ? await getCategoryView(tenant.id, kategoria) : null
  return { tenant, found: match && category ? { index, ...match, view: category } : null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant, found } = await load(params)
  if (!found) return {}
  const { index, category, subcategory, view } = found
  const settings = await getSiteSettings(tenant.id)
  const brands = categoryBrands(subcategoryProducts(index, category.slug, subcategory.name), index)
  const title = subcategoryTitle(subcategory.name, brands)
  const count = subcategory.count
  // Own description for the own address (canonical on itself, not the category's lead).
  const description = `${title}: ${count} ${plural(count, ['pozycja', 'pozycje', 'pozycji'])} w ofercie PRO-KOM Biznes. Zapytaj o dobór i ofertę.`
  const canonical = subcategoryHref(category.slug, subcategory.slug)
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
      images: ogImages(view.image ?? settings?.seo.ogImage ?? null),
    },
  }
}

/**
 * Subcategory page `/oferta/[kategoria]/[podkategoria]` (K3-KATALOG §9, spec. §2): only in
 * categories whose subcategories have an address (computers, servers, screens); H1 and
 * canonical of its own.
 */
export default async function SubcategoryPage({ params }: Props) {
  const { tenant, found } = await load(params)
  if (!found) notFound()
  return (
    <CategoryPageView
      tenantId={tenant.id}
      origin={await requestOrigin()}
      index={found.index}
      listed={found.category}
      category={found.view}
      subcategory={found.subcategory}
    />
  )
}

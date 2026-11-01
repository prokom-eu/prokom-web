import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { categoryHref } from '@/lib/catalog/category'
import { getCatalogIndex, getCategoryView } from '@/lib/catalog/data'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { isValidSlug } from '@/lib/tenant/uniqueSlug'
import { metaDescription } from '@/lib/seo/description'
import { CategoryPageView } from '@/sites/biznes/components/category/CategoryPageView'

import { requestOrigin, requireLine } from '../../../tenant'

type Props = { params: Promise<{ domain: string; kategoria: string }> }

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
  // Panel texts can run long: cut to what results show in full (audit 01.11, as Software).
  const descriptionSource = category.seo.description ?? category.lead
  const description = descriptionSource ? metaDescription(descriptionSource) : undefined
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

/** Category page `/oferta/[kategoria]` (spec. §6.1) — the view is shared with subcategories. */
export default async function CategoryPage({ params }: Props) {
  const { tenant, index, listed, category } = await load(params)
  if (!index || !listed || !category) notFound()
  return (
    <CategoryPageView
      tenantId={tenant.id}
      origin={await requestOrigin()}
      index={index}
      listed={listed}
      category={category}
    />
  )
}

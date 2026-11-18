import type { Metadata } from 'next'

import { Heading } from '@/components/ui/Heading'
import { getCatalogIndex, getCatalogTexts } from '@/lib/catalog/data'
import {
  CATALOG_PATH,
  catalogSeo,
  brandCount,
  parseCatalogState,
  type ParamSource,
} from '@/lib/catalog/filters'
import { CATALOG_UI, catalogTextLine } from '@/lib/catalog/texts'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { plural } from '@/lib/plural'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { BreadcrumbJsonLd, Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { Catalog } from '@/sites/biznes/components/catalog/Catalog'

import { requestOrigin, requireCatalogTenant } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireCatalogTenant(params)
  const [index, settings, texts] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
    getCatalogTexts(tenant.id, catalogTextLine(tenant.line)),
  ])
  const seo = catalogSeo(
    parseCatalogState((await searchParams) as ParamSource, index),
    index.products.length,
  )
  return {
    title: texts.offerMetaTitle,
    description: texts.offerDescription,
    alternates: { canonical: seo.canonical },
    // Staging stays closed whatever the view; elsewhere a filtered view is not indexed.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (seo.index ? undefined : { index: false, follow: true }),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: seo.canonical,
      title: texts.offerMetaTitle,
      description: texts.offerDescription,
      images: ogImages(settings?.seo.ogImage ?? null, tenant.line),
    },
  }
}

/** Offer `/oferta` (K4 board `Web-Oferta`): header on the server, the list as a client island. */
export default async function CatalogPage({ params }: Props) {
  const tenant = await requireCatalogTenant(params)
  const [index, origin, texts] = await Promise.all([
    getCatalogIndex(tenant.id),
    requestOrigin(),
    getCatalogTexts(tenant.id, catalogTextLine(tenant.line)),
  ])
  const brands = brandCount(index)
  const crumbs = [
    { name: 'Strona główna', href: '/' },
    { name: 'Oferta', href: CATALOG_PATH },
  ]
  // Counts from the database (K4-FINAL §4.4).
  const stats = [
    {
      value: index.products.length,
      label: plural(index.products.length, [
        'pozycja w ofercie',
        'pozycje w ofercie',
        'pozycji w ofercie',
      ]),
    },
    { value: brands, label: plural(brands, ['marka', 'marki', 'marek']) },
    {
      value: index.groups.length,
      label: plural(index.groups.length, ['dział', 'działy', 'działów']),
    },
  ].filter((stat) => stat.value > 0)

  return (
    <>
      {/* Board App-Oferta: on a phone the search comes first — the title is in the top bar (the H1
          stays for readers), no breadcrumbs, lead or numbers. */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-5 max-md:pb-0 max-md:pt-3 sm:px-6 md:pt-7 lg:px-8">
        <div className="max-md:hidden">
          <Breadcrumbs items={crumbs} />
          <BreadcrumbJsonLd items={crumbs} origin={origin} />
        </div>
        <div className="mt-5 flex flex-col gap-6 max-md:mt-0 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text max-md:hidden">
              Oferta
            </p>
            <Heading level={1} className="mt-2 max-md:sr-only">
              {texts.offerTitle}
            </Heading>
            <p className="mt-3 text-lg leading-relaxed text-ink-2 max-md:hidden">
              {texts.offerLead}
            </p>
          </div>
          {stats.length > 0 && (
            <dl className="grid grid-cols-3 gap-2 max-md:hidden lg:min-w-[380px]">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col-reverse gap-1 rounded-[18px] bg-card px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  <dt className="text-xs font-bold text-ink-3">{stat.label}</dt>
                  <dd className="font-display text-[1.375rem] font-extrabold leading-none tracking-[-0.02em] text-ink font-stretch-112% sm:text-[1.75rem]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <Catalog index={index} ui={CATALOG_UI[catalogTextLine(tenant.line)]} />
    </>
  )
}

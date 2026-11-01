import type { Metadata } from 'next'

import { Heading } from '@/components/ui/Heading'
import { getCatalogIndex } from '@/lib/catalog/data'
import {
  CATALOG_PATH,
  catalogSeo,
  brandCount,
  parseCatalogState,
  type ParamSource,
} from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { plural } from '@/lib/plural'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { Breadcrumbs } from '@/sites/biznes/components/Breadcrumbs'
import { Catalog } from '@/sites/biznes/components/catalog/Catalog'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Cała oferta dla firm'
/** Lead of the K4 board `Web-Oferta`. */
/** Meta description (≤ 155 characters, audit 01.11); the lead below is longer. */
const DESCRIPTION =
  'Sprzęt, programy i usługi dla firm z doborem, wdrożeniem i serwisem. Dodaj pozycje do zapytania, a wycenę dostaniesz na piśmie.'
const LEAD =
  'Sprzęt, programy i usługi dla firm i instytucji — z doborem, wdrożeniem i serwisem. Cen nie podajemy na stronie: dodaj pozycje do zapytania, a wycenę dostaniesz na piśmie.'

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const tenant = await requireLine(params, 'biznes')
  const [index, settings] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
  ])
  const seo = catalogSeo(
    parseCatalogState((await searchParams) as ParamSource, index),
    index.products.length,
  )
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: seo.canonical },
    // Staging stays closed whatever the view; elsewhere a filtered view is not indexed.
    robots:
      robotsMeta(getEnv().SITE_ENV) ?? (seo.index ? undefined : { index: false, follow: true }),
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: tenant.name,
      url: seo.canonical,
      title: TITLE,
      description: DESCRIPTION,
      images: ogImages(settings?.seo.ogImage ?? null, 'biznes'),
    },
  }
}

/** Offer `/oferta` (K4 board `Web-Oferta`): header on the server, the list as a client island. */
export default async function CatalogPage({ params }: Props) {
  const tenant = await requireLine(params, 'biznes')
  const index = await getCatalogIndex(tenant.id)
  const brands = brandCount(index)
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
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-5 sm:px-6 sm:pt-7 lg:px-8">
        <Breadcrumbs
          items={[
            { name: 'Start', href: '/' },
            { name: 'Oferta', href: CATALOG_PATH },
          ]}
        />
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
              Oferta
            </p>
            <Heading level={1} className="mt-2">
              {TITLE}
            </Heading>
            <p className="mt-3 text-lg leading-relaxed text-ink-2">{LEAD}</p>
          </div>
          {stats.length > 0 && (
            <dl className="grid grid-cols-3 gap-2 lg:min-w-[380px]">
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
      <Catalog index={index} />
    </>
  )
}

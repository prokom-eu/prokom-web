import Link from 'next/link'
import type { Metadata } from 'next'

import { Heading } from '@/components/ui/Heading'
import { getCatalogIndex } from '@/lib/catalog/data'
import {
  CATALOG_PATH,
  catalogSeo,
  OWN_BRAND_SLUG,
  parseCatalogState,
  type ParamSource,
} from '@/lib/catalog/filters'
import { getEnv } from '@/lib/env'
import { ogImages } from '@/lib/pages/metadata'
import { plural } from '@/lib/plural'
import { robotsMeta } from '@/lib/seo/robots'
import { getSiteSettings } from '@/lib/site/data'
import { Catalog } from '@/sites/biznes/components/catalog/Catalog'
import { HowInquiryWorks } from '@/sites/biznes/components/HowInquiryWorks'

import { requireLine } from '../../tenant'

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const TITLE = 'Oferta — katalog dla firm'
const LEAD =
  'Kasy, POS, terminale, komputery, programy i usługi — to, co sprzedajemy, wdrażamy i serwisujemy. Dodaj do zapytania, co Cię interesuje, a przygotujemy wycenę pod Twoją firmę.'

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
    description: LEAD,
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
      description: LEAD,
      images: ogImages(settings?.seo.ogImage ?? null),
    },
  }
}

/** Catalog `/oferta` (spec. §5): header on the server, the list as a client island. */
export default async function CatalogPage({ params }: Props) {
  const tenant = await requireLine(params, 'biznes')
  const [index, settings] = await Promise.all([
    getCatalogIndex(tenant.id),
    getSiteSettings(tenant.id),
  ])
  const brands = index.brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG).length
  const partnerships = index.brands.filter((brand) => brand.status === 'authorized-partner').length
  const callback = settings?.biznes?.promises.callbackTime ?? null
  const stats = [
    {
      value: index.products.length,
      label: plural(index.products.length, [
        'produkt i usługa',
        'produkty i usługi',
        'produktów i usług',
      ]),
    },
    { value: brands, label: plural(brands, ['marka', 'marki', 'marek i producentów']) },
    {
      value: partnerships,
      label: plural(partnerships, [
        'autoryzacja partnerska',
        'autoryzacje partnerskie',
        'autoryzacji partnerskich',
      ]),
    },
  ].filter((stat) => stat.value > 0)

  return (
    <>
      <div className="relative overflow-hidden bg-[radial-gradient(ellipse_at_85%_0%,var(--glow),transparent_55%)]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-6 pt-5 sm:px-6 sm:pt-9 lg:px-8">
          <nav aria-label="Okruszki" className="text-sm text-ink-3">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link href="/" className="hover:text-ink hover:underline">
                  Strona główna
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={CATALOG_PATH} aria-current="page" className="text-ink">
                  Oferta
                </Link>
              </li>
            </ol>
          </nav>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-2">
                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-ok" />
                Katalog PRO-KOM Biznes · bez cen, wycena na piśmie
              </p>
              <Heading level={1} className="mt-3">
                Wszystko dla firmy.
                <br />W jednym miejscu.
              </Heading>
              <p className="mt-4 text-lg leading-relaxed text-ink-2 sm:text-xl">{LEAD}</p>
            </div>
            {(stats.length > 0 || callback) && (
              <dl className="grid grid-cols-2 gap-2 lg:min-w-[360px]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col-reverse gap-0.5 rounded-[18px] bg-card px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    <dt className="text-xs font-bold text-ink-3">{stat.label}</dt>
                    <dd className="font-display text-[1.375rem] font-extrabold leading-none tracking-[-0.02em] text-accent-text font-stretch-112% sm:text-[1.75rem]">
                      {stat.value}
                    </dd>
                  </div>
                ))}
                {callback && (
                  <div className="flex flex-col justify-center rounded-[18px] bg-card px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--border)]">
                    <dt className="sr-only">Oddzwonienie</dt>
                    <dd className="text-sm font-extrabold leading-snug text-accent-text">
                      {callback}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </div>
      </div>
      <Catalog index={index} />
      <HowInquiryWorks callbackTime={callback} />
    </>
  )
}

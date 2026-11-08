import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandPageHref } from '@/lib/catalog/brand'
import { getCatalogIndex } from '@/lib/catalog/data'
import { BRANDS_PATH, OWN_BRAND_SLUG } from '@/lib/catalog/filters'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { getBrandStripData } from '@/lib/partners/data'
import type { HomeBrand } from '@/lib/partners/homeBrands'
import { brandStrips } from '@/lib/partners/strips'
import { plural } from '@/lib/plural'
import type { PartnersBlock as PartnersBlockData } from '@/payload-types'

import { BrandStrips } from './HomeIslands'
import { SplitHead } from './SplitHead'

/** The lead of the strips (ZAOPATRZENIE §9: shortened). */
const BRANDS_LEAD =
  'Autoryzowany serwis Posnet i Elzab, autoryzowany partner GoPOS i InsERT oraz salony producentów — każdy z doborem modelu i serwisem.'

/**
 * „Marki, które znamy od środka.” of the home page in two moving strips (ZAOPATRZENIE §9, D5
 * 06.11 — reverses K36 §1, ADR-017 „Rozstrzygnięcia 08.11”): every partner of the tenant, the
 * panel's home order first, split alternately. Each tile is a link: salon or brand page, else
 * the offer filtered by the brand. Phones get the strips too.
 */
export async function BrandsHome({
  block,
  tenantId,
}: {
  block: PartnersBlockData
  tenantId: number
}) {
  const [{ brands, homeIds }, index] = await Promise.all([
    getBrandStripData(tenantId),
    getCatalogIndex(tenantId),
  ])
  const shown = brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG)
  if (shown.length === 0) return null
  const heading = block.heading?.trim() || 'Marki, które znamy od środka.'
  const lead = block.lead?.trim() || BRANDS_LEAD
  const counts = new Map<string, number>()
  for (const product of index.products) {
    if (product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1)
  }
  const total = index.brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG).length
  const [top, bottom] = brandStrips(shown, homeIds, counts)
  // A brand with a page leads there; the others to the offer filtered by the brand.
  const hrefOf = (slug: string | null) =>
    slug ? (brandPageHref(index, slug) ?? `/oferta?marka=${slug}`) : '/oferta'

  const tile = (brand: HomeBrand) => {
    const role = partnerStatusLabel(brand.status)
    const count = brand.slug ? (counts.get(brand.slug) ?? 0) : 0
    const info = brand.description ?? (brand.logo ? brand.name : null)
    return (
      <li key={brand.id} className="flex">
        <Link href={hrefOf(brand.slug)} className="zh-tile" draggable={false}>
          {/* Read once: the name (before the description), the count, the status. */}
          {brand.description && <span className="sr-only">{brand.name}: </span>}
          <span className="zh-tile-logo">
            {brand.logo ? (
              <MediaImage image={{ ...brand.logo, alt: '' }} sizes="146px" />
            ) : (
              // No logo (APC, Adobe): the name instead.
              <em aria-hidden={brand.description ? true : undefined}>{brand.name}</em>
            )}
          </span>
          <span className="zh-tile-info">
            {info && <b>{info}</b>}
            {count > 0 && (
              <small>
                {count} {plural(count, ['pozycja', 'pozycje', 'pozycji'])}
                <Icon name="arrow" strokeWidth={2.4} />
              </small>
            )}
          </span>
          {role && <span className="zh-tile-status">{role}</span>}
        </Link>
      </li>
    )
  }

  return (
    <section id="marki" aria-labelledby="marki-h" className="zh scroll-mt-24 py-6 md:py-20">
      <Container wide>
        <SplitHead id="marki-h" eyebrow="Marki" heading={heading} lead={lead}>
          <Link
            href={BRANDS_PATH}
            className="inline-flex min-h-11 items-center gap-2 font-extrabold text-accent-text"
          >
            Wszystkie marki · {total}
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        </SplitHead>
        <BrandStrips top={top.map(tile)} bottom={bottom.length > 0 ? bottom.map(tile) : null} />
      </Container>
    </section>
  )
}

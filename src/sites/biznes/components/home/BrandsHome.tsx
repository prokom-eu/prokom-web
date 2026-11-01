import Link from 'next/link'

import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { brandPageHref } from '@/lib/catalog/brand'
import { getCatalogIndex } from '@/lib/catalog/data'
import { BRANDS_PATH, OWN_BRAND_SLUG } from '@/lib/catalog/filters'
import { partnerStatusLabel } from '@/lib/partners/badges'
import { getHomeBrands, getPartners } from '@/lib/partners/data'
import type { HomeBrand } from '@/lib/partners/homeBrands'
import { plural } from '@/lib/plural'
import type { PartnersBlock as PartnersBlockData } from '@/payload-types'

/** Tiles of the section (K35 7a) and logos in the „Salony marek” tile (board: 11, then „+N”). */
const HOME_BRANDS = 16
const MORE_LOGOS = 11

// Logos are made for a light background: a white plate in both themes, like the old bar.
const PLATE =
  'flex h-16 items-center justify-center rounded-2xl bg-white px-4 shadow-[inset_0_0_0_1px_var(--border)]'

/**
 * „Marki, które znamy od środka.” of the home page v150 (K35 7a, K36 §1): the brands chosen in
 * `BiznesSettings.brands.home` with their status and count, then the tile of all brands. It
 * replaces the moving logo bar on the Biznes line (the shared Partners block keeps its place).
 */
export async function BrandsHome({
  block,
  tenantId,
}: {
  block: PartnersBlockData
  tenantId: number
}) {
  const [chosen, logos, index] = await Promise.all([
    getHomeBrands(tenantId),
    getPartners(tenantId),
    getCatalogIndex(tenantId),
  ])
  // Nothing chosen in the panel yet (staging, production): the first brands with a logo, so the
  // section — and the rail's „Marki” — never disappear.
  const brands: HomeBrand[] =
    chosen.length > 0
      ? chosen
      : logos.slice(0, HOME_BRANDS).map(({ id, name, slug, logo }) => ({
          id,
          name,
          slug,
          logo,
          description: null,
          status: 'none',
        }))
  if (brands.length === 0) return null
  const heading = block.heading?.trim() || 'Marki, które znamy od środka.'
  const lead =
    block.lead?.trim() ||
    'Autoryzowany serwis Posnet i Elzab, autoryzowany partner GoPOS i InsERT oraz salony producentów, każdy z doborem modelu, porównaniem i serwisem.'
  const counts = new Map<string, number>()
  for (const product of index.products) {
    if (product.brand) counts.set(product.brand, (counts.get(product.brand) ?? 0) + 1)
  }
  const total = index.brands.filter((brand) => brand.slug !== OWN_BRAND_SLUG).length
  const shownIds = new Set(brands.map((brand) => brand.id))
  const others = logos.filter((partner) => !shownIds.has(partner.id))
  const rest = Math.max(0, total - brands.length - Math.min(others.length, MORE_LOGOS))
  // A brand with a page leads there; the others to the offer filtered by the brand.
  const hrefOf = (slug: string | null) =>
    slug ? (brandPageHref(index, slug) ?? `/oferta?marka=${slug}`) : '/oferta'

  return (
    <section id="marki" aria-labelledby="marki-h" className="scroll-mt-24 py-14">
      <Container wide>
        <div className="flex max-w-3xl flex-col gap-2 pb-7">
          <p className="text-xs font-black tracking-[0.08em] text-accent-text uppercase">Marki</p>
          <h2 id="marki-h" className="font-display text-3xl font-extrabold text-balance text-ink">
            {heading}
          </h2>
          <p className="text-ink-2">{lead}</p>
        </div>
        <ul className="grid gap-3 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
          {brands.map((brand) => {
            const role = partnerStatusLabel(brand.status)
            const count = brand.slug ? (counts.get(brand.slug) ?? 0) : 0
            return (
              <li key={brand.id} className="flex">
                <Link
                  href={hrefOf(brand.slug)}
                  className="flex w-full flex-col gap-3 rounded-3xl bg-card p-4 shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)]"
                >
                  {brand.logo ? (
                    <span className={PLATE}>
                      {/* The name is the text next to it: the logo is decoration here. */}
                      <MediaImage
                        image={{ ...brand.logo, alt: '' }}
                        sizes="160px"
                        className="max-h-10 w-auto max-w-full object-contain"
                      />
                    </span>
                  ) : (
                    // No logo (APC, Adobe): the name on a plate of the theme (once for readers).
                    <span
                      aria-hidden="true"
                      className="flex h-16 items-center justify-center rounded-2xl bg-surface-2 px-4 font-display text-lg font-extrabold text-ink"
                    >
                      {brand.name}
                    </span>
                  )}
                  <span className="flex flex-1 flex-col gap-1">
                    <b className="font-extrabold text-ink">{brand.name}</b>
                    {brand.description && (
                      <small className="text-sm leading-snug text-ink-2">{brand.description}</small>
                    )}
                  </span>
                  <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold">
                    {role ? <span className="text-ok-text">{role}</span> : <span />}
                    {count > 0 && (
                      <span className="text-ink-2">
                        {count} {plural(count, ['pozycja', 'pozycje', 'pozycji'])}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
          <li className="min-[560px]:col-span-2 min-[900px]:col-span-3 min-[1200px]:col-span-4">
            <div className="flex flex-col gap-4 rounded-3xl bg-surface-2 p-5 min-[900px]:flex-row min-[900px]:items-center">
              <div className="flex flex-col gap-1 min-[900px]:max-w-[40%]">
                <p className="text-xs font-black tracking-[0.08em] text-accent-text uppercase">
                  Salony marek
                </p>
                <b className="font-display text-xl font-extrabold text-ink">
                  Zobacz wszystkie marki · {total}
                </b>
                <p className="text-sm text-ink-2">
                  Najważniejsze marki mają swoje salony: dobór modelu, porównanie serii i serwis.
                  Szukasz konkretnego producenta? Wszystkie są tutaj.
                </p>
              </div>
              <ul aria-hidden="true" className="flex flex-1 flex-wrap items-center gap-2">
                {others.slice(0, MORE_LOGOS).map((partner) => (
                  <li
                    key={partner.id}
                    className="flex h-10 w-20 items-center justify-center rounded-xl bg-white px-2"
                  >
                    <MediaImage
                      image={{ ...partner.logo, alt: '' }}
                      sizes="80px"
                      className="max-h-6 w-auto max-w-full object-contain"
                    />
                  </li>
                ))}
                {rest > 0 && <li className="text-sm font-extrabold text-ink-2">+{rest}</li>}
              </ul>
              <Link
                href={BRANDS_PATH}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink"
              >
                Wszystkie marki
                <Icon name="arrow" strokeWidth={2.4} className="size-4" />
              </Link>
            </div>
          </li>
        </ul>
      </Container>
    </section>
  )
}

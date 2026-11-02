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
import { BZ_H2, BZ_LEAD } from '@/sites/biznes/typography'

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
 * Below 768 px (board App-Start): the logos in a 4-column grid with the status under each, then
 * a dark bar to all brands.
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
    <section id="marki" aria-labelledby="marki-h" className="scroll-mt-24 py-6 md:py-20">
      <Container wide>
        {/* Board `Web-start` (W2): the heading left, the lead right. */}
        <div className="flex flex-col gap-4 pb-8 max-md:pb-4 min-[900px]:flex-row min-[900px]:items-end min-[900px]:justify-between min-[900px]:gap-10">
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-accent-text uppercase max-md:hidden">
              <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
              Marki
            </p>
            <h2
              id="marki-h"
              className={`${BZ_H2} max-w-[16ch] text-ink max-md:text-[22px] max-md:leading-[1.1]`}
            >
              {heading}
            </h2>
          </div>
          <p className={`${BZ_LEAD} max-w-[46ch] text-ink-2 max-md:hidden`}>{lead}</p>
        </div>
        <ul className="grid grid-cols-4 gap-2 md:hidden">
          {brands.map((brand) => {
            const role = partnerStatusLabel(brand.status)
            return (
              <li key={brand.id} className="flex">
                <Link
                  href={hrefOf(brand.slug)}
                  className="flex w-full flex-col items-center gap-1.5 text-center"
                >
                  <span className="flex h-14 w-full items-center justify-center rounded-2xl bg-white px-2 shadow-[inset_0_0_0_1px_var(--border)]">
                    {brand.logo ? (
                      <MediaImage
                        image={{ ...brand.logo, alt: '' }}
                        sizes="80px"
                        className="max-h-7 w-auto max-w-full object-contain"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="text-[12px] font-extrabold text-surface-dark"
                      >
                        {brand.name}
                      </span>
                    )}
                  </span>
                  <span className="text-[10.5px] leading-tight font-bold text-ink-2">
                    {role ? (
                      <>
                        <span className="sr-only">{brand.name}: </span>
                        {role}
                      </>
                    ) : (
                      brand.name
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
        <Link
          data-surface="dark"
          href={BRANDS_PATH}
          className="mt-4 flex min-h-[72px] items-center justify-between gap-4 rounded-[22px] bg-surface-dark px-5 py-4 text-white md:hidden"
        >
          <span className="flex flex-col gap-1">
            <span className="text-[11px] font-extrabold tracking-[0.14em] text-white/75 uppercase">
              Salony marek
            </span>
            <b className="font-display text-[17px] leading-tight font-extrabold">
              Zobacz wszystkie marki · {total}
            </b>
          </span>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-surface-dark"
          >
            <Icon name="arrow" strokeWidth={2.4} className="size-5" />
          </span>
        </Link>
        <ul className="grid gap-3 max-md:hidden min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 min-[1200px]:grid-cols-4">
          {brands.map((brand) => {
            const role = partnerStatusLabel(brand.status)
            const count = brand.slug ? (counts.get(brand.slug) ?? 0) : 0
            return (
              <li key={brand.id} className="flex">
                <Link
                  href={hrefOf(brand.slug)}
                  className="group/brand flex w-full flex-col gap-3 rounded-[22px] bg-card p-3.5 shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1.5px_var(--accent-text)] motion-reduce:transition-none"
                >
                  {brand.logo ? (
                    <span className={PLATE}>
                      {/* The name is read once, from the line below: the logo is decoration. */}
                      <MediaImage
                        image={{ ...brand.logo, alt: '' }}
                        sizes="160px"
                        className="max-h-10 w-auto max-w-[70%] object-contain"
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
                  <span className="flex-1 text-sm font-bold text-ink">
                    {brand.description ? (
                      <>
                        <span className="sr-only">{brand.name}: </span>
                        {brand.description}
                      </>
                    ) : (
                      brand.name
                    )}
                  </span>
                  <span className="flex items-center gap-2 text-xs font-extrabold">
                    {/* At night the accent on its tint gives ~4:1: the ink colour keeps AA. */}
                    {role && (
                      <span className="rounded-md bg-[color-mix(in_srgb,var(--accent-text)_12%,transparent)] px-2 py-1 text-accent-text [[data-theme=dark]_&]:text-ink">
                        {role}
                      </span>
                    )}
                    {count > 0 && (
                      <span className="text-ink-2">
                        {count} {plural(count, ['pozycja', 'pozycje', 'pozycji'])}
                      </span>
                    )}
                    <Icon
                      name="arrow"
                      strokeWidth={2.4}
                      className="ml-auto size-4 text-accent-text transition-transform group-hover/brand:translate-x-0.5 motion-reduce:transition-none"
                    />
                  </span>
                </Link>
              </li>
            )
          })}
          <li className="min-[560px]:col-span-2 min-[900px]:col-span-3 min-[1200px]:col-span-4">
            <div
              data-surface="dark"
              className="flex flex-col gap-5 rounded-[26px] bg-surface-dark bg-[radial-gradient(120%_140%_at_100%_0%,color-mix(in_srgb,var(--accent-text)_55%,transparent),transparent_60%)] p-6 text-white min-[1080px]:flex-row min-[1080px]:items-center min-[1080px]:gap-8 min-[1080px]:px-8"
            >
              <div className="flex flex-col gap-2 min-[1080px]:max-w-[38%]">
                <p className="text-xs font-extrabold tracking-[0.14em] text-white/75 uppercase">
                  Salony marek
                </p>
                <b className="font-display text-[clamp(24px,2.2vw,30px)] leading-tight font-extrabold font-stretch-112%">
                  Zobacz wszystkie marki · {total}
                </b>
                <p className="text-sm leading-relaxed text-white/80">
                  Najważniejsze marki mają swoje salony: dobór modelu, porównanie serii i serwis.
                  Szukasz konkretnego producenta? Wszystkie są tutaj.
                </p>
              </div>
              <ul
                aria-hidden="true"
                className="grid flex-1 grid-cols-3 gap-2 min-[560px]:grid-cols-4 min-[1080px]:max-w-[400px] min-[1080px]:justify-self-end"
              >
                {others.slice(0, MORE_LOGOS).map((partner) => (
                  <li
                    key={partner.id}
                    className="flex h-11 items-center justify-center rounded-xl bg-white px-2"
                  >
                    <MediaImage
                      image={{ ...partner.logo, alt: '' }}
                      sizes="92px"
                      className="max-h-6 w-auto max-w-full object-contain"
                    />
                  </li>
                ))}
                {rest > 0 && (
                  <li className="flex h-11 items-center justify-center rounded-xl bg-white/10 text-sm font-extrabold text-white">
                    +{rest}
                  </li>
                )}
              </ul>
              <Link
                href={BRANDS_PATH}
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-white px-6 font-extrabold text-surface-dark transition-colors hover:bg-accent-text hover:text-accent-ink min-[1080px]:self-center"
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

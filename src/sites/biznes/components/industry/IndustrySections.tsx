import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { BUNDLES_PATH, type BundleCardData } from '@/lib/catalog/bundle'
import type { SupplyTile } from '@/lib/biznes/procurement/links'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import type { IndustryView, OtherIndustries } from '@/lib/catalog/industry'
import { BZ_H2 } from '@/sites/biznes/typography'

import { BundleGrid } from '../bundle/BundleCard'
import { ProductCard } from '../catalog/ProductCard'
import { SectionHead } from '../home/SectionHead'

type ProductsProps = {
  section: IndustryView['products']
  products: IndexProduct[]
  total: number
  index: CatalogIndex
  /** The catalog filtered by the industry (`/oferta?branza=…`). */
  catalogHref: string
  /** Tiles of the procurement pages (plan 0611 §6.4 #4), under the cards. */
  supply?: SupplyTile[]
}

/** „Zestaw dla branży” (board: „Od lady po kuchnię”): the featured products as catalog cards. */
export function IndustryProducts({
  section,
  products,
  total,
  index,
  catalogHref,
  supply = [],
}: ProductsProps) {
  if (products.length === 0 && supply.length === 0) return null
  return (
    <section
      id="zestaw"
      aria-labelledby="zestaw-h"
      className="scroll-mt-28 bg-surface-2 py-14 max-md:py-7 min-[768px]:py-20"
    >
      <Container wide>
        <SectionHead
          id="zestaw-h"
          eyebrow={section.eyebrow}
          heading={section.title}
          lead={section.lead}
          appOnPhone
        />
        {/* Phone (App-Branza „Sprzęt i programy”): one row of cards to swipe. */}
        {products.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-2.5 max-md:mt-4 max-md:-mx-4 max-md:-my-2 max-md:flex max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:gap-3 max-md:overflow-x-auto max-md:px-4 max-md:py-2 max-md:[scrollbar-width:none] min-[768px]:gap-3.5 lg:grid-cols-3">
            {products.map((product, position) => (
              <li
                key={product.slug}
                className="flex max-md:relative max-md:w-[170px] max-md:shrink-0 max-md:snap-start"
              >
                <ProductCard product={product} index={index} position={position} />
              </li>
            ))}
          </ul>
        )}
        {supply.length > 0 && <SupplyTiles tiles={supply} />}
        {products.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 max-md:mt-3 max-md:gap-2 max-md:text-[13px]">
            <p className="text-ink-2">
              To {products.length} z <b className="text-ink">{total}</b> pozycji katalogu w tej
              branży.
            </p>
            <Link
              href={catalogHref}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
            >
              Wszystko dla tej branży w katalogu
              <Icon name="arrow" strokeWidth={2.4} className="size-4" />
            </Link>
          </div>
        )}
      </Container>
    </section>
  )
}

/** „Zaopatrzenie firm” tiles of an industry: the whole tile is the link. */
function SupplyTiles({ tiles }: { tiles: SupplyTile[] }) {
  return (
    <ul
      data-supply-tiles
      className="mt-4 grid gap-2.5 min-[768px]:mt-6 min-[768px]:grid-cols-2 min-[768px]:gap-3.5"
    >
      {tiles.map((tile) => (
        <li key={`${tile.href}-${tile.title}`} className="flex">
          <Link
            href={tile.href}
            className="group flex w-full items-center gap-4 rounded-[18px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1px_var(--ink-3)] sm:rounded-3xl sm:p-5"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-[12px] font-extrabold tracking-[0.1em] text-accent-text uppercase">
                {tile.label}
              </span>
              <span className="mt-1 block font-display text-lg leading-tight font-extrabold text-ink">
                {tile.title}
              </span>
              {tile.text && <span className="mt-1 block text-sm text-ink-2">{tile.text}</span>}
            </span>
            <Icon
              name="arrow"
              strokeWidth={2.4}
              className="size-5 shrink-0 text-ink-2 group-hover:text-accent-text"
            />
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * „Gotowe zestawy” of the industry (K3-KATALOG §9, K3c): bundles marked „Gotowe” only, up to 6,
 * above the products. None → no section.
 */
export function IndustryBundles({ bundles }: { bundles: BundleCardData[] }) {
  if (bundles.length === 0) return null
  return (
    <section
      id="gotowe-zestawy"
      aria-labelledby="gotowe-zestawy-h"
      className="scroll-mt-28 py-14 max-md:py-7 min-[768px]:py-20"
    >
      <Container wide>
        <SectionHead
          id="gotowe-zestawy-h"
          eyebrow="Gotowe zestawy"
          heading="Sprzęt, program i usługi, które działają razem."
          lead="Każdy element możesz zamienić, a doradzimy, co i kiedy."
          appOnPhone
        />
        <div className="mt-8 max-md:mt-4">
          <BundleGrid bundles={bundles} phoneRow />
        </div>
        <Link
          href={BUNDLES_PATH}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)] max-md:mt-3 max-md:min-h-11 max-md:text-sm"
        >
          Wszystkie gotowe zestawy
          <Icon name="arrow" strokeWidth={2.4} className="size-4" />
        </Link>
      </Container>
    </section>
  )
}

/** „Inne branże”: chips of the active industries, „Wkrótce” for the rest, the wizard link. */
export function OtherIndustriesSection({
  industries,
  wizardHref,
}: {
  industries: OtherIndustries
  wizardHref: string
}) {
  return (
    <section
      aria-labelledby="inne-branze-h"
      className="bg-surface-2 py-12 max-md:py-7 min-[768px]:py-16"
    >
      <Container wide>
        <h2 id="inne-branze-h" className={cx(BZ_H2, 'max-md:text-[22px] max-md:leading-[1.1]')}>
          Inne branże
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 max-md:mt-3">
          <ul className="flex flex-wrap gap-2.5">
            {industries.active.map((industry) => (
              <li key={industry.slug}>
                <Link
                  href={industry.href}
                  aria-current={industry.current ? 'page' : undefined}
                  className={cx(
                    'inline-flex min-h-11 items-center rounded-full px-5 font-extrabold transition-shadow',
                    industry.current
                      ? 'bg-ink text-surface'
                      : 'bg-card text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]',
                  )}
                >
                  {industry.name}
                </Link>
              </li>
            ))}
          </ul>
          {industries.soon.length > 0 && (
            <p className="text-sm text-ink-2 max-md:hidden">
              Wkrótce: {industries.soon.map((name) => name.toLowerCase()).join(', ')}
            </p>
          )}
          <Link
            href={wizardHref}
            className="font-extrabold text-accent-text hover:underline max-md:text-sm"
          >
            Inna branża? Dobierz zestaw w 60 s →
          </Link>
        </div>
      </Container>
    </section>
  )
}

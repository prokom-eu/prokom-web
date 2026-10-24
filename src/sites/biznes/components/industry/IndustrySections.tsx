import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import type { IndustryView, OtherIndustries } from '@/lib/catalog/industry'

import { ProductCard } from '../catalog/ProductCard'
import { SectionHead } from '../home/SectionHead'

type ProductsProps = {
  section: IndustryView['products']
  products: IndexProduct[]
  total: number
  index: CatalogIndex
  /** The catalog filtered by the industry (`/oferta?branza=…`). */
  catalogHref: string
}

/** „Zestaw dla branży” (board: „Od lady po kuchnię”): the featured products as catalog cards. */
export function IndustryProducts({ section, products, total, index, catalogHref }: ProductsProps) {
  if (products.length === 0) return null
  return (
    <section
      id="zestaw"
      aria-labelledby="zestaw-h"
      className="scroll-mt-28 bg-surface-2 py-14 sm:py-20"
    >
      <Container wide>
        <SectionHead
          id="zestaw-h"
          eyebrow={section.eyebrow}
          heading={section.title}
          lead={section.lead}
        />
        <ul className="mt-8 grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-3">
          {products.map((product, position) => (
            <li key={product.slug} className="flex">
              <ProductCard product={product} index={index} position={position} />
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
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
    <section aria-labelledby="inne-branze-h" className="bg-surface-2 py-12 sm:py-16">
      <Container wide>
        <h2
          id="inne-branze-h"
          className="font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-110%"
        >
          Inne branże
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
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
            <p className="text-sm text-ink-2">
              Wkrótce: {industries.soon.map((name) => name.toLowerCase()).join(', ')}
            </p>
          )}
          <Link href={wizardHref} className="font-extrabold text-accent-text hover:underline">
            Inna branża? Dobierz zestaw w 60 s →
          </Link>
        </div>
      </Container>
    </section>
  )
}

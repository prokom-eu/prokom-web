import Image from 'next/image'
import Link from 'next/link'

import { Icon } from '@/components/ui/Icon'
import { cardIcon, productHref } from '@/lib/catalog/card'
import type { CatalogIndex, IndexProduct } from '@/lib/catalog/catalogIndex'
import { serviceTile } from '@/lib/catalog/purchase'
import type { ProductView } from '@/lib/catalog/product'
import type { SourceLink } from '@/lib/catalog/sourceLabels'

import { AddToCartButton } from '../AddToCartButton'
import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'
import { ProductAddButton } from './ProductAddButton'
import { ProductSection } from './ProductSection'

/** „Czym różnią się wersje” (K31-ZMIANY §4 pkt 7): cards that never stretch alone. */
export function ProductVersions({
  id,
  variants,
}: {
  id: string
  variants: ProductView['variants']
}) {
  if (variants.length < 2) return null
  return (
    <ProductSection id={id} eyebrow="Wersje" heading="Czym różnią się wersje">
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3.5">
        {variants.map((variant) => (
          <li
            key={variant.name}
            className="flex flex-col gap-2 rounded-[22px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]"
          >
            <h3 className="text-[1.05rem] font-extrabold text-ink">{variant.name}</h3>
            {variant.difference && (
              <p className="text-[0.95rem] leading-relaxed text-ink-2">{variant.difference}</p>
            )}
          </li>
        ))}
      </ul>
    </ProductSection>
  )
}

/** A product card of „Do tego zwykle dobierają” and „Z tej samej rodziny”: studio + add. */
function ProductTile({
  product,
  index,
  label,
  withBenefit,
}: {
  product: IndexProduct
  index: CatalogIndex
  label: string | null
  withBenefit: boolean
}) {
  return (
    <article className="flex flex-col gap-3">
      <div className="relative">
        <ProductStage className="aspect-square w-full rounded-[24px] shadow-[inset_0_0_0_1px_var(--border)]">
          {product.image ? (
            <Image
              src={product.image.url}
              alt={product.image.alt}
              width={product.image.width}
              height={product.image.height}
              unoptimized
              className={`relative max-h-[72%] w-auto max-w-[78%] object-contain ${STAGE_SHADOW}`}
            />
          ) : (
            <StageFallback icon={cardIcon(product, index)} service={serviceTile(product)} />
          )}
        </ProductStage>
        <AddToCartButton
          slug={product.slug}
          name={product.name}
          variant="label"
          className="absolute right-3 bottom-3"
        />
      </div>
      <div className="flex flex-col gap-1">
        {label && (
          <p className="text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase">{label}</p>
        )}
        <h3 className="font-extrabold text-ink">
          <Link href={productHref(product.slug)} className="hover:text-accent-text">
            {product.name}
          </Link>
        </h3>
        {withBenefit && product.benefit && (
          <p className="text-sm leading-relaxed text-ink-2">{product.benefit}</p>
        )}
      </div>
    </article>
  )
}

const GRID = 'grid grid-cols-2 gap-x-3.5 gap-y-7 lg:grid-cols-4'

/** „Do tego zwykle dobierają” (K31-ZMIANY §4 pkt 7): cards by `dobierz`, chips without a match. */
export function ProductSuggestions({
  id,
  cards,
  chips,
  index,
}: {
  id: string
  cards: { label: string | null; product: IndexProduct }[]
  chips: string[]
  index: CatalogIndex
}) {
  if (cards.length === 0 && chips.length === 0) return null
  return (
    <ProductSection id={id} eyebrow="Dobierz" heading="Do tego zwykle dobierają">
      {cards.length > 0 && (
        <ul className={GRID}>
          {cards.map(({ label, product }) => (
            <li key={product.slug}>
              <ProductTile product={product} index={index} label={label} withBenefit={false} />
            </li>
          ))}
        </ul>
      )}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-bold text-ink-2">Dobierzemy też:</span>
          {chips.map((chip) => (
            <span key={chip} className="rounded-full bg-surface-2 px-3 py-1.5 font-bold text-ink-2">
              {chip}
            </span>
          ))}
        </div>
      )}
    </ProductSection>
  )
}

/** „Z tej samej rodziny” (K31-ZMIANY §4 pkt 7) with „Cała oferta <marka> →”. */
export function ProductFamily({
  id,
  products,
  index,
  heading,
  brandLink,
}: {
  id: string
  products: IndexProduct[]
  index: CatalogIndex
  heading: string
  brandLink: { label: string; href: string } | null
}) {
  if (products.length === 0) return null
  return (
    <ProductSection
      id={id}
      eyebrow="Z tej samej rodziny"
      heading={heading}
      action={
        brandLink && (
          <Link
            href={brandLink.href}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-card px-5 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
          >
            {brandLink.label}
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        )
      }
    >
      <ul className={GRID}>
        {products.map((product) => (
          <li key={product.slug}>
            <ProductTile product={product} index={index} label={null} withBenefit />
          </li>
        ))}
      </ul>
    </ProductSection>
  )
}

/** „Najczęstsze pytania” (K31-ZMIANY §4 pkt 8): two columns with a contact card, first open. */
export function ProductFaq({
  id,
  faq,
  phone,
}: {
  id: string
  faq: ProductView['faq']
  phone: { label: string; href: string } | null
}) {
  if (faq.length === 0) return null
  return (
    <ProductSection id={id} eyebrow="Pytania" heading="Najczęstsze pytania">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.62fr)] lg:items-start lg:gap-14">
        <div className="flex flex-col">
          {faq.map((item, position) => (
            <details
              key={item.question}
              open={position === 0}
              className="group/faq border-b border-border"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.05rem] font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                {item.question}
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                  className="shrink-0 transition-transform group-open/faq:rotate-180"
                >
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <p className="pb-5 leading-relaxed text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="flex flex-col gap-4 rounded-[26px] bg-surface-2 p-6">
          <h3 className="font-display text-xl font-extrabold text-ink font-stretch-106%">
            Nie ma tu Twojego pytania?
          </h3>
          <p className="leading-relaxed text-ink-2">
            Zadzwoń albo dodaj produkt do zapytania i dopisz pytanie w uwagach.
          </p>
          {phone ? (
            <a
              href={phone.href}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-accent-text px-5 font-display text-lg font-extrabold text-accent-ink hover:bg-ink hover:text-surface"
            >
              <span className="sr-only">Zadzwoń: </span>
              {phone.label}
            </a>
          ) : (
            <ProductAddButton />
          )}
        </div>
      </div>
    </ProductSection>
  )
}

/** „Skąd są te informacje” (K31-ZMIANY §4 pkt 9): producers' sources only, labels from the address. */
export function ProductSources({
  id,
  sources,
  checkedAt,
}: {
  id: string
  sources: SourceLink[]
  checkedAt: string | null
}) {
  if (sources.length === 0) return null
  const checked = checkedAt
    ? new Intl.DateTimeFormat('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Warsaw',
      }).format(new Date(checkedAt))
    : null
  return (
    <ProductSection
      id={id}
      eyebrow="Źródła"
      heading="Skąd są te informacje"
      aside={checked ? `sprawdzono ${checked}` : undefined}
    >
      <ul className="max-w-4xl">
        {sources.map((source) => (
          <li key={source.url} className="border-b border-border">
            <a
              href={source.url}
              target="_blank"
              rel="noopener"
              className="flex min-h-14 items-center gap-4 py-2 hover:text-accent-text"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-accent-text">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path
                    d="M14 4h6v6 M20 4l-9 9 M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="min-w-0 flex-1 font-bold text-ink">{source.label}</span>
              <span className="shrink-0 text-xs text-ink-2 max-sm:hidden">{source.meta}</span>
              <span className="sr-only"> (otwiera się w nowej karcie)</span>
            </a>
          </li>
        ))}
      </ul>
    </ProductSection>
  )
}

/** „Potrzebujesz kilku sztuk albo całego stanowiska?” — the closing band (K31-ZMIANY §4 pkt 11). */
export function ProductCtaBand({ phone }: { phone: { label: string; href: string } | null }) {
  return (
    <section
      aria-labelledby="pas-cta"
      data-surface="dark"
      className="relative overflow-hidden rounded-[32px] bg-surface-dark px-6 py-10 text-white ring-1 ring-white/10 ring-inset sm:px-12 sm:py-14"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_80%_at_85%_20%,color-mix(in_srgb,var(--accent)_45%,transparent),transparent_70%)]"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-8">
        <div className="max-w-[40rem]">
          <p className="mb-3 flex items-center gap-2.5 text-xs font-extrabold tracking-[0.12em] text-accent-on-dark uppercase">
            <span aria-hidden="true" className="h-0.5 w-4 rounded-full bg-current" />
            Wycena na piśmie
          </p>
          <h2
            id="pas-cta"
            className="font-display text-[clamp(1.7rem,3.2vw,2.6rem)] leading-[1.05] font-extrabold tracking-[-0.02em] font-stretch-110%"
          >
            Potrzebujesz kilku sztuk albo całego stanowiska?
          </h2>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-white/80">
            Dodaj do zapytania, dopisz liczbę stanowisk i programy. Przygotujemy ofertę z
            konfiguracją, wdrożeniem i serwisem.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ProductAddButton variant="light" />
          {phone && (
            <a
              href={phone.href}
              className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-white/10 px-6 font-display text-lg font-extrabold text-white ring-1 ring-white/30 ring-inset hover:bg-white/20"
            >
              <span className="sr-only">Zadzwoń: </span>
              {phone.label}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

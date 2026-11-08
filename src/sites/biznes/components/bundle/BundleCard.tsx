import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import type { BundleCardData } from '@/lib/catalog/bundle'
import { plural } from '@/lib/plural'

import { ProductStage, STAGE_SHADOW } from '../ProductStage'

/**
 * Bundle tile (`k31/screens/Web-Zestawy-1440`): photos of up to 3 required items on the studio,
 * „Obszar · Poziom”, the name, the benefit and „N elementów · zobacz zestaw”. The whole tile is
 * the link; photos are decorative (the name says it).
 */
export function BundleCard({
  bundle,
  headingLevel = 'h3',
  wide = false,
}: {
  bundle: BundleCardData
  headingLevel?: 'h2' | 'h3' | 'h4'
  /** The only bundle of a grid: photos beside the text from 640 px (BIZ-3 §9.2). */
  wide?: boolean
}) {
  const Heading = headingLevel
  return (
    <Link
      href={bundle.href}
      className={cx(
        'group flex h-full flex-col overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3),0_18px_40px_-28px_var(--glow)]',
        wide && 'sm:flex-row',
      )}
    >
      <ProductStage
        className={cx(
          'h-[180px] gap-1 px-4 max-md:h-[130px] min-[768px]:h-[200px]',
          wide && 'sm:h-auto sm:min-h-[220px] sm:w-[45%] sm:shrink-0',
        )}
      >
        {bundle.photos.map((photo, position) => (
          <Image
            key={photo.url}
            src={photo.url}
            alt=""
            width={photo.width}
            height={photo.height}
            unoptimized
            className={cx(
              'relative h-auto w-auto object-contain',
              STAGE_SHADOW,
              position === 0 ? 'max-h-[70%] max-w-[48%]' : 'max-h-[52%] max-w-[30%]',
            )}
          />
        ))}
      </ProductStage>
      <div className="flex flex-1 flex-col gap-2 p-5 max-md:gap-1.5 max-md:p-3.5">
        <span className="self-start rounded-md bg-surface-2 px-2 py-1 text-xs font-bold text-ink-2">
          {bundle.label}
        </span>
        <Heading className="font-display text-lg leading-snug font-extrabold text-ink max-md:text-[15px]">
          {bundle.name}
        </Heading>
        <p className="text-sm leading-relaxed text-ink-2 max-md:line-clamp-2 max-md:text-[13px]">
          {bundle.benefit}
        </p>
        <p className="mt-auto pt-1 text-sm font-extrabold text-accent-text">
          {bundle.count} {plural(bundle.count, ['element', 'elementy', 'elementów'])}
          <span aria-hidden="true"> · </span>
          <span className="group-hover:underline">zobacz zestaw</span>
        </p>
      </div>
    </Link>
  )
}

/**
 * Columns for `count` tiles without gaps (BIZ-3 §9.2): 1 → one wide card, 2 or 4 → two columns,
 * otherwise three (6-column grid, spans 2): with 5 the last two share the row, a last tile alone
 * spans it. With two columns (640–1023 px) a last odd tile spans both.
 */
export function gridLayout(count: number): { cols: string; span: (index: number) => string } {
  if (count === 1) return { cols: 'sm:grid-cols-1', span: () => '' }
  const lastOdd = (index: number) => count % 2 === 1 && index === count - 1
  if (count === 2 || count === 4) return { cols: 'sm:grid-cols-2', span: () => '' }
  return {
    cols: 'sm:grid-cols-2 lg:grid-cols-6',
    span: (index) =>
      cx(
        lastOdd(index) && 'sm:col-span-2',
        count % 3 === 2 && index >= count - 2
          ? 'lg:col-span-3'
          : count % 3 === 1 && index === count - 1
            ? 'lg:col-span-6'
            : 'lg:col-span-2',
      ),
  }
}

/** Up to 3 tiles in a row (product page „W zestawach”, industry page „Gotowe zestawy”). */
export function BundleGrid({
  bundles,
  headingLevel = 'h3',
  phoneRow = false,
}: {
  bundles: BundleCardData[]
  headingLevel?: 'h3' | 'h4'
  /** Below 768 px one row to swipe (product page, board App-Produkt). */
  phoneRow?: boolean
}) {
  const layout = gridLayout(bundles.length)
  return (
    <ul
      className={cx(
        'grid gap-4 sm:gap-5',
        layout.cols,
        phoneRow &&
          '[scrollbar-width:none] max-md:-mx-4 max-md:-my-2 max-md:flex max-md:snap-x max-md:scroll-px-4 max-md:overflow-x-auto max-md:px-4 max-md:py-2',
      )}
    >
      {bundles.map((bundle, index) => (
        <li
          key={bundle.slug}
          className={cx(
            'min-w-0',
            layout.span(index),
            phoneRow && 'relative max-md:w-[80%] max-md:shrink-0 max-md:snap-start',
          )}
        >
          <BundleCard bundle={bundle} headingLevel={headingLevel} wide={bundles.length === 1} />
        </li>
      ))}
    </ul>
  )
}

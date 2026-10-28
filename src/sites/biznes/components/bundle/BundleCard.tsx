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
}: {
  bundle: BundleCardData
  headingLevel?: 'h2' | 'h3' | 'h4'
}) {
  const Heading = headingLevel
  return (
    <Link
      href={bundle.href}
      className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_var(--border)] transition-shadow hover:shadow-[inset_0_0_0_1.5px_var(--ink-3),0_18px_40px_-28px_var(--glow)]"
    >
      <ProductStage className="h-[180px] gap-1 px-4 sm:h-[200px]">
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
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="self-start rounded-md bg-surface-2 px-2 py-1 text-xs font-bold text-ink-2">
          {bundle.label}
        </span>
        <Heading className="font-display text-lg leading-snug font-extrabold text-ink">
          {bundle.name}
        </Heading>
        <p className="text-sm leading-relaxed text-ink-2">{bundle.benefit}</p>
        <p className="mt-auto pt-1 text-sm font-extrabold text-accent-text">
          {bundle.count} {plural(bundle.count, ['element', 'elementy', 'elementów'])}
          <span aria-hidden="true"> · </span>
          <span className="group-hover:underline">zobacz zestaw</span>
        </p>
      </div>
    </Link>
  )
}

/** Up to 3 tiles in a row (product page „W zestawach”, industry page „Gotowe zestawy”). */
export function BundleGrid({
  bundles,
  headingLevel = 'h3',
}: {
  bundles: BundleCardData[]
  headingLevel?: 'h3' | 'h4'
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {bundles.map((bundle) => (
        <li key={bundle.slug}>
          <BundleCard bundle={bundle} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  )
}

import { cx } from '@/components/ui/cx'
import type { BentoTile } from '@/lib/catalog/bento'

import { PathIcon, productIconPath } from './PathIcon'
import { ProductSection } from './ProductSection'

/**
 * „<nazwa> w skrócie” (K31-ZMIANY §4 pkt 3): the first tile dark and double height, four in a
 * 2 × 2 grid next to it (or two for a card with 3–4 parameters) — never an orphan tile. On a
 * phone (board App-Produkt) the dark tile spans the row and the rest go two by two.
 */
export function ProductBento({
  id,
  heading,
  tiles,
}: {
  id: string
  heading: string
  tiles: BentoTile[]
}) {
  const [first, ...rest] = tiles
  if (!first) return null
  return (
    <ProductSection id={id} eyebrow="Najważniejsze" heading={`${heading} w skrócie`}>
      <ul
        data-bento=""
        className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3 lg:grid-rows-2 lg:gap-3.5"
      >
        <li
          data-surface="dark"
          className="col-span-2 flex flex-col gap-3 rounded-[24px] bg-surface-dark p-5 text-white ring-1 ring-white/10 ring-inset max-md:gap-2 max-md:rounded-[20px] max-md:p-4 md:p-6 lg:col-span-1 lg:row-span-2"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-accent-on-dark">
            <PathIcon d={productIconPath(first.icon)} className="size-5" />
          </span>
          <span className="mt-2 text-xs font-extrabold tracking-[0.1em] text-white/75 uppercase max-md:mt-0">
            {first.label}
          </span>
          <span className="font-display text-[clamp(1.35rem,2vw,1.7rem)] leading-tight font-extrabold font-stretch-106%">
            {first.value}
          </span>
        </li>
        {rest.map((tile) => (
          <li
            key={tile.label}
            className={cx(
              'flex flex-col gap-2.5 rounded-[24px] bg-surface-2 p-5 max-md:gap-1.5 max-md:rounded-[18px] max-md:p-3.5 md:p-6',
              rest.length === 2 && 'lg:row-span-2',
            )}
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-card text-accent-text shadow-[inset_0_0_0_1px_var(--border)] max-md:size-8">
              <PathIcon d={productIconPath(tile.icon)} className="size-5" />
            </span>
            <span className="mt-1.5 text-xs font-extrabold tracking-[0.1em] text-ink-2 uppercase max-md:mt-0.5 max-md:text-[10.5px]">
              {tile.label}
            </span>
            <span
              data-tile-value=""
              className="text-[1.08rem] leading-snug font-extrabold text-ink max-md:text-[14px]"
            >
              {tile.value}
            </span>
          </li>
        ))}
      </ul>
    </ProductSection>
  )
}

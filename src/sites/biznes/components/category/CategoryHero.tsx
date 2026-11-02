import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { IndexImage } from '@/lib/catalog/catalogIndex'
import type { PublicImage } from '@/lib/media/public'
import { BZ_H1_CARD, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../Breadcrumbs'

export type CategoryChip = { name: string; href: string; count: number; current: boolean }

type Props = {
  /** Short H1 of the card (board: „Kasy fiskalne”, „Laptopy dla firm — Lenovo, Dell i Apple”). */
  title: string
  /** Eyebrow over the H1: the category's name. */
  eyebrow: string
  lead: string | null
  crumbs: Crumb[]
  /** The department's categories with their counts, the current one first in white. */
  chips: CategoryChip[]
  /** Up to 3 product photos on white tiles, as on the board. */
  photos: IndexImage[]
  /** The category's own picture from the panel: the first, large tile when set. */
  image?: PublicImage | null
}

/** Board sizes of the three photo tiles: a large one and two smaller, stacked on the right. */
const TILES = [
  'row-span-2 aspect-[4/3] self-center',
  'aspect-[5/3] -translate-x-2',
  'aspect-[5/3] w-[86%] -translate-x-5',
]

/**
 * Hero of a category as on the boards `Web-kategoria-*` (prompt 2 W3): a dark card with the
 * eyebrow, a short H1, the lead and the chips of the department's categories; on the right three
 * product photos on white tiles. No buttons: the grid follows right under the card.
 */
export function CategoryHero({ title, eyebrow, lead, crumbs, chips, photos, image = null }: Props) {
  const shown = image ? photos.slice(0, 2) : photos.slice(0, 3)
  return (
    <section aria-labelledby="kategoria-h1" className="pt-5 pb-8 sm:pt-6">
      <Container wide>
        <Breadcrumbs items={crumbs} />
        <div
          data-surface="dark"
          className="mt-5 grid gap-8 overflow-hidden rounded-[32px] bg-surface-dark bg-[radial-gradient(120%_120%_at_0%_0%,color-mix(in_srgb,var(--accent-text)_40%,transparent),transparent_55%)] p-6 text-white sm:p-10 min-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[1080px]:items-center min-[1080px]:px-12 min-[1080px]:py-14"
        >
          <div className="flex min-w-0 flex-col gap-4">
            <p className="flex items-center gap-2 text-[13px] font-extrabold tracking-[0.12em] text-accent-on-dark uppercase">
              <span aria-hidden="true" className="h-0.5 w-5 bg-current" />
              {eyebrow}
            </p>
            <h1 id="kategoria-h1" className={BZ_H1_CARD}>
              {title}
            </h1>
            {lead && <p className={`${BZ_LEAD} max-w-[52ch] text-white/80`}>{lead}</p>}
            {chips.length > 1 && (
              <nav aria-label="Kategorie działu" className="pt-2">
                {/* Phone (board App-Kategoria): one row to swipe; wider: wrapped. */}
                <ul className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {chips.map((chip) => (
                    <li key={chip.href} className="shrink-0">
                      <Link
                        href={chip.href}
                        aria-current={chip.current ? 'page' : undefined}
                        className={cx(
                          'inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[15px] font-extrabold transition-colors',
                          chip.current
                            ? 'bg-white text-surface-dark'
                            : 'text-white shadow-[inset_0_0_0_1.5px_color-mix(in_srgb,var(--c-white)_22%,transparent)] hover:bg-white/10',
                        )}
                      >
                        {chip.name}
                        <span
                          className={cx(
                            'text-xs',
                            chip.current ? 'text-surface-dark' : 'text-white/70',
                          )}
                        >
                          {chip.count}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
          {(image || shown.length > 0) && (
            // Catalog photos have a white background: white tiles in both themes.
            <ul
              aria-hidden="true"
              className="grid grid-cols-[1.45fr_1fr] grid-rows-2 items-center gap-3 max-[1079px]:hidden"
            >
              {image && (
                <li
                  className={cx(
                    'flex items-center justify-center overflow-hidden rounded-[22px] bg-white p-4 shadow-[0_30px_50px_-30px_var(--glow)]',
                    TILES[0],
                  )}
                >
                  <MediaImage
                    image={{ ...image, alt: '' }}
                    sizes="(min-width: 1080px) 28vw, 1px"
                    className="h-auto max-h-full w-auto max-w-[82%] object-contain"
                  />
                </li>
              )}
              {shown.map((photo, i) => {
                const position = image ? i + 1 : i
                return (
                  <li
                    key={photo.url}
                    className={cx(
                      'flex items-center justify-center rounded-[22px] bg-white p-4 shadow-[0_30px_50px_-30px_var(--glow)]',
                      TILES[position],
                    )}
                  >
                    <Image
                      src={photo.url}
                      alt=""
                      width={photo.width}
                      height={photo.height}
                      unoptimized
                      // Hidden on phones: a lazy image in `display: none` is not downloaded.
                      loading="lazy"
                      className="h-auto max-h-full w-auto max-w-[82%] object-contain"
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}

'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { IndexLogo } from '@/lib/catalog/catalogIndex'
import type { IconName } from '@/lib/catalog/options'
import type { PublicImage } from '@/lib/media/public'

import { ProductStage, STAGE_SHADOW, StageFallback } from '../ProductStage'
import { useProductConfig } from './ProductConfig'

type Props = {
  name: string
  images: PublicImage[]
  brand: { name: string; logo?: IndexLogo } | null
  /** Picture without a photo: the category icon on the studio (K31-ZMIANY §4.10). */
  icon: IconName
  /** Id of the video section: „Zobacz film” and the „Film” thumbnail lead there. */
  videoTarget: string | null
  /** Slide of each colour (K32 §9): a picked colour shows its picture. */
  colorSlides?: (number | null)[]
  /** No photo: the navy „Usługa PRO-KOM” tile instead of the stand-in (K36 §5). */
  service?: boolean
}

const SWIPE = 40

/** Thumbnails in the column, as on the board; the last one counts the rest („+4”). */
const MAX_THUMBS = 5

/** Dots on a phone up to this many photos (44 px each); more → the „1 / N” counter only. */
const MAX_DOTS = 6

/**
 * Gallery of the product page (K31-ZMIANY §4 pkt 1): photos on the studio, thumbnails in a
 * column with a „Film” one when there is a video, the brand logo, „1 / N” only with 2+ photos.
 * On a phone: swipe and dots instead of thumbnails. Without photos: the stand-in, no counter.
 */
export function ProductGallery({
  name,
  images,
  brand,
  icon,
  videoTarget,
  colorSlides = [],
  service = false,
}: Props) {
  const [active, setActive] = useState(0)
  // A colour picked in the hero turns the gallery to its picture (adjusted while rendering).
  const { color } = useProductConfig()
  const [shownColor, setShownColor] = useState(color)
  if (shownColor !== color) {
    setShownColor(color)
    const slide = color === null ? null : colorSlides[color]
    if (slide !== null && slide !== undefined) setActive(slide)
  }
  const touch = useRef<number | null>(null)
  const count = images.length
  const image = images[active]
  const go = (delta: number) => setActive((current) => (current + delta + count) % count)

  const showVideo = () => {
    if (!videoTarget) return
    const target = document.getElementById(videoTarget)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    target?.querySelector<HTMLButtonElement>('button[data-play]')?.focus({ preventScroll: true })
  }

  return (
    <div className="flex min-w-0 gap-3 lg:gap-4">
      {(count > 1 || (count > 0 && videoTarget)) && (
        <ul aria-label="Zdjęcia" className="hidden w-[84px] shrink-0 flex-col gap-3 lg:flex">
          {images.slice(0, MAX_THUMBS).map((thumb, position) => (
            <li key={position}>
              <button
                type="button"
                onClick={() =>
                  // „+N” walks on through the photos it hides; the others pick their own.
                  setActive(
                    position === MAX_THUMBS - 1 && count > MAX_THUMBS && active >= position
                      ? (active + 1) % count
                      : position,
                  )
                }
                aria-pressed={
                  position === MAX_THUMBS - 1 && count > MAX_THUMBS
                    ? active >= position
                    : active === position
                }
                aria-label={
                  position === MAX_THUMBS - 1 && count > MAX_THUMBS
                    ? `+${count - MAX_THUMBS} — zdjęcie ${position + 1} z ${count}: ${name}`
                    : `Zdjęcie ${position + 1} z ${count}: ${name}`
                }
                className="group/thumb relative block overflow-hidden rounded-2xl"
              >
                <ProductStage as="span" className="size-[84px] p-2.5">
                  <MediaImage
                    image={thumb}
                    sizes="84px"
                    className="relative h-full w-full object-contain"
                  />
                </ProductStage>
                {position === MAX_THUMBS - 1 && count > MAX_THUMBS && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-surface-dark/60 font-display text-lg font-extrabold text-white"
                  >
                    +{count - MAX_THUMBS}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={cx(
                    'pointer-events-none absolute inset-0 rounded-2xl',
                    active === position
                      ? 'shadow-[inset_0_0_0_2px_var(--accent-text)]'
                      : 'shadow-[inset_0_0_0_1px_var(--border)] group-hover/thumb:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                  )}
                />
              </button>
            </li>
          ))}
          {videoTarget && (
            <li>
              <button
                type="button"
                onClick={showVideo}
                aria-label={`Film: ${name}`}
                className="relative flex size-[84px] items-center justify-center overflow-hidden rounded-2xl bg-surface-dark text-white"
              >
                {images[0] && (
                  <MediaImage
                    image={images[0]}
                    sizes="84px"
                    className="absolute inset-0 h-full w-full object-contain p-2.5 opacity-45"
                  />
                )}
                <span className="relative flex size-9 items-center justify-center rounded-full bg-white/90 text-surface-dark">
                  <PlayMark />
                </span>
              </button>
            </li>
          )}
        </ul>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div
          className="relative isolate overflow-hidden rounded-[26px] bg-card sm:rounded-[32px]"
          onTouchStart={(event) => {
            touch.current = event.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(event) => {
            const start = touch.current
            const end = event.changedTouches[0]?.clientX
            touch.current = null
            if (start === null || end === undefined || count < 2) return
            if (Math.abs(end - start) > SWIPE) go(end < start ? 1 : -1)
          }}
        >
          <ProductStage className="aspect-[4/3.4] w-full px-8 pt-16 pb-12 sm:aspect-[1/0.92] lg:aspect-[1/0.95]">
            {image ? (
              <MediaImage
                image={image}
                sizes="(min-width: 1024px) 560px, 100vw"
                eager={active === 0}
                className={cx(
                  'relative max-h-full w-auto max-w-[86%] object-contain',
                  STAGE_SHADOW,
                )}
              />
            ) : (
              <StageFallback icon={icon} size="lg" name={name} service={service} />
            )}
          </ProductStage>
          {/* Audit 01.11: below 640 px the brand chip under the gallery names it, and the lazy
              logo left an empty white badge until it loaded. */}
          {brand && (
            <span className="absolute top-5 left-5 hidden h-10 items-center rounded-xl bg-white px-3 shadow-[0_8px_20px_-14px_var(--shd),inset_0_0_0_1px_var(--border)] sm:inline-flex">
              {brand.logo ? (
                <Image
                  src={brand.logo.url}
                  alt={brand.name}
                  width={brand.logo.width}
                  height={brand.logo.height}
                  loading="eager"
                  unoptimized
                  className="h-auto max-h-[18px] w-auto max-w-[96px] object-contain"
                />
              ) : (
                <span className="text-sm font-black text-surface-dark">{brand.name}</span>
              )}
            </span>
          )}
          {videoTarget && (
            <button
              type="button"
              onClick={showVideo}
              className="absolute top-4 right-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-dark px-4 text-sm font-extrabold text-white sm:top-5 sm:right-5"
            >
              <PlayMark />
              Zobacz film
            </button>
          )}
          {count > 1 && (
            <div className="absolute right-4 bottom-4 hidden gap-2 sm:right-5 sm:bottom-5 lg:flex">
              {(
                [
                  [-1, 'Poprzednie zdjęcie', 'M15 6l-6 6 6 6'],
                  [1, 'Następne zdjęcie', 'M9 6l6 6-6 6'],
                ] as const
              ).map(([delta, label, path]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(delta)}
                  aria-label={label}
                  className="flex size-11 items-center justify-center rounded-full bg-card text-ink shadow-[0_8px_20px_-12px_var(--shd),inset_0_0_0_1px_var(--border)] hover:text-accent-text"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d={path}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          )}
          {count > 1 && (
            <span
              aria-live="polite"
              className="absolute bottom-4 left-4 rounded-full bg-card px-2.5 py-1 text-xs font-extrabold text-ink-2 shadow-[inset_0_0_0_1px_var(--border)] sm:bottom-5 sm:left-5"
            >
              {active + 1} / {count}
            </span>
          )}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_var(--border)]"
          />
        </div>

        {count > 1 && count <= MAX_DOTS && (
          <div className="flex justify-center gap-1.5 lg:hidden">
            {images.map((_, position) => (
              <button
                key={position}
                type="button"
                onClick={() => setActive(position)}
                aria-pressed={active === position}
                aria-label={`Zdjęcie ${position + 1} z ${count}`}
                className="flex size-11 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-2 rounded-full transition-[width]',
                    active === position ? 'w-6 bg-accent-text' : 'w-2 bg-ink-3',
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PlayMark() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
      <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
    </svg>
  )
}

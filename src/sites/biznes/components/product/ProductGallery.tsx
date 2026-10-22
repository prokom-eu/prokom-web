'use client'

import { useId, useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { ProductBadge, BadgeTone } from '@/lib/catalog/card'
import type { IconName } from '@/lib/catalog/options'
import type { ProductView } from '@/lib/catalog/product'

const BADGE: Record<BadgeTone, string> = {
  service: 'bg-ink text-surface',
  new: 'bg-ok-text text-surface',
  promo: 'bg-promo text-promo-ink',
  authorized: 'bg-accent-text text-accent-ink',
}

type Props = {
  name: string
  images: ProductView['images']
  hotspots: ProductView['hotspots']
  modules: ProductView['modules']
  badges: ProductBadge[]
  /** Picture without a photo: the icon on the gradient of the product's group, as on the card. */
  fallback: { icon: IconName; gradient: [string, string] | null }
}

/**
 * Gallery of the product page (spec. §6.2): the main photo, thumbnails, and — only when set in
 * the panel — numbered points over the first photo with their description below it. Module
 * cards follow the gallery. Points never cover the photo for keyboard users: each is a button.
 */
export function ProductGallery({ name, images, hotspots, modules, badges, fallback }: Props) {
  const [active, setActive] = useState(0)
  const [point, setPoint] = useState(0)
  const id = useId()
  const image = images[active]
  const showPoints = active === 0 && hotspots.length > 0
  const current = hotspots[point]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative isolate overflow-hidden rounded-[26px] bg-surface-2 bg-[radial-gradient(ellipse_at_50%_70%,var(--glow),transparent_68%)] shadow-[inset_0_0_0_1px_var(--border)] sm:rounded-[32px]">
        <div className="relative flex min-h-[300px] items-center justify-center px-6 pb-6 pt-14 sm:min-h-[480px] sm:px-10 sm:pb-10">
          {image ? (
            // The frame takes the photo's own size, so points in % land where they were set.
            <div className="relative">
              <MediaImage
                image={image}
                sizes="(min-width: 1024px) 720px, 100vw"
                eager={active === 0}
                className="block h-auto max-h-[240px] w-auto max-w-full drop-shadow-[0_30px_40px_var(--glow)] sm:max-h-[400px]"
              />
              {showPoints &&
                hotspots.map((spot, position) => (
                  <button
                    key={position}
                    type="button"
                    onClick={() => setPoint(position)}
                    aria-pressed={point === position}
                    aria-controls={`${id}-punkt`}
                    aria-label={`Punkt ${position + 1}: ${spot.title}`}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className={cx(
                      'absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-sm font-extrabold shadow-[0_0_0_4px_var(--surface)] transition-transform hover:scale-110 motion-reduce:transition-none',
                      point === position
                        ? 'bg-promo text-promo-ink'
                        : 'bg-accent-text text-accent-ink',
                    )}
                  >
                    {position + 1}
                  </button>
                ))}
            </div>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-28 items-center justify-center rounded-[34px] bg-accent-text text-white sm:size-36"
              style={
                fallback.gradient
                  ? {
                      backgroundImage: `linear-gradient(145deg, ${fallback.gradient[0]}, ${fallback.gradient[1]})`,
                    }
                  : undefined
              }
            >
              <Icon name={fallback.icon} className="size-12 sm:size-16" />
            </span>
          )}
        </div>
        {badges.length > 0 && (
          <ul className="absolute inset-x-4 top-4 flex flex-wrap gap-1.5 sm:inset-x-5 sm:top-5">
            {badges.map((badge) => (
              <li
                key={badge.label}
                className={cx(
                  'rounded-full px-2.5 py-1 text-xs font-extrabold leading-none',
                  BADGE[badge.tone],
                )}
              >
                {badge.label}
              </li>
            ))}
          </ul>
        )}
        {showPoints && current && (
          <div
            id={`${id}-punkt`}
            aria-live="polite"
            className="mx-4 mb-4 rounded-2xl bg-card px-4 py-3 shadow-[inset_0_0_0_1px_var(--border)] sm:mx-5 sm:mb-5"
          >
            <p className="font-extrabold text-ink">{current.title}</p>
            {current.description && (
              <p className="mt-0.5 text-sm leading-relaxed text-ink-2">{current.description}</p>
            )}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <ul aria-label="Zdjęcia" className="flex gap-2 overflow-x-auto pb-1">
          {images.map((thumb, position) => (
            <li key={position} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(position)}
                aria-pressed={active === position}
                aria-label={`Zdjęcie ${position + 1} z ${images.length}: ${name}`}
                className={cx(
                  'relative flex size-[72px] items-center justify-center overflow-hidden rounded-xl bg-surface-2 p-1.5 sm:size-20',
                  active === position
                    ? 'shadow-[inset_0_0_0_2px_var(--accent-text)]'
                    : 'shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                <MediaImage image={thumb} sizes="80px" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {modules.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {modules.map((module) => (
            <li
              key={module.name}
              className="flex flex-col gap-1.5 rounded-[18px] bg-card p-3.5 shadow-[inset_0_0_0_1px_var(--border)]"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 text-accent-text">
                <Icon name={module.icon ?? 'check'} className="size-4" strokeWidth={2.1} />
              </span>
              <span className="text-sm font-extrabold text-ink">{module.name}</span>
              {module.description && (
                <span className="text-xs leading-snug text-ink-3">{module.description}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

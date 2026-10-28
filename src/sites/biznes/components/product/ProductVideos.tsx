'use client'

import { useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { ProductVideo } from '@/lib/catalog/product'
import type { PublicImage } from '@/lib/media/public'

import { VideoFacade, videoMeta } from '../VideoFacade'
import { ProductSection } from './ProductSection'

/**
 * „Zobacz w działaniu” (K31-ZMIANY §7, ADR-016): a facade — the product photo on a dark poster
 * with the title, channel and language and „▶”. The YouTube iframe is created only after the
 * click; before it the page makes no request to YouTube. Up to 2 videos in the list.
 */
export function ProductVideos({
  id,
  videos,
  poster,
}: {
  id: string
  videos: ProductVideo[]
  poster: PublicImage | null
}) {
  const [current, setCurrent] = useState(0)
  const video = videos[current]
  if (!video) return null

  return (
    <ProductSection id={id} eyebrow="Film producenta" heading="Zobacz w działaniu">
      <div className={cx('grid gap-5', videos.length > 1 && 'lg:grid-cols-[minmax(0,1fr)_340px]')}>
        <VideoFacade
          key={video.id}
          video={video}
          label="Film o tym produkcie"
          poster={
            poster && (
              <MediaImage
                image={poster}
                sizes="(min-width: 1024px) 420px, 50vw"
                className="max-h-full w-auto max-w-full object-contain opacity-80"
              />
            )
          }
        />

        <div className="flex flex-col gap-3">
          {videos.length > 1 && (
            <ul className="flex flex-col gap-3">
              {videos.map((item, position) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={current === position}
                    onClick={() => {
                      setCurrent(position)
                    }}
                    className={cx(
                      'flex w-full items-start gap-3 rounded-[20px] p-3 text-left transition-shadow',
                      current === position
                        ? 'bg-accent-soft shadow-[inset_0_0_0_2px_var(--accent-text)]'
                        : 'bg-surface-2 hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                    )}
                  >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface-dark text-white">
                      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                        <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm leading-snug font-extrabold text-ink">
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-2">{videoMeta(item)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs leading-relaxed text-ink-2">
            Film z oficjalnego kanału producenta. Odtwarza się dopiero po kliknięciu (YouTube w
            trybie bez plików cookie).
          </p>
        </div>
      </div>
    </ProductSection>
  )
}

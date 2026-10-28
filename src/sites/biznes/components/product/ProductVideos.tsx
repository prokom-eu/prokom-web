'use client'

import { useState } from 'react'

import { MediaImage } from '@/components/MediaImage'
import { cx } from '@/components/ui/cx'
import type { ProductVideo } from '@/lib/catalog/product'
import type { PublicImage } from '@/lib/media/public'

import { ProductSection } from './ProductSection'

const LANGUAGES: Record<string, string> = {
  pl: 'po polsku',
  en: 'po angielsku',
  de: 'po niemiecku',
}

/** „Lenovo · po angielsku” under a video title. */
export function videoMeta(video: ProductVideo): string {
  const lang = video.lang ? (LANGUAGES[video.lang.toLowerCase()] ?? video.lang) : null
  return [video.channel, lang].filter(Boolean).join(' · ')
}

/** The player address after the click (ADR-016): youtube-nocookie, autoplay, no suggestions. */
export const embedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0&playsinline=1`

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
  const [playing, setPlaying] = useState(false)
  const video = videos[current]
  if (!video) return null

  return (
    <ProductSection id={id} eyebrow="Film producenta" heading="Zobacz w działaniu">
      <div className={cx('grid gap-5', videos.length > 1 && 'lg:grid-cols-[minmax(0,1fr)_340px]')}>
        <div
          data-surface="dark"
          className="relative aspect-video overflow-hidden rounded-[28px] bg-surface-dark text-white"
        >
          {playing ? (
            <iframe
              src={embedUrl(video.id)}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 size-full border-0"
            />
          ) : (
            <button
              type="button"
              data-play
              onClick={() => setPlaying(true)}
              className="group/play absolute inset-0 grid size-full text-left"
            >
              <span className="sr-only">Odtwórz film: </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(70%_80%_at_70%_45%,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_70%)]"
              />
              {poster && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-[14%] right-[6%] flex w-[48%] items-center justify-center"
                >
                  <MediaImage
                    image={poster}
                    sizes="(min-width: 1024px) 420px, 50vw"
                    className="max-h-full w-auto max-w-full object-contain opacity-80"
                  />
                </span>
              )}
              <span className="absolute top-5 left-5 flex size-16 items-center justify-center rounded-full bg-white/90 text-surface-dark ring-[10px] ring-white/10 transition-transform group-hover/play:scale-105 sm:top-8 sm:left-8 sm:size-20">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                </svg>
              </span>
              <span className="absolute inset-x-5 bottom-5 flex max-w-[30rem] flex-col gap-2 sm:inset-x-8 sm:bottom-8 sm:max-w-[44%]">
                <span className="text-xs font-extrabold tracking-[0.12em] text-white/75 uppercase">
                  Film o tym produkcie
                </span>
                <span className="font-display text-[clamp(1.2rem,2.4vw,1.9rem)] leading-tight font-extrabold font-stretch-106%">
                  {video.title}
                </span>
                <span className="text-sm text-white/75">{videoMeta(video)}</span>
              </span>
            </button>
          )}
        </div>

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
                      setPlaying(false)
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

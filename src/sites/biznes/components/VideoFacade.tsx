'use client'

import { useState, type ReactNode } from 'react'

import type { ProductVideo } from '@/lib/catalog/product'

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
 * A producer's film behind a facade (ADR-016): a dark poster with the title, channel and
 * language and „▶”; the YouTube iframe is created only after the click, so before it the page
 * makes no request to YouTube. Give it `key={video.id}` to reset it when the film changes.
 */
export function VideoFacade({
  video,
  label,
  poster,
}: {
  video: ProductVideo
  /** „Film o tym produkcie”, „Film Lenovo”. */
  label: string
  /** Photo on the right of the poster (decorative). */
  poster?: ReactNode
}) {
  const [playing, setPlaying] = useState(false)
  return (
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
              {poster}
            </span>
          )}
          <span className="absolute top-5 left-5 flex size-16 items-center justify-center rounded-full bg-white/90 text-surface-dark ring-[10px] ring-white/10 transition-transform group-hover/play:scale-105 sm:top-8 sm:left-8 sm:size-20">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
            </svg>
          </span>
          <span className="absolute inset-x-5 bottom-5 flex max-w-[30rem] flex-col gap-2 sm:inset-x-8 sm:bottom-8 sm:max-w-[44%]">
            <span className="text-xs font-extrabold tracking-[0.12em] text-white/75 uppercase">
              {label}
            </span>
            <span className="font-display text-[clamp(1.2rem,2.4vw,1.9rem)] leading-tight font-extrabold font-stretch-106%">
              {video.title}
            </span>
            <span className="text-sm text-white/75">{videoMeta(video)}</span>
          </span>
        </button>
      )}
    </div>
  )
}

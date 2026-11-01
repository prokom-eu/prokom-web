'use client'

import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { productHref } from '@/lib/catalog/card'

import { VideoFacade } from '../../../components/VideoFacade'
import { CARD } from '../ui'

/** `videos`: the picked film behind the facade (ADR-016) and the list of films next to it. */
export function VideoPicker({ data }: { data: SectionData<'videos'> }) {
  const [current, setCurrent] = useState(0)
  const video = data.videos[current] ?? data.videos[0]!
  return (
    <div className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <VideoFacade
        key={video.id}
        video={{ id: video.id, title: video.t, channel: video.k, lang: null }}
        label={data.label}
      />
      <div className="flex flex-col gap-2">
        <ul className="flex flex-col gap-2">
          {data.videos.map((item, i) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                className={cx(
                  'flex min-h-14 w-full flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-shadow',
                  i === current
                    ? 'bg-card shadow-[inset_0_0_0_2px_var(--accent-text)]'
                    : 'bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                <span className="leading-snug font-extrabold text-ink">{item.t}</span>
                <span className="text-[13px] text-ink-3">{item.k}</span>
              </button>
            </li>
          ))}
        </ul>
        {data.note && <p className="mt-2 text-[13px] text-ink-3">{data.note}</p>}
      </div>
    </div>
  )
}

/** `tabs`: groups of entries behind tabs (arrow keys move between tabs). */
export function TabsPicker({ data }: { data: SectionData<'tabs'> }) {
  const [current, setCurrent] = useState(0)
  const base = useId()
  const tab = data.tabs[current] ?? data.tabs[0]!
  const move = (delta: number) => {
    const next = (current + delta + data.tabs.length) % data.tabs.length
    setCurrent(next)
    document.getElementById(`${base}-t${next}`)?.focus()
  }
  return (
    <div>
      <div
        role="tablist"
        aria-label="Obszary"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') move(1)
          if (event.key === 'ArrowLeft') move(-1)
          if (event.key === 'Home') move(-current)
          if (event.key === 'End') move(data.tabs.length - 1 - current)
        }}
      >
        {data.tabs.map((item, i) => (
          <button
            key={item.t}
            id={`${base}-t${i}`}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-controls={`${base}-p`}
            tabIndex={i === current ? 0 : -1}
            onClick={() => setCurrent(i)}
            className={cx(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 font-extrabold transition-colors',
              i === current
                ? 'bg-ink text-surface'
                : 'bg-card text-ink shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {item.t}
            <span className="text-[13px] opacity-70">{item.items.length}</span>
          </button>
        ))}
      </div>
      <div id={`${base}-p`} role="tabpanel" aria-labelledby={`${base}-t${current}`}>
        <ul className="mt-5 grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
          {tab.items.map((item) => (
            <li key={item.t} className={cx(CARD, 'flex flex-col gap-1.5 p-5 text-ink')}>
              {item.l && <span className="text-[13px] font-extrabold text-ink-3">{item.l}</span>}
              <b className="font-display text-[1.1rem] font-extrabold">{item.t}</b>
              <span className="text-[15px] leading-relaxed text-ink-2">{item.d}</span>
              {item.slug && (
                <Link
                  href={productHref(item.slug)}
                  className="mt-auto pt-2 font-extrabold text-accent-text hover:underline"
                >
                  Zobacz kartę →
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

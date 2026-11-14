'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useId, useState } from 'react'

import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import { productHref } from '@/lib/catalog/card'
import type { IndexImage } from '@/lib/catalog/catalogIndex'

import { VideoFacade } from '../../../components/VideoFacade'
import { useSwap } from '../../../components/motion/useSwap'
import { AddActionButton } from '../AddActionButton'
import { BTN_PRIMARY, CARD, TAB_KEYS } from '../ui'
import { balancedGrid } from './grid'

/**
 * `videos`: the picked film behind the facade (ADR-016) and the list of films next to it. The
 * poster shows the producer's device or box when given (Web-gopos, Web-insert) — a photo from our
 * catalog, nothing from YouTube before the click.
 */
export function VideoPicker({
  data,
  poster = null,
}: {
  data: SectionData<'videos'>
  poster?: IndexImage | null
}) {
  const [current, setCurrent] = useState(0)
  const video = data.videos[current] ?? data.videos[0]!
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 max-md:gap-3 min-[1080px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <VideoFacade
        key={video.id}
        video={{ id: video.id, title: video.t, channel: video.k, lang: null }}
        label={data.label}
        poster={
          poster ? (
            <Image
              unoptimized
              src={poster.url}
              alt={poster.alt}
              width={poster.width}
              height={poster.height}
              className="max-h-full w-auto object-contain"
            />
          ) : undefined
        }
      />
      <div className="flex min-w-0 flex-col gap-2">
        {/* Phone (App-GoPOS „Filmy”): the titles in one row of pills under the player. */}
        <ul className="flex flex-col gap-2 max-md:-mx-4 max-md:-my-2 max-md:flex-row max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:gap-2 max-md:overflow-x-auto max-md:px-4 max-md:py-2 max-md:[scrollbar-width:none]">
          {data.videos.map((item, i) => (
            <li key={item.id} className="max-md:w-[72%] max-md:shrink-0 max-md:snap-start">
              <button
                type="button"
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                className={cx(
                  'flex min-h-14 w-full flex-col gap-0.5 rounded-2xl px-4 py-3 text-left transition-shadow max-md:min-h-11 max-md:rounded-full max-md:py-2.5',
                  i === current
                    ? 'bg-card shadow-[inset_0_0_0_2px_var(--accent-text)] max-md:bg-ink max-md:shadow-none max-md:[&>span]:text-surface'
                    : 'bg-card shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                )}
              >
                <span className="leading-snug font-extrabold text-ink max-md:truncate max-md:text-[13px]">
                  <span className="min-[768px]:hidden">{i + 1}. </span>
                  {item.t}
                </span>
                <span className="text-[13px] text-ink-2 max-md:hidden">{item.k}</span>
              </button>
            </li>
          ))}
        </ul>
        {data.note && (
          <p className="mt-2 text-[13px] text-ink-2 max-md:mt-1 max-md:text-xs">{data.note}</p>
        )}
      </div>
    </div>
  )
}

/** `tabs`: groups of entries behind tabs (arrow keys move between tabs). */
/** A program of a tab, from its catalog card (server side, `tabsExtras`). */
export type TabProgram = {
  name: string
  image?: IndexImage
  benefit?: string
  features: string[]
}

/**
 * A program in action (PRODUKCJA-BIZNES-1211 §4): its real screen on the white plate, three
 * points of its card and „Dodaj do zapytania”.
 */
function ProgramShot({
  slug,
  screen,
  program,
}: {
  slug: string
  screen?: IndexImage
  program?: TabProgram
}) {
  const name = program?.name ?? slug
  return (
    <div className="mt-5 grid items-center gap-6 max-md:mt-3 max-md:gap-4 min-[1000px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      {screen && (
        <figure className="overflow-hidden rounded-[22px] bg-plate p-3 shadow-[0_18px_40px_-26px_var(--plate-shadow),inset_0_0_0_1px_var(--plate-shadow)]">
          <Image
            unoptimized
            src={screen.url}
            alt={screen.alt}
            width={screen.width}
            height={screen.height}
            className="h-auto w-full rounded-xl object-contain"
          />
        </figure>
      )}
      <div className="flex flex-col gap-4 text-ink max-md:gap-3">
        <h3 className="font-display text-[1.5rem] leading-tight font-extrabold max-md:text-xl">
          {name}
        </h3>
        {program?.benefit && (
          <p className="leading-relaxed text-pretty text-ink-2">{program.benefit}</p>
        )}
        {program && program.features.length > 0 && (
          <ul className="flex flex-col gap-2">
            {program.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-[15px] leading-snug">
                <span aria-hidden="true" className="font-extrabold text-ok-text">
                  ✓
                </span>
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <AddActionButton
            slug={slug}
            label="Dodaj do zapytania"
            note={`Pokaz programu: ${name}`}
            className={BTN_PRIMARY}
          />
          <Link
            href={productHref(slug)}
            className="inline-flex min-h-11 items-center font-extrabold text-accent-text hover:underline"
          >
            Karta programu<span className="sr-only">: {name}</span> →
          </Link>
        </div>
      </div>
    </div>
  )
}

export function TabsPicker({
  data,
  programs = {},
  screens = {},
}: {
  data: SectionData<'tabs'>
  programs?: Record<string, TabProgram>
  screens?: Record<string, IndexImage>
}) {
  const [current, setCurrent] = useState(0)
  const swap = useSwap(current)
  const base = useId()
  // A program tab whose card is not in the catalog (unpublished, slug changed in the panel) is
  // left out: no raw slug as a heading, no „Dodaj” of a missing product.
  const tabs = data.tabs.filter((item) => !item.shot || programs[item.shot.slug])
  const tab = tabs[current] ?? tabs[0]
  const grid = balancedGrid(tab?.items.length ?? 0, { phone: 1 })
  if (!tab) return null
  const move = (delta: number) => {
    const next = (current + delta + tabs.length) % tabs.length
    setCurrent(next)
    document.getElementById(`${base}-t${next}`)?.focus()
  }
  return (
    <div>
      <div
        role="tablist"
        aria-label={tabs.some((item) => item.shot) ? 'Programy' : 'Obszary'}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2"
        onKeyDown={(event) => {
          if (TAB_KEYS.has(event.key)) event.preventDefault()
          if (event.key === 'ArrowRight') move(1)
          if (event.key === 'ArrowLeft') move(-1)
          if (event.key === 'Home') move(-current)
          if (event.key === 'End') move(tabs.length - 1 - current)
        }}
      >
        {tabs.map((item, i) => (
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
            {item.items.length > 0 && (
              <span className="text-[13px] opacity-70">{item.items.length}</span>
            )}
          </button>
        ))}
      </div>
      <div id={`${base}-p`} role="tabpanel" aria-labelledby={`${base}-t${current}`} {...swap}>
        {tab.shot && (
          <ProgramShot
            slug={tab.shot.slug}
            screen={tab.shot.image !== undefined ? screens[String(tab.shot.image)] : undefined}
            program={programs[tab.shot.slug]}
          />
        )}
        {/* Phone (App-InsERT „Cała oferta”): the entries as rows of one list. */}
        {tab.items.length > 0 && (
          <ul
            className={cx(
              grid.list,
              'mt-5 gap-4 max-md:mt-3 max-md:gap-0 max-md:divide-y max-md:divide-border max-md:rounded-[20px] max-md:px-4 max-md:shadow-[inset_0_0_0_1px_var(--border)]',
            )}
          >
            {tab.items.map((item, index) => (
              <li
                key={item.t}
                className={cx(
                  CARD,
                  grid.item(index),
                  'flex flex-col gap-1.5 p-5 text-ink max-md:gap-0.5 max-md:rounded-none max-md:bg-transparent max-md:px-0 max-md:py-3 max-md:shadow-none',
                )}
              >
                <div className="flex items-start gap-3">
                  {/* The program's box from its card (PRODUKCJA-BIZNES-1211 §4). */}
                  {item.slug && programs[item.slug]?.image && (
                    <Image
                      unoptimized
                      src={programs[item.slug]!.image!.url}
                      // The box is the program's picture: named for readers and search (QA 13.11).
                      alt={`Pudełko programu ${programs[item.slug]!.name}`}
                      width={programs[item.slug]!.image!.width}
                      height={programs[item.slug]!.image!.height}
                      className="h-20 w-16 shrink-0 object-contain max-md:h-14 max-md:w-11"
                    />
                  )}
                  <div className="flex min-w-0 flex-col gap-1">
                    {item.l && (
                      <span className="text-[13px] font-extrabold text-ink-2 max-md:text-[11px]">
                        {item.l}
                      </span>
                    )}
                    <b className="font-display text-[1.1rem] font-extrabold max-md:text-[15px]">
                      {item.t}
                    </b>
                    <span className="text-[15px] leading-relaxed text-ink-2 max-md:text-[13px] max-md:leading-snug">
                      {item.d}
                    </span>
                  </div>
                </div>
                {item.slug && programs[item.slug]?.benefit && (
                  <p className="text-[14px] leading-snug text-ink-2 max-md:hidden">
                    {programs[item.slug]!.benefit}
                  </p>
                )}
                {item.slug && (programs[item.slug]?.features.length ?? 0) > 0 && (
                  <ul className="flex flex-col gap-1 max-md:hidden">
                    {programs[item.slug]!.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-[14px] leading-snug">
                        <span aria-hidden="true" className="text-ok-text">
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
                {item.slug && (
                  <Link
                    href={productHref(item.slug)}
                    className="mt-auto pt-2 font-extrabold text-accent-text hover:underline max-md:inline-flex max-md:min-h-11 max-md:items-center max-md:pt-0 max-md:text-[13px]"
                  >
                    Zobacz kartę →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

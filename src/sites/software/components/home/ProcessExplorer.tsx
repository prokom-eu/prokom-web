'use client'

import { type ReactNode, useEffect, useId, useState } from 'react'

import { cx } from '@/components/ui/cx'

import { TabPanels, usePanelActive } from './TabPanels'
import { useAutoTabs } from './useAutoTabs'
import { CarouselDots } from '../CarouselDots'

/** Board `Main`: the stages change every 5,2 s until the visitor picks one (spec. §8.3). */
export const PROCESS_AUTO_MS = 5200

type Stage = { num: string; name: string; duration: string | null }

/**
 * Stages of „Jak pracujemy i jak powstaje cena” (spec. §4 pkt 6): ARIA tabs on a line that
 * fills up to the chosen stage, the next stage every 5,2 s until the visitor picks one. The
 * panels come rendered from the server. Phone: the stages are a scrolling row.
 */
export function ProcessExplorer({ stages, panels }: { stages: Stage[]; panels: ReactNode[] }) {
  const id = useId()
  const { active, onKeyDown, pick, tabRef, region } = useAutoTabs(stages.length, PROCESS_AUTO_MS)
  const fill = stages.length > 1 ? (active / (stages.length - 1)) * 100 : 0

  return (
    <div className="flex flex-col gap-5 min-[640px]:gap-7" {...region}>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute top-[26px] right-[10%] left-[10%] hidden h-[3px] rounded-full bg-border min-[641px]:block"
        >
          <i
            className="block h-full w-full origin-left rounded-full bg-accent transition-transform duration-(--dur-enter) ease-(--ease-out) motion-reduce:transition-none"
            style={{ transform: `scaleX(${fill / 100})` }}
          />
        </div>
        <div
          id={`${id}-tabs`}
          role="tablist"
          aria-label="Etapy"
          onKeyDown={onKeyDown}
          className="relative -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-5 min-[641px]:overflow-visible min-[641px]:px-0"
        >
          {stages.map((stage, i) => {
            const selected = i === active
            return (
              <button
                key={stage.num}
                ref={tabRef(i)}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => pick(i)}
                className="group flex min-w-[118px] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl px-2 py-1 text-center"
              >
                <span
                  className={cx(
                    'grid size-[52px] place-items-center rounded-full border-2 font-display text-base font-extrabold transition-colors',
                    selected
                      ? 'border-accent bg-button text-accent-ink ring-[6px] ring-accent-soft'
                      : i < active
                        ? 'border-accent bg-card text-accent-text'
                        : 'border-border bg-card text-ink group-hover:border-accent-line',
                  )}
                >
                  {stage.num}
                </span>
                <b
                  className={cx(
                    'text-[15px] font-extrabold',
                    selected ? 'text-accent-text' : 'text-ink',
                  )}
                >
                  {stage.name}
                </b>
                {stage.duration && <span className="text-[13px] text-ink-2">{stage.duration}</span>}
              </button>
            )
          })}
        </div>
        <CarouselDots listId={`${id}-tabs`} count={stages.length} className="min-[641px]:hidden" />
      </div>
      <TabPanels id={id} panels={panels} active={active} />
    </div>
  )
}

/**
 * Board: the test version moves on a week every 1,4 s (stage 3) — only while its stage is the
 * shown one and the browser tab is visible; still with reduced motion.
 */
const WEEKS = 6
const WEEK_MS = 1400

export function WeekTrack() {
  const [week, setWeek] = useState(5)
  const shown = usePanelActive()

  useEffect(() => {
    if (!shown || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      if (!document.hidden) setWeek((current) => (current % WEEKS) + 1)
    }, WEEK_MS)
    return () => window.clearInterval(timer)
  }, [shown])

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-6 gap-1.5 text-center">
        {Array.from({ length: WEEKS }, (_, i) => {
          const n = i + 1
          const state = n < week ? 'odebrane' : n === week ? 'teraz' : 'plan'
          return (
            <span key={n} className="flex flex-col gap-1.5">
              <b className={cx('text-[13px]', n === week ? 'text-accent-text' : 'text-ink')}>
                T{n}
              </b>
              <i
                className={cx(
                  'h-1.5 rounded-full transition-colors',
                  n < week ? 'bg-accent' : n === week ? 'bg-accent-text' : 'bg-border',
                )}
              />
              <span className="text-[11px] text-ink-2">{state}</span>
            </span>
          )
        })}
      </div>
      <div className="rounded-2xl bg-surface-dark p-3 shadow-raised">
        <div className="relative flex h-[120px] gap-2 overflow-hidden rounded-lg bg-card p-2">
          <span className="flex w-8 flex-col gap-1.5 rounded bg-surface-dark p-1.5">
            <i className="h-1 rounded bg-accent" />
            <i className="h-1 rounded bg-white/30" />
            <i className="h-1 rounded bg-white/30" />
            <i className="h-1 rounded bg-white/30" />
          </span>
          <span className="flex flex-1 flex-col gap-2">
            <span className="flex gap-2">
              <i className="h-4 flex-1 rounded bg-surface-2" />
              <i className="h-4 flex-1 rounded bg-accent" />
              <i className="h-4 flex-1 rounded bg-surface-2" />
            </span>
            <i className="h-1.5 rounded bg-surface-2" />
            <i className="h-1.5 rounded bg-surface-2" />
            <i className="h-1.5 rounded bg-accent-soft" />
          </span>
          <span className="absolute top-2 right-2 inline-flex items-center gap-1.5 rounded-full bg-surface-dark px-2.5 py-1 text-[11px] font-extrabold text-white">
            <span className="size-1.5 rounded-full bg-ok" />
            wersja testowa · tydzień {week}
          </span>
        </div>
      </div>
    </div>
  )
}

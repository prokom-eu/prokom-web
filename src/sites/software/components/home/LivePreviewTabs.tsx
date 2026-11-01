'use client'

import { type ReactNode, useEffect, useId, useRef } from 'react'

import { SlidingPill } from '@/components/motion/SlidingPill'
import { cx } from '@/components/ui/cx'
import { labelKey } from '@/lib/analytics/events'
import { track } from '@/lib/analytics/track'
import { projectActions, useProject } from '@/lib/software/projectStore'

import { TabPanels } from './TabPanels'
import { useAutoTabs } from './useAutoTabs'

/** Board `Main`: the previews change every 6 s until the visitor picks one (spec. §8.3). */
export const PREVIEWS_AUTO_MS = 6000

type Tab = { label: string; icon: string }

type Props = {
  tabs: Tab[]
  /** Rendered on the server, one per tab; only the chosen one is shown. */
  panels: ReactNode[]
  /** [switching itself, after the visitor's pick]. */
  hint: readonly [string, string]
}

/**
 * Tabs of „Podglądy na żywo” (spec. §4 pkt 5): ARIA tabs with automatic activation, the next
 * preview every 6 s until the visitor picks one (`useAutoTabs`). Phone: a scrolling row.
 */
export function LivePreviewTabs({ tabs, panels, hint }: Props) {
  const id = useId()
  const tablist = useRef<HTMLDivElement>(null)
  const { active, picked, selfSwitching, onKeyDown, pick, tabRef, region } = useAutoTabs(
    tabs.length,
    PREVIEWS_AUTO_MS,
  )
  // `podglad_otworz` (ADR-020) only for the visitor's picks (click or arrows), not auto-switching.
  const pickedLabel = picked ? tabs[active]?.label : undefined
  useEffect(() => {
    if (pickedLabel) track('podglad_otworz', { podglad: labelKey(pickedLabel) })
  }, [pickedLabel])

  return (
    <div
      className="flex flex-col gap-5 rounded-[28px] border border-accent-line bg-accent-soft p-3 min-[640px]:gap-6 min-[640px]:rounded-[36px] min-[640px]:p-6"
      {...region}
    >
      <div className="flex flex-col gap-3 min-[1081px]:flex-row min-[1081px]:items-center min-[1081px]:justify-between">
        <div
          ref={tablist}
          role="tablist"
          aria-label="Rodzaj rozwiązania"
          onKeyDown={onKeyDown}
          className="group/pills relative -mx-3 flex snap-x gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] min-[640px]:mx-0 min-[640px]:flex-wrap min-[640px]:overflow-visible min-[640px]:px-0 min-[1081px]:w-fit min-[1081px]:rounded-2xl min-[1081px]:bg-card min-[1081px]:p-1.5 min-[1081px]:shadow-raised"
        >
          <SlidingPill container={tablist} active={active} className="bg-button" />
          {tabs.map((tab, i) => {
            const selected = i === active
            return (
              <button
                key={tab.label}
                ref={tabRef(i)}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={selected}
                aria-controls={`${id}-panel-${i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => pick(i)}
                className={cx(
                  'relative z-[1] inline-flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-xl px-4 text-sm font-extrabold transition-colors',
                  // `SlidingPill` is the chosen tab's background once drawn.
                  selected
                    ? 'bg-button text-accent-ink group-has-[[data-sliding-pill]]/pills:bg-transparent'
                    : 'bg-card text-ink hover:text-accent-text min-[1081px]:bg-transparent',
                )}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-[18px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            )
          })}
        </div>
        <p className="inline-flex items-center gap-2 px-1 text-[13px] font-bold text-ink-2">
          <span aria-hidden="true" className="relative grid size-3 place-items-center">
            {selfSwitching && (
              <span className="absolute size-3 rounded-full bg-ok/30 motion-safe:animate-ping" />
            )}
            <span className="size-2 rounded-full bg-ok" />
          </span>
          {/* „Switches by itself” only where it does (desktop, motion on, not stopped). */}
          {selfSwitching ? hint[0] : hint[1]}
        </p>
      </div>
      <TabPanels id={id} panels={panels} active={active} />
    </div>
  )
}

/** „Chcę takie u siebie” → one entry of „Twój projekt”; pressed again takes it out. */
export function PreviewProjectButton({
  item,
  labels,
}: {
  item: { id: string; name: string }
  labels: readonly [string, string]
}) {
  const added = useProject().some((entry) => entry.id === item.id)
  return (
    <button
      type="button"
      aria-pressed={added}
      onClick={() => projectActions.toggle(item.id, item.name)}
      className={cx(
        'inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm font-extrabold',
        added ? 'bg-card text-accent-text ring-2 ring-accent-line' : 'bg-button text-accent-ink',
      )}
    >
      {added ? labels[1] : labels[0]}
    </button>
  )
}

'use client'

import { useId } from 'react'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { TechnologiesView } from '@/lib/software/howWeBuild'

import { SectionHead } from './SectionHead'
import { TabPanels } from './TabPanels'
import { useAutoTabs } from './useAutoTabs'

/** Board `Main`: the layers change every 6,5 s until the visitor picks one (spec. §8.3). */
export const LAYERS_AUTO_MS = 6500

function LayerIcon({ path, size }: { path: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

/**
 * „Z czego budujemy” (`#technologie`, spec. §4 pkt 10, board `Main`, stany 60): the 6 layers as
 * ARIA tabs (automatic activation, arrows, Home, End) and the card of the chosen one — what it
 * is, what you gain and why, figures with the Google thresholds and their source. Switches itself
 * like the other start page tabs (`useAutoTabs`). Phone: the tabs are tiles in a 2×3 grid.
 */
export function Technologies({ view }: { view: TechnologiesView }) {
  const id = useId()
  const { active, picked, paused, pick, onKeyDown, tabRef, region } = useAutoTabs(
    view.layers.length,
    LAYERS_AUTO_MS,
  )

  return (
    <section id="technologie" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-col gap-6 min-[1081px]:gap-8">
        <SectionHead eyebrow={view.eyebrow} title={view.title} lead={view.lead} aside />
        <div className="flex flex-col gap-4 min-[1081px]:gap-6" {...region}>
          <div
            role="tablist"
            aria-label={view.tabsLabel}
            onKeyDown={onKeyDown}
            className="grid grid-cols-2 gap-2 min-[641px]:grid-cols-3 min-[1081px]:grid-cols-6 min-[1081px]:gap-2.5"
          >
            {view.layers.map((layer, i) => {
              const selected = i === active
              return (
                <button
                  key={layer.name}
                  ref={tabRef(i)}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${i}`}
                  aria-selected={selected}
                  aria-controls={`${id}-panel-${i}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => pick(i)}
                  className={cx(
                    'relative flex min-h-14 items-center gap-2.5 overflow-hidden rounded-[18px] border p-2.5 text-left transition-colors',
                    selected
                      ? 'border-transparent bg-cta text-white shadow-raised'
                      : 'border-border bg-card hover:border-accent-line',
                  )}
                >
                  <span
                    className={cx(
                      'grid size-11 shrink-0 place-items-center rounded-xl',
                      selected ? 'bg-white/20' : 'bg-accent-soft text-accent-text',
                    )}
                  >
                    <LayerIcon path={layer.icon} size={22} />
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <b className="font-display text-base font-extrabold min-[1081px]:text-lg">
                      {layer.name}
                    </b>
                    <small
                      className={cx(
                        'truncate text-xs font-extrabold',
                        selected ? 'text-white/90' : 'text-accent-text',
                      )}
                    >
                      {layer.tools.join(' · ')}
                    </small>
                  </span>
                  {selected && !picked && !paused ? (
                    <i
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 hidden h-[3px] w-full origin-left bg-white/75 motion-safe:animate-layer-progress min-[1081px]:block"
                    />
                  ) : null}
                </button>
              )
            })}
          </div>
          <TabPanels
            id={id}
            active={active}
            panels={view.layers.map((layer) => (
              <div
                key={layer.name}
                className="grid h-full gap-4 rounded-[28px] border border-accent-line bg-card p-4 shadow-raised min-[641px]:p-6 min-[1081px]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1fr)] min-[1081px]:items-start min-[1081px]:gap-6 min-[1081px]:p-7"
              >
                <div className="flex flex-col gap-2">
                  <span className="grid size-14 place-items-center rounded-[18px] bg-cta text-white shadow-raised">
                    <LayerIcon path={layer.icon} size={28} />
                  </span>
                  <h3 className="mt-2 font-display text-[26px] font-extrabold leading-tight">
                    {layer.name}
                  </h3>
                  <p className="text-ink-2">{layer.subtitle}</p>
                  <p className="flex flex-wrap gap-1.5">
                    {layer.tools.map((tool) => (
                      <span
                        key={tool}
                        className="rounded-lg border border-accent-line bg-accent-soft px-2.5 py-1 text-[13px] font-extrabold text-accent-text"
                      >
                        {tool}
                      </span>
                    ))}
                  </p>
                </div>
                <div className="flex flex-col gap-2.5 rounded-[18px] border-2 border-ok/40 bg-ok/10 p-4 min-[641px]:p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-ok-text">
                    {view.gainLabel}
                  </p>
                  <p className="font-display text-xl font-extrabold leading-snug min-[641px]:text-[22px]">
                    {layer.gain}
                  </p>
                  {layer.why ? (
                    <p className="text-sm text-ink-2">
                      <b className="text-ink">{view.whyLabel}</b> {layer.why}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  {layer.figures.map((figure) => (
                    <p
                      key={figure.label}
                      className="flex items-baseline gap-3 rounded-[14px] border border-border bg-card px-3.5 py-2"
                    >
                      <b className="shrink-0 font-display text-xl font-extrabold text-accent-text">
                        {figure.value}
                      </b>
                      <span className="text-[13px] text-ink-2">{figure.label}</span>
                    </p>
                  ))}
                  {layer.proof ? <small className="text-xs text-ink-2">{layer.proof}</small> : null}
                </div>
              </div>
            ))}
          />
        </div>
      </Container>
    </section>
  )
}

'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import type { HubHome } from '@/lib/prokom/home'

import { lineStyle } from '../lineColors'
import { stepIndex } from './autoplay'
import { Mark } from './Mark'
import type { HomeLine } from './model'
import { useAutoplay } from './useAutoplay'

/** Slides change every 4.2 s (spec §6.1 pkt 1). */
const SLIDE_MS = 4200
/** Biznes, Instalacje and Software are the big tiles with vignettes (board grid). */
const BIG_TILES = 3

type Props = {
  /** The PRO-KOM tile (server-rendered), first in the grid. */
  children: ReactNode
  lines: HomeLine[]
  /** Labels of the Tech repair stages for its small strip. */
  techStages: string[]
}

/**
 * The hero grid (board 01): the PRO-KOM tile and the five line tiles with three slides each. One
 * clock moves all tiles, each shifted by its place, so they never change at the same moment; the
 * segment buttons move one tile by hand. Paused while a tile is hovered or focused, when the tab
 * is hidden or the hero is off screen, and off with reduced motion (`useAutoplay`).
 */
export function HeroTiles({ children, lines, techStages }: Props) {
  const grid = useRef<HTMLDivElement>(null)
  const [tick, setTick] = useState(0)
  const [offsets, setOffsets] = useState<Partial<Record<string, number>>>({})
  const next = useCallback(() => setTick((value) => value + 1), [])
  const { handlers, running } = useAutoplay(grid, { interval: SLIDE_MS, onStep: next })

  return (
    <div ref={grid} className="pk-hb" data-running={running ? '' : undefined}>
      {children}
      {lines.map((line, index) => {
        const slides = line.hero.slides
        const current = stepIndex(tick + (offsets[line.key] ?? 0), slides.length, index)
        const big = index < BIG_TILES
        const move = (step: number) =>
          setOffsets((prev) => ({ ...prev, [line.key]: (prev[line.key] ?? 0) + step }))
        return (
          <article
            key={line.key}
            className={cx('pk-ht', `pk-ht--${line.key}`, big && 'pk-ht--big')}
            style={{ ...lineStyle(line.key), animationDelay: `${0.12 + index * 0.08}s` }}
            aria-label={`Linia ${line.name}`}
            {...handlers}
          >
            <div className="pk-ht__top">
              <Mark label={line.label} />
              {line.url && (
                <a
                  href={line.url}
                  className="pk-ht__go"
                  aria-label={line.domain ? `Przejdź na ${line.domain}` : `Przejdź: ${line.name}`}
                >
                  <span className="pk-ht__go-text">{big ? line.domain : 'Wejdź'}</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              )}
            </div>

            {big && line.hero.vignettes.length > 0 && (
              <div aria-hidden="true" className="pk-vg">
                {line.hero.vignettes.map((vignette, i) => (
                  <div
                    key={i}
                    className="pk-vl"
                    data-on={i === current % line.hero.vignettes.length ? '' : undefined}
                  >
                    <Vignette vignette={vignette} />
                  </div>
                ))}
              </div>
            )}
            {line.key === 'tech' && techStages.length > 0 && (
              <div aria-hidden="true" className="pk-ht__stages">
                <span className="pk-ht__bars">
                  {techStages.map((stage, i) => (
                    <i
                      key={stage}
                      className="pk-stp"
                      data-state={i < 2 ? 'done' : i === 2 ? 'now' : undefined}
                    />
                  ))}
                </span>
                <span className="pk-ht__stage-names">
                  {techStages.map((stage, i) => (
                    <span key={stage} data-now={i === 2 ? '' : undefined}>
                      {stage}
                    </span>
                  ))}
                </span>
              </div>
            )}
            {line.key === 'gaming' && <Bars count={12} className="pk-ht__eq" />}

            <div className="pk-ht__slides">
              {slides.map((slide, i) => {
                const on = i === current
                return (
                  <a
                    key={slide.title}
                    href={line.url ?? '#linie'}
                    className="pk-hsl"
                    data-on={on ? '' : undefined}
                    data-after={i === stepIndex(current, slides.length) ? '' : undefined}
                    aria-hidden={on ? undefined : true}
                    tabIndex={on ? undefined : -1}
                  >
                    <span className="pk-hsl__title">{slide.title}</span>
                    {big && slide.text && <span className="pk-hsl__text">{slide.text}</span>}
                  </a>
                )
              })}
            </div>

            {big && (
              <div className="pk-ht__segs">
                {slides.map((slide, i) => (
                  <button
                    key={slide.title}
                    type="button"
                    className="pk-ht__seg"
                    aria-label={`Slajd ${i + 1}: ${slide.title}`}
                    aria-current={i === current ? 'true' : undefined}
                    onClick={() => move(i - current)}
                  >
                    <span>
                      <i
                        data-fill={i <= current ? (i === current ? 'now' : 'done') : undefined}
                        key={`${tick}-${i}`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

function Bars({ count, className }: { count: number; className?: string }) {
  return (
    <span aria-hidden="true" className={cx('pk-bars', className)}>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ height: `${45 + ((i * 37) % 55)}%`, animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  )
}

type VignetteData = HubHome['hero']['lines']['biznes']['vignettes'][number]

/** The small moving pictures of the big tiles; their words are illustration only (hidden). */
function Vignette({ vignette }: { vignette: VignetteData }) {
  switch (vignette.kind) {
    case 'rows':
      return (
        <div className="pk-vg__rows">
          {vignette.rows.map((row) => (
            <span key={row.label} className="pk-vr">
              <span>{row.label}</span>
              <span className="pk-vp">
                <i className="pk-rec" />
                {row.state}
              </span>
            </span>
          ))}
        </div>
      )
    case 'tiles':
      return (
        <div className="pk-vg__tiles">
          {vignette.tiles.map((tile) => (
            <span key={tile.label} className="pk-tl2" data-kind={tile.icon}>
              {tile.icon === 'cam' && (
                <b>
                  <i className="pk-rec" />
                  REC
                </b>
              )}
              {tile.icon === 'bars' && <Bars count={4} className="pk-tl2__wifi" />}
              {tile.icon === 'ring' && (
                <span className="pk-rg">
                  <i />
                </span>
              )}
              <em>{tile.label}</em>
            </span>
          ))}
        </div>
      )
    case 'switch':
      return (
        <div className="pk-vg__rows">
          <span className="pk-vr">
            <span>Światło w salonie</span>
            <i className="pk-sw" />
          </span>
          <span className="pk-vr">
            <span>Rolety</span>
            <i className="pk-sw" style={{ animationDelay: '1.2s' }} />
          </span>
          <span className="pk-vr">
            <span>Nagłośnienie sali</span>
            <Bars count={6} className="pk-vr__eq" />
          </span>
        </div>
      )
    case 'web':
      return (
        <div className="pk-vg__web">
          <span className="pk-vg__chrome">
            <i />
            <i />
            <i />
            <span />
          </span>
          <span className="pk-vg__page">
            <span className="pk-vg__copy">
              <i className="pk-sk pk-sk--title" />
              <i className="pk-sk" />
              <i className="pk-sk pk-sk--short" />
              <i className="pk-vg__btn" />
            </span>
            <Bars count={4} className="pk-vg__chart" />
          </span>
        </div>
      )
    case 'kanban':
      return (
        <div className="pk-vg__kanban">
          {['Nowe', 'W toku', 'Gotowe'].map((column, i) => (
            <span key={column} className="pk-kc">
              <em>{column}</em>
              <i className="pk-kd" data-on={i === 1 ? '' : undefined} />
              {i < 2 && <i className="pk-kd" />}
            </span>
          ))}
        </div>
      )
    case 'flow':
      return (
        <div className="pk-vg__flow">
          <span className="pk-fn">Formularz</span>
          <i className="pk-fl" />
          <span className="pk-fn" data-on="">
            Twój system
          </span>
          <i className="pk-fl" style={{ animationDelay: '0.9s' }} />
          <span className="pk-fn">SMS i e-mail</span>
        </div>
      )
  }
}

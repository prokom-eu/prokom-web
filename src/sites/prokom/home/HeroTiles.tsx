'use client'

import { useCallback, useRef, useState, type PointerEvent, type ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/lib/shared/icons'
import type { HubHome } from '@/lib/prokom/home'

import { lineStyle } from '../lineColors'
import { stepIndex } from './autoplay'
import { FpsGraph } from './LineMocks'
import { CamScene, Tick, WifiArcs } from './art'
import { FlowMock, WebMock } from './WebMock'
import { Mark } from './Mark'
import type { HomeLine } from './model'

/** What a hero tile needs — the scene texts and contacts stay on the server. */
export type HeroLine = Pick<HomeLine, 'key' | 'name' | 'label' | 'domain' | 'url' | 'hero'>
import { useAutoplay } from './useAutoplay'

/** Slides change every 4.2 s (spec §6.1 pkt 1). */
const SLIDE_MS = 4200
/**
 * The light under the cursor and the tilt of a tile (H10): the pointer's place in the tile as
 * `--mx`/`--my` (0–1), written once per frame. Mouse only — a touch has no hover; with reduced
 * motion the light still follows (no movement of the tile), the tilt is off in CSS.
 */
const frames = new WeakMap<HTMLElement, number>()

function trackPointer(event: PointerEvent<HTMLElement>) {
  if (event.pointerType !== 'mouse') return
  const tile = event.currentTarget
  const { clientX, clientY } = event
  cancelAnimationFrame(frames.get(tile) ?? 0)
  frames.set(
    tile,
    requestAnimationFrame(() => {
      const box = tile.getBoundingClientRect()
      tile.style.setProperty('--mx', ((clientX - box.left) / box.width).toFixed(3))
      tile.style.setProperty('--my', ((clientY - box.top) / box.height).toFixed(3))
    }),
  )
}

/** Biznes, Instalacje and Software are the big tiles with vignettes (board grid). */
const BIG_TILES = 3

type Props = {
  /** The PRO-KOM tile (server-rendered), first in the grid. */
  children: ReactNode
  lines: HeroLine[]
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
            onPointerMove={trackPointer}
          >
            <span aria-hidden="true" className="pk-ht__light" />
            <div className="pk-ht__top">
              <Mark label={line.label} />
              {line.url && (
                <a
                  href={line.url}
                  className="pk-ht__go"
                  aria-label={
                    big
                      ? `Przejdź na ${line.domain ?? line.name}`
                      : `Wejdź na ${line.domain ?? line.name}`
                  }
                >
                  <span className="pk-ht__go-text">{big ? line.domain : 'Wejdź'}</span>
                  <span aria-hidden="true" className="pk-ht__go-arrow">
                    ↗
                  </span>
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
              <TechVisual stages={techStages} slide={current} />
            )}
            {line.key === 'gaming' && <GamingVisual slide={current} />}

            <div className="pk-ht__slides">
              {slides.map((slide, i) => {
                const on = i === current
                return (
                  <SlideLink
                    key={slide.title}
                    href={line.url}
                    className="pk-hsl"
                    data-on={on ? '' : undefined}
                    data-after={i === stepIndex(current, slides.length) ? '' : undefined}
                    aria-hidden={on ? undefined : true}
                    tabIndex={on ? undefined : -1}
                  >
                    <span className="pk-hsl__title">{slide.title}</span>
                    {big && slide.text && <span className="pk-hsl__text">{slide.text}</span>}
                  </SlideLink>
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
                    aria-pressed={i === current}
                    onClick={() => move(i - current)}
                  >
                    <span>
                      <i
                        data-fill={
                          i < current ? 'done' : i === current && running ? 'now' : undefined
                        }
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

/** A slide links to the line's site; without an address it is plain text, never a dead link. */
function SlideLink({
  href,
  children,
  ...rest
}: {
  href: string | null
  children: ReactNode
  className: string
  'data-on'?: string
  'data-after'?: string
  'aria-hidden'?: true
  tabIndex?: number
}) {
  if (href) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    )
  }
  const { tabIndex: _tabIndex, ...plain } = rest
  return <span {...plain}>{children}</span>
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

/** Icons of the rows of a „panel” picture, by place (illustration only). */
const ROW_ICONS: IconName[] = ['bolt', 'pc', 'shield', 'check']

/** The pictures of the big tiles; their words are illustration only (hidden from readers). */
function Vignette({ vignette }: { vignette: VignetteData }) {
  switch (vignette.kind) {
    case 'rows':
      return (
        <div className="pk-app">
          <span className="pk-app__bar">
            <i className="pk-app__logo" />
            <span>Twoja firma</span>
            <em>
              <i /> online
            </em>
          </span>
          <span className="pk-app__rows">
            {vignette.rows.map((row, i) => (
              <span key={row.label} className="pk-vr pk-app__row">
                <b className="pk-app__ico">
                  <Icon name={ROW_ICONS[i % ROW_ICONS.length] ?? 'check'} />
                </b>
                <span className="pk-app__label">{row.label}</span>
                <span className="pk-vp">
                  <Tick />
                  {row.state}
                </span>
              </span>
            ))}
          </span>
          <span className="pk-app__sync">
            <i />
          </span>
        </div>
      )
    case 'tiles':
      return (
        <div className="pk-vg__tiles">
          {vignette.tiles.map((tile, i) => (
            <span key={tile.label} className="pk-tl2" data-kind={tile.icon}>
              {tile.icon === 'cam' && <CamScene scene={i % 2} />}
              {tile.icon === 'bars' && <WifiArcs strength={[98, 87, 92][i % 3] ?? 90} />}
              {tile.icon === 'ring' && (
                <span className="pk-alarm">
                  <span className="pk-alarm__rings">
                    <i />
                    <i />
                  </span>
                  <Icon name="shield" className="pk-alarm__ico" />
                  <small>Uzbrojony</small>
                </span>
              )}
              <em>{tile.label}</em>
            </span>
          ))}
        </div>
      )
    case 'switch':
      return (
        <div className="pk-app">
          <span className="pk-app__bar">
            <i className="pk-app__logo" />
            <span>Dom · salon</span>
            <em>21°</em>
          </span>
          <span className="pk-app__rows">
            <span className="pk-vr pk-app__row">
              <b className="pk-app__ico">
                <Icon name="spark" />
              </b>
              <span className="pk-app__label">Światło w salonie</span>
              <i className="pk-sw" />
            </span>
            <span className="pk-vr pk-app__row">
              <b className="pk-app__ico">
                <Icon name="home" />
              </b>
              <span className="pk-app__label">Rolety</span>
              <i className="pk-sw" style={{ animationDelay: '1.2s' }} />
            </span>
            <span className="pk-vr pk-app__row">
              <b className="pk-app__ico">
                <Icon name="bolt" />
              </b>
              <span className="pk-app__label">Nagłośnienie sali</span>
              <Bars count={6} className="pk-vr__eq" />
            </span>
          </span>
        </div>
      )
    case 'web':
      return <WebMock size="sm" />
    case 'kanban':
      return (
        <div className="pk-vg__kanban">
          {['Nowe', 'W toku', 'Gotowe'].map((column, i) => (
            <span key={column} className="pk-kc">
              <em>
                {column} <b>{[2, 1, 1][i]}</b>
              </em>
              <span className="pk-kd" data-tag="a">
                <i />
                <u />
              </span>
              {i === 0 && (
                <span className="pk-kd" data-tag="b">
                  <i />
                  <u />
                </span>
              )}
              {i === 1 && <span className="pk-kd pk-kd--moving" data-on="" />}
            </span>
          ))}
        </div>
      )
    case 'flow':
      return <FlowMock />
  }
}

/** Tech: the device of the slide beside the repair stages. */
function TechVisual({ stages, slide }: { stages: string[]; slide: number }) {
  // By the slide order of the package (telefony, laptopy i konsole, bezpłatna diagnoza).
  const devices: IconName[] = ['phone', 'pc', 'check']
  return (
    <div aria-hidden="true" className="pk-ht__stages pk-tech">
      <span className="pk-tech__dev" key={slide}>
        <Icon name={devices[slide % devices.length] ?? 'wrench'} />
      </span>
      <span className="pk-tech__track">
        <span className="pk-nodes">
          {stages.map((stage, i) => (
            <i key={stage} data-state={i < 2 ? 'done' : i === 2 ? 'now' : undefined} />
          ))}
        </span>
        <span className="pk-ht__stage-names">
          {stages.map((stage, i) => (
            <span key={stage} data-now={i === 2 ? '' : undefined}>
              {stage}
            </span>
          ))}
        </span>
      </span>
    </div>
  )
}

/** Gaming: the frame graph with a readout that follows the slide. */
function GamingVisual({ slide }: { slide: number }) {
  // By the slide order of the package (Komputery, Konfigurator, Dobór pod grę) — no figures.
  const readouts = ['RGB · chłodzenie', 'CPU · GPU · RAM', 'Test w grze']
  return (
    <div aria-hidden="true" className="pk-game2">
      <FpsGraph size="sm" />
      <span className="pk-game2__read" key={slide}>
        {readouts[slide % readouts.length]}
      </span>
    </div>
  )
}

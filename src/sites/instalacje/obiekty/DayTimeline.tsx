'use client'

import Link from 'next/link'
import { type CSSProperties, useRef, useState } from 'react'

import { objectPage } from '../dane/obiekty'
import { InstIcon } from '../InstIcon'
import { useInterval } from '../sekcje/useInterval'
import { autoplayDay, DAY_MS, dayClass, dayProgress, pickFromDay } from './objectModel'
import { setScene } from './sceneStore'
import type { DayMoment } from './types'

type Props = { moments: readonly DayMoment[]; hotspotColors: readonly string[] }

const hueOf = (color: string | undefined) =>
  color ? ({ '--c': color } as CSSProperties) : undefined

/**
 * Day / year of the object (`#rok`, `build_seg.py` `day`): moments on the left, the current one
 * in a card with its services and the hotspots on the cross-section. Walks every 4.6 s until the
 * first touch (paused off screen, in a hidden tab and with reduced motion). „Na przekroju” shows
 * that hotspot in the hero and scrolls back to it.
 */
export function DayTimeline({ moments, hotspotColors }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [dy, setDy] = useState(0)
  const [touched, setTouched] = useState(false)
  useInterval(() => setDy((d) => autoplayDay(d, moments.length)), DAY_MS, {
    enabled: !touched && moments.length > 1,
    target: ref,
  })
  const cur = moments[dy] ?? moments[0]
  if (!cur) return null

  const showOnScene = (hs: number) => {
    setScene(() => pickFromDay(hs))
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document
      .querySelector('.sgsc')
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' })
  }

  return (
    <div ref={ref} className="sgday ri">
      <div className="sgdl">
        {moments.map((m, i) => (
          <button
            key={`${m.time}-${m.name}`}
            type="button"
            className={dayClass(i, dy)}
            aria-pressed={i === dy}
            onClick={() => {
              setTouched(true)
              setDy(i)
            }}
          >
            <em>{m.time}</em>
            <b>{m.name}</b>
            <i className="sgdbar" />
          </button>
        ))}
      </div>
      <div className="card sgdc" key={dy} style={hueOf(cur.chips[0]?.color)}>
        <div className="sgdv">
          <span className="sgdic">
            <InstIcon name={cur.icon} size={34} strokeWidth={1.8} />
          </span>
          <span className="sgdtm">{cur.time}</span>
        </div>
        <b className="h3" style={{ fontSize: 28 }}>
          {cur.name}
        </b>
        {cur.description && (
          <p className="lead" style={{ fontSize: 17 }}>
            {cur.description}
          </p>
        )}
        <div className="sgdch">
          {cur.chips.map((c) =>
            c.href ? (
              <Link key={c.key} href={c.href} className="sgchip" style={hueOf(c.color)}>
                <i />
                {c.name}
              </Link>
            ) : (
              <span key={c.key} className="sgchip" style={hueOf(c.color)}>
                <i />
                {c.name}
              </span>
            ),
          )}
        </div>
        {cur.hotspots.length > 0 && (
          <div className="sgdhs">
            <span>{objectPage.day.onScene}</span>
            {cur.hotspots.map((hs) => (
              <button
                key={hs}
                type="button"
                className="sgdh"
                style={hueOf(hotspotColors[hs])}
                aria-label={`${objectPage.day.showPoint} ${hs + 1} na przekroju`}
                onClick={() => showOnScene(hs)}
              >
                {hs + 1}
              </button>
            ))}
          </div>
        )}
        <div className="sgprog">
          <i style={{ width: `${dayProgress(dy, moments.length)}%` }} />
        </div>
      </div>
    </div>
  )
}

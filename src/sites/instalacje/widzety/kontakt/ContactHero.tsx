'use client'

import { type ReactNode, useState } from 'react'

import { kontakt as K } from '../../dane/kontakt'
import { InstIcon } from '../../InstIcon'
import { mapView } from './kontaktModel'

// The map's frame (`mapa.ts` holds its layers; not imported here, so they stay off the client).
const VIEWBOX = '0 0 640 560'

type Props = {
  /** Eyebrow, h1 and lead — rendered on the server from the panel. */
  intro: ReactNode
  /** Contact cards and the hours card — rendered on the server. */
  details: ReactNode
  /** The fixed layers of the map under and over the towns (`mapa.ts`), rendered on the server. */
  mapBase: ReactNode
  mapTop: ReactNode
}

/**
 * The contact hero (`Kontakt.body.html`): text, cards and hours on the left, the map of the
 * travel zones on the right. Typing a town (or clicking it on the map) lights its zone, draws
 * the route from the nearest salon and says what it means. On a phone the map hides and the
 * town field with its result sits under the lead (`.xa-kmob`). The map is a picture for the
 * eye; the field and the result line carry the same for the keyboard and screen readers.
 */
export function ContactHero({ intro, details, mapBase, mapTop }: Props) {
  const [query, setQuery] = useState('')
  const view = mapView(query)

  const field = (id: string) => (
    <label className="fl" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <InstIcon name="pin" />
      <input
        id={id}
        className="zin"
        type="text"
        placeholder={K.map.townPlaceholder}
        value={query}
        maxLength={60}
        autoComplete="address-level2"
        aria-label={K.map.town}
        aria-describedby={`${id}-res`}
        style={{ minHeight: 44 }}
        onChange={(e) => setQuery(e.target.value)}
      />
    </label>
  )
  // Both results are live regions: one of them is always hidden (phone or computer), and a
  // hidden region says nothing, so the zone is read out once.
  const result = (id: string) => (
    <div className="kres" id={id} aria-live="polite">
      <span className="ico s">
        <InstIcon name="pin" />
      </span>
      <div>
        <b>{view.title}</b>
        <span>{view.text}</span>
      </div>
    </div>
  )

  return (
    <div className="phw" style={{ alignItems: 'start' }}>
      <div className="pht2">
        {intro}
        <div className="xa-kmob in d3">
          {field('kt-q-m')}
          {result('kt-q-m-res')}
        </div>
        {details}
      </div>
      <div className="phv in d3">
        <div className="ill">
          <div className="illbar">
            <div style={{ flex: 1 }}>{field('kt-q')}</div>
          </div>
          <svg
            className="kmap2"
            viewBox={VIEWBOX}
            role="img"
            aria-label={K.map.label}
            data-zone={view.zone || undefined}
          >
            {mapBase}
            {view.route && (
              <>
                <path d={view.route} className="kroute0" />
                <path d={view.route} className="kroute" />
              </>
            )}
            {view.towns.map((t) => (
              // Mouse and touch shortcut; the town field above does the same for everyone.
              <g key={t.name} className={t.cls} onClick={() => setQuery(t.name)}>
                <circle cx={t.x} cy={t.y} r={14} className="khit" />
                <circle cx={t.x} cy={t.y} r={t.r} className="kt2" />
                <foreignObject x={t.tx} y={t.ty} width={300} height={26} className={`fo ${t.side}`}>
                  <div className="ktl3">{t.name}</div>
                </foreignObject>
              </g>
            ))}
            {view.pins.map((transform) => (
              <g key={transform} className="kshop" transform={transform}>
                <circle r={20} className="kpul" />
                <path
                  d="M0 0 C-4 -8 -12 -12 -12 -21 A12 12 0 1 1 12 -21 C12 -12 4 -8 0 0Z"
                  className="kpin"
                  filter="url(#kSh)"
                />
                <path d="M-6 -24 h12 l-1.5 -4 h-9z M-5 -24 v6 h10 v-6" className="kpini" />
              </g>
            ))}
            {mapTop}
          </svg>
          {result('kt-q-res')}
        </div>
      </div>
    </div>
  )
}

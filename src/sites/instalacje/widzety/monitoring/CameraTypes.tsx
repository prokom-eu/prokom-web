'use client'

import { type CSSProperties, useState } from 'react'

import { monitoring } from '../../dane/monitoring'
import { InstIcon } from '../../InstIcon'

const T = monitoring.types
const DASH_ACCENT: CSSProperties = {
  fill: 'none',
  stroke: 'var(--accent-text)',
  strokeWidth: 3,
  strokeDasharray: '6 6',
}

/** Drawing of each camera type (`.dev`), 1:1 with the prototype. */
function Device({ index }: { index: number }) {
  return (
    <svg className="dev" viewBox="0 0 240 200" aria-hidden="true">
      {index === 0 && (
        <>
          <rect className="b2" x="40" y="40" width="160" height="22" rx="6" />
          <path className="b1" d="M50 62 H190 A70 70 0 0 1 50 62 Z" />
          <circle className="lens" cx="120" cy="96" r="20" />
          <circle className="ir" cx="92" cy="80" r="4" />
          <circle className="ir" cx="148" cy="80" r="4" />
        </>
      )}
      {index === 1 && (
        <>
          <rect className="b2" x="20" y="40" width="40" height="70" rx="6" />
          <path className="b2" d="M60 72 L96 80 V92 L60 96 Z" />
          <rect className="b1" x="92" y="58" width="128" height="52" rx="12" />
          <rect className="b2" x="206" y="52" width="24" height="64" rx="8" />
          <circle className="lens" cx="210" cy="84" r="16" />
          <circle className="ir" cx="196" cy="66" r="3" />
          <circle className="ir" cx="196" cy="102" r="3" />
        </>
      )}
      {index === 2 && (
        <>
          <rect className="b2" x="104" y="10" width="32" height="40" rx="6" />
          <rect className="b2" x="70" y="50" width="100" height="24" rx="8" />
          <circle className="b1" cx="120" cy="120" r="56" />
          <rect className="b2" x="78" y="104" width="84" height="34" rx="17" />
          <circle className="lens" cx="120" cy="121" r="13" />
          <path d="M40 170 A90 30 0 0 0 200 170" style={DASH_ACCENT} />
        </>
      )}
      {index === 3 && (
        <>
          <rect className="b2" x="20" y="40" width="40" height="70" rx="6" />
          <path className="b2" d="M60 72 L96 80 V92 L60 96 Z" />
          <rect className="b1" x="92" y="58" width="128" height="52" rx="12" />
          <circle className="lens" cx="200" cy="84" r="14" />
          <rect x="110" y="64" width="40" height="14" rx="4" style={{ fill: 'var(--il-false)' }} />
          <rect x="110" y="82" width="40" height="14" rx="4" style={{ fill: 'var(--il-strobe)' }} />
          <path
            d="M150 140 a20 20 0 0 1 0 30 M162 132 a32 32 0 0 1 0 46"
            style={{ fill: 'none', stroke: 'var(--warn)', strokeWidth: 3 }}
          />
          <rect x="118" y="138" width="22" height="34" rx="4" style={{ fill: 'var(--warn)' }} />
        </>
      )}
      {index === 4 && (
        <>
          <rect className="b2" x="40" y="40" width="160" height="22" rx="6" />
          <path className="b1" d="M44 62 H196 A76 50 0 0 1 44 62 Z" />
          <circle className="lens" cx="82" cy="84" r="12" />
          <circle className="lens" cx="120" cy="92" r="12" />
          <circle className="lens" cx="158" cy="84" r="12" />
          <path d="M30 160 L120 120 L210 160" style={DASH_ACCENT} />
        </>
      )}
    </svg>
  )
}

/** „Pięć rodzajów kamer” (`#typy`): tabs on the left, the type's card on the right. */
export function CameraTypes() {
  const [index, setIndex] = useState(0)
  const type = T.items[index] ?? T.items[0]!
  return (
    <div className="typw ri">
      <div className="typl" role="tablist" aria-label={T.tabsLabel}>
        {T.items.map((t, i) => (
          <button
            key={t.name}
            type="button"
            role="tab"
            className={index === i ? 'typb on' : 'typb'}
            aria-selected={index === i}
            onClick={() => setIndex(i)}
          >
            <span className="ico s">
              <InstIcon name="cam" />
            </span>
            {t.name}
          </button>
        ))}
      </div>
      <div className="card typc" key={index}>
        <Device index={index} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <b className="h3" style={{ fontSize: 26 }}>
            {type.name}
          </b>
          <p className="mut" style={{ margin: 0, fontSize: 16 }}>
            {type.text}
          </p>
          <div className="g2" style={{ gap: 12 }}>
            <div className="note" style={{ flexDirection: 'column', gap: 6 }}>
              <b style={{ color: 'var(--ok)' }}>{T.fits}</b>
              <span>{type.fits}</span>
            </div>
            <div className="note" style={{ flexDirection: 'column', gap: 6 }}>
              <b style={{ color: 'var(--warn)' }}>{T.careful}</b>
              <span>{type.careful}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

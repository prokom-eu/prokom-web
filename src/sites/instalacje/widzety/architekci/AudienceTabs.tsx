'use client'

import { useId, useState } from 'react'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { chooseAudience } from './roleStore'
import { onTabKey } from './tabs'

/** „Dla kogo jest ta strona” (`#dla-ciebie`, `ar.aud`): 4 roles as tabs, the panel with points and a CTA. */
export function AudienceTabs() {
  const id = useId()
  const [i, setIndex] = useState(0)
  const setI = (k: number) => {
    setIndex(k)
    const key = A.audience[k]?.key
    if (key) chooseAudience(key)
  }
  const cur = A.audience[i] ?? A.audience[0]
  if (!cur) return null
  const n = A.audience.length

  return (
    <div className="araudw ri">
      <div className="araudl">
        <span className="eye">{A.audienceSection.eyebrow}</span>
        <b className="h3" style={{ fontSize: 'clamp(22px, 2vw, 28px)' }}>
          {A.audienceSection.heading}
        </b>
        <div className="araudtabs" role="tablist" aria-label={A.audienceSection.eyebrow}>
          {A.audience.map((a, k) => {
            const on = k === i
            return (
              <button
                key={a.key}
                type="button"
                role="tab"
                id={`${id}-t${k}`}
                aria-controls={`${id}-p`}
                className={on ? 'araud on' : 'araud'}
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setI(k)}
                onKeyDown={(e) => onTabKey(e, k, n, setI)}
              >
                <span className="ico s">
                  <InstIcon name={a.icon} size={18} />
                </span>
                {a.name}
                <InstIcon name="arrow" size={16} strokeWidth={2.4} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="card araudr" role="tabpanel" id={`${id}-p`} aria-labelledby={`${id}-t${i}`}>
        <b className="h2" style={{ fontSize: 'clamp(28px, 2.8vw, 42px)' }}>
          {cur.heading}
        </b>
        <p className="lead">{cur.text}</p>
        <div className="araudp">
          {cur.points.map((x) => (
            <div key={x}>
              <span className="arok">
                <InstIcon name="check" size={14} strokeWidth={3} />
              </span>
              <span>{x}</span>
            </div>
          ))}
        </div>
        <a href={cur.cta.href} className="btn btn-p" style={{ alignSelf: 'flex-start' }}>
          {cur.cta.label} →
        </a>
      </div>
    </div>
  )
}

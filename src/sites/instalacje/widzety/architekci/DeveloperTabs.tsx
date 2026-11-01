'use client'

import { useId, useState } from 'react'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { onTabKey } from './tabs'

const T = A.developersSection
const ACCENT = { color: 'var(--inst-dark-accent)' }

/**
 * „Dla deweloperów i inwestorów” (`#deweloperzy`, `ar.dv`): the dark block with 3 market
 * numbers, 5 areas as tabs (lokale, części wspólne, garaż, apartamenty, odbiór) with „Dlaczego
 * to ważne” and the sentence that we do not promise a higher flat price (spec §2.2).
 */
export function DeveloperTabs() {
  const id = useId()
  const [i, setI] = useState(0)
  const cur = A.developers[i] ?? A.developers[0]
  if (!cur) return null
  const n = A.developers.length

  return (
    <div className="ardvb ri" data-surface="dark">
      <div className="shead" style={{ marginBottom: 30 }}>
        <div>
          <span className="eye" style={ACCENT}>
            {T.eyebrow}
          </span>
          <h2 className="h2">
            {T.heading} <span style={ACCENT}>{T.accent}</span>
          </h2>
        </div>
        <p className="lead" style={{ maxWidth: 440 }}>
          {T.lead}
        </p>
      </div>
      <div className="ardvd">
        {A.developersData.map((d) => (
          <div key={d.value}>
            <b>{d.value}</b>
            <span>{d.label}</span>
          </div>
        ))}
      </div>
      <div className="ardvw">
        <div className="ardvtabs" role="tablist" aria-label={T.eyebrow}>
          {A.developers.map((d, k) => {
            const on = k === i
            return (
              <button
                key={d.key}
                type="button"
                role="tab"
                id={`${id}-t${k}`}
                aria-controls={`${id}-p`}
                className={on ? 'ardvt on' : 'ardvt'}
                aria-selected={on}
                tabIndex={on ? 0 : -1}
                onClick={() => setI(k)}
                onKeyDown={(e) => onTabKey(e, k, n, setI)}
              >
                <InstIcon name={d.icon} size={18} />
                {d.name}
              </button>
            )
          })}
        </div>
        <div className="ardvp" role="tabpanel" id={`${id}-p`} aria-labelledby={`${id}-t${i}`}>
          <div className="ardvph">
            <span className="ardvi">
              <InstIcon name={cur.icon} size={26} />
            </span>
            <b className="h3">{cur.heading}</b>
          </div>
          <div className="ardvl">
            {cur.items.map((x) => (
              <div key={x}>
                <span className="arok">
                  <InstIcon name="check" size={14} strokeWidth={3} />
                </span>
                <span>{x}</span>
              </div>
            ))}
          </div>
          <div className="ardvwhy">
            <em>{T.why}</em>
            <span>{cur.why}</span>
          </div>
        </div>
      </div>
      <div className="ardvf">
        <span>{T.noPromise}</span>
        <a href="#wyslij" className="btn hbtn-p">
          {T.cta}
        </a>
      </div>
    </div>
  )
}

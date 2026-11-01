'use client'

import { useId, useState } from 'react'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { onTabKey } from './tabs'

const T = A.stagesSection
const two = (i: number) => String(i + 1).padStart(2, '0')

/** Progress bar under the tabs (`ar.et.bar`): the middle of the chosen stage. */
export const stageBar = (i: number, n: number) => `${Math.round(((i + 0.5) / n) * 100)}%`

/**
 * „Współpraca etap po etapie” (`#etapy`, `ar.et`): 6 stages as tabs on a progress line, the panel
 * with previous/next and „Co robimy / Co dostajesz Ty / Co zyskuje inwestor”. Starts on stage 02
 * like the prototype (`st: 1`).
 */
export function StageTabs() {
  const id = useId()
  const [i, setI] = useState(1)
  const n = A.stages.length
  const cur = A.stages[i] ?? A.stages[0]
  if (!cur) return null

  return (
    <>
      <div className="artabs ri" role="tablist" aria-label={T.tabsLabel}>
        <div className="artrack">
          <i style={{ width: stageBar(i, n) }} />
        </div>
        {A.stages.map((s, k) => {
          const on = k === i
          return (
            <button
              key={s.title}
              type="button"
              role="tab"
              id={`${id}-t${k}`}
              aria-controls={`${id}-p`}
              className={
                'artab' + (on ? ' on' : '') + (s.best ? ' best' : '') + (k < i ? ' past' : '')
              }
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setI(k)}
              onKeyDown={(e) => onTabKey(e, k, n, setI)}
            >
              <em>{two(k)}</em>
              <b>{s.title}</b>
              <span>{s.caption}</span>
            </button>
          )
        })}
      </div>
      <div className="card aretp ri" role="tabpanel" id={`${id}-p`} aria-labelledby={`${id}-t${i}`}>
        <div className="aretph">
          <span className="arbig">{two(i)}</span>
          <div>
            <b className="h3">{cur.title}</b>
            {cur.best && (
              <span className="tag a" style={{ marginTop: 8 }}>
                <InstIcon name="star" size={13} strokeWidth={2.4} />
                {T.best}
              </span>
            )}
          </div>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="arnav"
              disabled={i === 0}
              onClick={() => setI(Math.max(0, i - 1))}
              aria-label={T.prev}
            >
              <InstIcon name="arrowL" size={18} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              className="arnav"
              disabled={i === n - 1}
              onClick={() => setI(Math.min(n - 1, i + 1))}
              aria-label={T.next}
            >
              <InstIcon name="arrow" size={18} strokeWidth={2.4} />
            </button>
          </span>
        </div>
        <div className="aretg">
          <div>
            <em>
              <InstIcon name="tool" size={16} />
              {T.weDo}
            </em>
            {cur.weDo.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
          <div>
            <em>
              <InstIcon name="ruler" size={16} />
              {T.youGet}
            </em>
            {cur.youGet.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
          <div>
            <em>
              <InstIcon name="home" size={16} />
              {T.investor}
            </em>
            {cur.investor.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

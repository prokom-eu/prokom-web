'use client'

import { type CSSProperties, type ReactNode, useState } from 'react'

import type { ArchNewsCard } from '@/lib/instalacje/data'
import type { ServiceKey } from '@/lib/instalacje/options'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { safeHue } from '../../sekcje/arch/archScene'
import {
  hotType,
  initialNews,
  newsCount,
  newsCurrent,
  newsList,
  newsPosition,
  pickFilter,
  stepNews,
} from './architektModel'

const T = A.newsSection

type Props = {
  cards: ArchNewsCard[]
  /** Service colours from the panel, by key. */
  hues: Partial<Record<ServiceKey, string>>
  /** The „Nowe rozwiązania raz w miesiącu” form (I16c); until then its text only. */
  newsletterForm?: ReactNode
}

/** Colour of a card: its service; training and offers for studios (`sz`) in `--warn`. */
const hue = (hues: Props['hues'], category: ArchNewsCard['category']) =>
  ({
    '--hc': category === 'sz' ? 'var(--warn)' : safeHue(hues[category]),
  }) as CSSProperties

/** The card drawing: a stroke path of 200×120 (the panel accepts path commands only). */
function Art({ d }: { d: string | null }) {
  return (
    <svg viewBox="0 0 200 120" aria-hidden="true">
      {d && <path d={d} />}
    </svg>
  )
}

/**
 * „Nowe rozwiązania” (`#nowosci`, `ar.nw`): published `InstArchNews` cards — the filter with
 * counts, the list (a carousel on a phone) and the chosen card with its parameters, previous/next
 * within the filter and „x / n”. Starts on the featured card.
 */
export function SolutionsExplorer({ cards, hues, newsletterForm }: Props) {
  const [s, setS] = useState(() => initialNews(cards))
  const list = newsList(cards, s.filter)
  const cur = newsCurrent(cards, s)

  return (
    <>
      <div className="arnf ri" role="group" aria-label={A.newsFilters[0]?.name}>
        {/* A category without published cards has no button (the prototype never has 0). */}
        {A.newsFilters
          .filter((f) => f.key === 'all' || newsCount(cards, f.key) > 0)
          .map((f) => {
            const on = f.key === s.filter
            return (
              <button
                key={f.key}
                type="button"
                className={on ? 'chip on' : 'chip'}
                aria-pressed={on}
                onClick={() => setS(pickFilter(s, f.key))}
              >
                {f.name}
                <em>{newsCount(cards, f.key)}</em>
              </button>
            )
          })}
      </div>
      {cur && (
        <div className="arnx ri">
          <div className="arnxl" role="group" aria-label={T.listLabel}>
            {list.map((n) => {
              const on = n.id === cur.id
              return (
                <button
                  key={n.id}
                  type="button"
                  className={on ? 'arnwi on' : 'arnwi'}
                  style={hue(hues, n.category)}
                  aria-pressed={on}
                  onClick={() => setS({ ...s, selected: n.id })}
                >
                  <span className="arnwth">
                    <Art d={n.illustration} />
                  </span>
                  <span className="arnwtx">
                    <span className="arnwm">
                      <em>{A.newsCategories[n.category]}</em>
                      <span className={hotType(n.type) ? 'arty hot' : 'arty'}>{n.type}</span>
                    </span>
                    <b>{n.title}</b>
                    <span className="arnwk">{n.params[0]?.value}</span>
                  </span>
                </button>
              )
            })}
          </div>
          <article className="arnxd" style={hue(hues, cur.category)} key={cur.id}>
            <div className="arnxa">
              <Art d={cur.illustration} />
              <span className={hotType(cur.type) ? 'arty hot' : 'arty'}>{cur.type}</span>
              <span className="arnxpos">{newsPosition(cards, s)}</span>
            </div>
            <div className="arnxb">
              <span className="eye">{A.newsCategories[cur.category]}</span>
              <h3 className="h3 arnxt">{cur.title}</h3>
              <p className="arnxdsc">{cur.description}</p>
              <div className="arnxsp">
                {cur.params.map((p) => (
                  <div key={p.label}>
                    <span>{p.label}</span>
                    <b>{p.value}</b>
                  </div>
                ))}
              </div>
              <div className="arnxpl">
                <em>
                  <InstIcon name="ruler" size={15} />
                  {T.plan}
                </em>
                {cur.plan.map((x) => (
                  <p key={x}>
                    <span className="arok">
                      <InstIcon name="check" size={12} strokeWidth={3} />
                    </span>
                    {x}
                  </p>
                ))}
              </div>
              <div className="arnxm">
                {cur.examples && (
                  <div>
                    <em>{T.examples}</em>
                    <span>{cur.examples}</span>
                  </div>
                )}
                <div>
                  <em>{T.places}</em>
                  <span className="arnxdl">
                    {cur.places.map((p) => (
                      <span key={p} className="tag">
                        {p}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
              <div className="arnxf">
                <a href="#wyslij" className="btn btn-p btn-s">
                  {T.ask}
                </a>
                <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="arnav"
                    onClick={() => setS(stepNews(cards, s, -1))}
                    aria-label={T.prev}
                  >
                    <InstIcon name="arrowL" size={16} strokeWidth={2.4} />
                  </button>
                  <button
                    type="button"
                    className="arnav"
                    onClick={() => setS(stepNews(cards, s, 1))}
                    aria-label={T.next}
                  >
                    <InstIcon name="arrow" size={16} strokeWidth={2.4} />
                  </button>
                </span>
              </div>
            </div>
          </article>
        </div>
      )}
      <div className="arnl ri">
        <div>
          <b className="h3" style={{ fontSize: 22 }}>
            {T.newsletterTitle}
          </b>
          <span className="mut">{T.newsletterText}</span>
        </div>
        {newsletterForm}
      </div>
    </>
  )
}

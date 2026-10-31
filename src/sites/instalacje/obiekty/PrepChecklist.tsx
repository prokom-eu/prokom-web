'use client'

import Link from 'next/link'
import { type CSSProperties, useState } from 'react'

import { objectPage } from '../dane/obiekty'
import { InstIcon } from '../InstIcon'
import { checklist } from './objectModel'

type Props = {
  eyebrow: string
  lead: string
  items: readonly string[]
  planHref: string
}

const T = objectPage.prepare

/**
 * „Przygotuj to, a wycena będzie szybsza.” (`#przygotuj`, `build_seg.py` `ck`): what the visitor
 * already has, ticked on the right, counted in the ring; all ticked changes the button text.
 * Nothing is sent or stored — it only helps to prepare the request.
 */
export function PrepChecklist({ eyebrow, lead, items, planHref }: Props) {
  const [checked, setChecked] = useState<boolean[]>([])
  const c = checklist(checked, items.length)
  return (
    <div className="card sgck ri">
      <div className="sgckh">
        <span className="eye">{eyebrow}</span>
        <h2 className="h2" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
          {T.heading}
        </h2>
        <p className="lead" style={{ fontSize: 17 }}>
          {lead}
        </p>
        <div className="sgring" style={{ '--p': c.ratio } as CSSProperties}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="sgr0" />
            <circle cx="60" cy="60" r="52" className="sgr1" />
          </svg>
          <span aria-live="polite">
            <b>{c.n}</b>
            {T.of} {items.length}
          </span>
        </div>
        <Link href={planHref} className="btn btn-p">
          {c.done ? T.ctaDone : T.cta}
        </Link>
      </div>
      <div className="sgckl">
        {items.map((item, i) => {
          const on = Boolean(checked[i])
          return (
            <button
              key={item}
              type="button"
              className={on ? 'sgci on' : 'sgci'}
              aria-pressed={on}
              onClick={() =>
                setChecked((list) => {
                  const next = [...list]
                  next[i] = !on
                  return next
                })
              }
            >
              <em>
                <InstIcon name="check" size={14} strokeWidth={3} />
              </em>
              <span>{item}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

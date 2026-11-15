'use client'

import Link from 'next/link'
import { type CSSProperties, useId, useState } from 'react'

import type { ServiceKey } from '@/lib/instalacje/options'

import { architekci as A } from '../../dane/architekci'
import { InstIcon } from '../../InstIcon'
import { safeHue } from '../../sekcje/arch/archScene'
import { onTabKey } from './tabs'
import { Arrow } from '../../Arrow'

export type ArchService = {
  key: ServiceKey
  name: string
  caption: string | null
  icon: string | null
  href: string | null
  color: string | null
}

const T = A.installationsSection
const hue = (color: string | null) => ({ '--hc': safeHue(color) }) as CSSProperties

/**
 * „Wszystkie instalacje w jednym miejscu” (`#instalacje`, `ar.ins`): the 10 services as tabs
 * (smart home and sound first and bigger), the panel with „W projekcie zaplanuj”, „We wnętrzu”,
 * brands and the link to the service page. Names, captions, icons, colours and addresses from the
 * panel; services without a published card are left out.
 */
export function InstallationsTabs({ services }: { services: ArchService[] }) {
  const id = useId()
  const list = A.installations.order.flatMap((key) => {
    const card = services.find((s) => s.key === key)
    return card ? [{ ...card, ...A.installations.details[key] }] : []
  })
  const [i, setI] = useState(0)
  const cur = list[i] ?? list[0]
  if (!cur) return null

  return (
    <div className="arin2 ri">
      <div className="arsvl" role="tablist" aria-label={T.tabsLabel}>
        {list.map((s, k) => {
          const on = k === i
          return (
            <button
              key={s.key}
              type="button"
              role="tab"
              id={`${id}-t${k}`}
              aria-controls={`${id}-p`}
              className={'arsv' + (on ? ' on' : '') + (s.big ? ' big' : '')}
              style={hue(s.color)}
              aria-selected={on}
              tabIndex={on ? 0 : -1}
              onClick={() => setI(k)}
              onKeyDown={(e) => onTabKey(e, k, list.length, setI)}
            >
              <span className="arsvi">
                <InstIcon name={s.icon} size={20} />
              </span>
              <span className="arsvt">
                <b>{s.name}</b>
                <span>{s.caption}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div
        className="card arsvd"
        style={hue(cur.color)}
        role="tabpanel"
        id={`${id}-p`}
        aria-labelledby={`${id}-t${i}`}
      >
        <div className="arsvdh">
          <span className="arsvi lg">
            <InstIcon name={cur.icon} size={26} />
          </span>
          <span className="eye">{cur.name}</span>
        </div>
        <b className="h3 arsvdt">{cur.heading}</b>
        <p className="arsvdd">{cur.text}</p>
        <div className="arsvdg">
          <div>
            <em>{T.plan}</em>
            {cur.plan.map((x) => (
              <p key={x}>
                <span className="arok">
                  <InstIcon name="check" size={12} strokeWidth={3} />
                </span>
                {x}
              </p>
            ))}
          </div>
          <div>
            <em>{T.look}</em>
            <div className="arlook">
              {cur.look.map((x) => (
                <span key={x} className="tag">
                  {x}
                </span>
              ))}
            </div>
            <em style={{ marginTop: 18 }}>{T.brands}</em>
            <p className="mut" style={{ fontSize: 14 }}>
              {cur.brands}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 'auto' }}>
          {cur.href && (
            <Link href={cur.href} className="btn btn-g btn-s">
              {T.fullPage} {cur.name} <Arrow />
            </Link>
          )}
          <a href="#wyslij" className="btn btn-p btn-s">
            {T.ask}
          </a>
        </div>
      </div>
    </div>
  )
}

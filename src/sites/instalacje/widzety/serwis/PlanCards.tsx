'use client'

import { type CSSProperties, useRef, useState } from 'react'

import { SlidingPill } from '@/components/motion/SlidingPill'

import { serwis as S } from '../../dane/serwis'
import { InstIcon } from '../../InstIcon'

/**
 * Care plans of `/serwis` (RUNDA-V5 §11): three cards, the middle one marked as the most chosen.
 * A switch above picks the level: its card rises and its list comes in with a short cascade
 * (transform / opacity, none with reduced motion). Every card keeps its full list in the HTML.
 */
export function PlanCards({ noPriceText }: { noPriceText: string }) {
  const plans = S.plans.items
  const [chosen, setChosen] = useState(
    Math.max(
      0,
      plans.findIndex((p) => p.hot),
    ),
  )
  const switcher = useRef<HTMLDivElement>(null)
  return (
    <>
      <div ref={switcher} className="planseg ri" role="group" aria-label={S.plans.switchLabel}>
        <SlidingPill container={switcher} active={chosen} className="inst-pill" radius={999} />
        {plans.map((plan, i) => (
          <button
            key={plan.name}
            type="button"
            className={i === chosen ? 'on' : undefined}
            aria-pressed={i === chosen}
            onClick={() => setChosen(i)}
          >
            {plan.name}
          </button>
        ))}
      </div>
      <div className="plans">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={'card plan ri' + (plan.hot ? ' hot' : '') + (i === chosen ? ' on' : '')}
          >
            {plan.hot && (
              <span className="tag a" style={{ alignSelf: 'flex-start' }}>
                {S.plans.hot}
              </span>
            )}
            <h3 className="h3">{plan.name}</h3>
            <span className="mut">{plan.text}</span>
            {/* Remounted when chosen: its items come in again. */}
            <ul key={i === chosen ? 'on' : 'off'}>
              {plan.features.map((feature, k) => (
                <li key={feature} style={{ '--k': k } as CSSProperties}>
                  <i aria-hidden="true">
                    <InstIcon name="check" size={16} strokeWidth={2.6} />
                  </i>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <span className="prc" style={{ fontSize: 22, marginTop: 'auto' }}>
              {noPriceText}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

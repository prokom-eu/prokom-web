'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { HubHome } from '@/lib/prokom/home'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from '../home/Mark'
import type { TeamExample } from '../home/model'

type Props = {
  texts: Pick<HubHome['team'], 'eyebrow' | 'title' | 'lead' | 'cta' | 'pillars'>
  examples: TeamExample[]
  /** Contacts of the lines on the page, for the cards. */
  lines: { key: string; label: string; url: string | null; phone: string | null }[]
  phone: string | null
  tel: string | null
  /** Anchor of the section (`/linie`: `razem`, `/dla-domu`: `u-ciebie`). */
  id?: string
  /** Where the second button leads (`/linie`: „Dobierz” on the home page). */
  ctaHref?: string
}

/**
 * „Tak pracują razem” of `/linie` (board 02 `#razem`): the same examples as on the home page
 * (`home.team`, plans from `HubPlans`) as toggle buttons, one plan at a time. Without JavaScript
 * the first example is shown.
 */
export function TeamPicker({
  texts,
  examples,
  lines,
  phone,
  tel,
  id = 'razem',
  ctaHref = '/#dobierz',
}: Props) {
  const [picked, setPicked] = useState(examples[0]?.persona ?? '')
  const example = examples.find((entry) => entry.persona === picked) ?? examples[0]
  if (!example) return null

  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-coop pk-oteam">
        <div className="pk-coop__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id={`${id}-h`} className="pk-h2">
            {texts.title}
          </h2>
          <p className="pk-lead">{texts.lead}</p>
          <div role="group" aria-labelledby={`${id}-h`} className="pk-oteam__tabs">
            {examples.map((entry) => (
              <button
                key={entry.persona}
                type="button"
                className="pk-ochip"
                aria-pressed={entry.persona === example.persona}
                onClick={() => setPicked(entry.persona)}
              >
                {entry.tab}
              </button>
            ))}
          </div>
          <div className="pk-coop__links">
            {phone && tel && (
              <a href={tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--phone">
                {phone}
              </a>
            )}
            <Link href={ctaHref} className="pk-hbtn">
              {texts.cta}
            </Link>
          </div>
        </div>
        <div className="pk-oteam__plan">
          <div className="pk-oteam__node">
            <span className="pk-csl__icon" aria-hidden="true">
              <Icon name="store" />
            </span>
            <span className="pk-oteam__node-text">
              <span>{example.node}</span>
              <span className="pk-oteam__title" aria-live="polite">
                {example.title}
              </span>
            </span>
          </div>
          <ul className="pk-oteam__cards" role="list">
            {example.cards.map((card) => {
              const line = lines.find((entry) => entry.key === card.line)
              const body = (
                <>
                  <Mark label={line?.label ?? null} />
                  <span className="pk-od__chips">
                    {card.points.map((point) => (
                      <span key={point} className="pk-ocp">
                        {point}
                      </span>
                    ))}
                  </span>
                  {line?.phone && <span className="pk-oteam__phone">{line.phone}</span>}
                </>
              )
              return (
                <li key={card.line} style={lineStyle(card.line)}>
                  {line?.url ? (
                    <a href={line.url} className="pk-lcard pk-oteam__card">
                      {body}
                    </a>
                  ) : (
                    <div className="pk-lcard pk-oteam__card">{body}</div>
                  )}
                </li>
              )
            })}
          </ul>
          <ul className="pk-oteam__pillars" role="list">
            {texts.pillars.map((pillar) => (
              <li key={pillar}>
                <i aria-hidden="true" />
                {pillar}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

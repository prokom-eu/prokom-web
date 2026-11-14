'use client'

import { useId, useState } from 'react'

import { HeadingText } from '@/components/shared/HeadingText'
import type { HubHome } from '@/lib/prokom/home'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import { type ChoosePlan, linesCount } from './model'

/** The persona of the wide „Inna branża? Też.” tile (last on the board, all lines). */
const OTHER = 'inne'
const STRIPES = ['biznes', 'instalacje', 'software', 'tech', 'gaming'] as const

type Props = {
  texts: Omit<HubHome['choose'], 'personas'>
  plans: ChoosePlan[]
  phone: string | null
  tel: string | null
  /** `/kontakt`, or `null` while the page is off. */
  writeHref: string | null
}

/**
 * „Dobierz · 10 sekund” (spec §6.1 pkt 3, board 01 `#dobierz`): personas from `HubPlans` as
 * toggle buttons; the plan card shows the chosen persona's lines (cards link to the line sites)
 * and one company phone. Without JavaScript the first persona's plan is shown.
 */
export function Choose({ texts, plans, phone, tel, writeHref }: Props) {
  const panelId = useId()
  const [picked, setPicked] = useState(plans[0]?.persona ?? '')
  const plan = plans.find((entry) => entry.persona === picked) ?? plans[0]
  if (!plan) return null
  const personas = plans.filter((entry) => entry.persona !== OTHER)
  const other = plans.find((entry) => entry.persona === OTHER)

  return (
    <section
      id="dobierz"
      data-rail-section
      aria-labelledby="dobierz-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="dobierz-h" className="pk-h2 pk-h2--big">
            <HeadingText text={texts.title} emClass="pk-nowrap" />
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div className="pk-choose">
        <div role="group" aria-labelledby="dobierz-h" className="pk-choose__list">
          {personas.map((entry, index) => (
            <button
              key={entry.persona}
              type="button"
              className="pk-pt"
              aria-pressed={entry.persona === plan.persona}
              aria-controls={panelId}
              onClick={() => setPicked(entry.persona)}
            >
              <span className="pk-pt__n" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="pk-pt__body">
                <span className="pk-pt__name">{entry.name}</span>
                {entry.sub && <span className="pk-pt__sub">{entry.sub}</span>}
              </span>
            </button>
          ))}
          {other && (
            <button
              type="button"
              className="pk-pt pk-pt--other"
              aria-pressed={other.persona === plan.persona}
              aria-controls={panelId}
              onClick={() => setPicked(other.persona)}
            >
              <span className="pk-pt__top" aria-hidden="true">
                <span className="pk-stripes">
                  {STRIPES.map((line) => (
                    <i key={line} style={lineStyle(line)} />
                  ))}
                </span>
              </span>
              <span className="pk-pt__foot">
                <span className="pk-pt__body">
                  <span className="pk-pt__name">{texts.other.title}</span>
                  <span className="pk-pt__sub">{texts.other.text}</span>
                </span>
                <span className="pk-go" aria-hidden="true">
                  →
                </span>
              </span>
            </button>
          )}
        </div>
        <div id={panelId} className="pk-plan">
          <div className="pk-plan__head">
            <div className="pk-plan__title" aria-live="polite">
              <span className="pk-eb pk-eb--muted">
                {texts.planFor} {plan.name}
              </span>
              <h3 className="pk-h3">{plan.title}</h3>
            </div>
            <span className="pk-plan__count">{linesCount(plan.groups.length)}</span>
          </div>
          <ul className="pk-plan__grid" role="list">
            {plan.groups.map((group) => (
              <li key={group.key} style={lineStyle(group.key)}>
                <PlanCard group={group} />
              </li>
            ))}
          </ul>
          <div className="pk-plan__foot">
            {phone && tel && (
              <a href={tel} className="pk-hbtn pk-hbtn--accent">
                {texts.call} {phone}
              </a>
            )}
            {writeHref && (
              <a href={writeHref} className="pk-hbtn">
                {texts.write}
              </a>
            )}
            <span className="pk-plan__note">{texts.note}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function PlanCard({ group }: { group: ChoosePlan['groups'][number] }) {
  const body = (
    <>
      <Mark label={group.label} />
      <ul className="pk-dots" role="list">
        {group.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {group.domain && (
        <span className="pk-chip-go">
          {group.domain} <span aria-hidden="true">↗</span>
        </span>
      )}
    </>
  )
  return group.url ? (
    <a href={group.url} className="pk-lcard">
      {body}
    </a>
  ) : (
    <div className="pk-lcard">{body}</div>
  )
}

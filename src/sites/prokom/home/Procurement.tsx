import type { CSSProperties } from 'react'

import { Icon } from '@/components/ui/Icon'
import { type HubHome, withVisibleFacts } from '@/lib/prokom/home'
import { isHubLinkLive, type HubPageFlags } from '@/lib/prokom/pages'

import { HUB_CONTAINER } from '../container'

type Props = {
  texts: NonNullable<HubHome['procurement']>
  /** Step titles of „Inwestycje i dostawy” (`HubSettings.deliveries.steps`) — no new promises. */
  steps: readonly string[]
  /** Company facts visible here (on production: approved only, spec §3). */
  facts: readonly { value: string }[]
  pages: HubPageFlags
}

/**
 * „Zamówienia publiczne, przetargi i większe dostawy” (runda 1811 D14): a dark card in the light
 * of the five lines (like the hero tile) for schools, offices, hospitals and companies — points
 * from the hub's data, the steps of the deliveries page as a short axis, the audiences, and the
 * way to `/inwestycje-i-dostawy`. Names of buyers only behind approved facts. Server-rendered.
 */
export function Procurement({ texts, steps, facts, pages }: Props) {
  const examples = withVisibleFacts(texts.examples, facts)
  const cta = isHubLinkLive(texts.cta.href, pages) ? texts.cta : null
  const more = isHubLinkLive(texts.more.href, pages) ? texts.more : null
  return (
    <section
      id="zamowienia"
      data-rail-section
      aria-labelledby="zamowienia-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-proc">
        <div className="pk-proc__head">
          <div className="pk-proc__intro">
            <span className="pk-eb">{texts.eyebrow}</span>
            <h2 id="zamowienia-h" className="pk-h2">
              {texts.title}
            </h2>
            <p className="pk-lead">{texts.lead}</p>
          </div>
          {(cta || more) && (
            <div className="pk-proc__cta">
              {cta && (
                <a href={cta.href} className="pk-hbtn pk-hbtn--accent pk-hbtn--big">
                  {cta.label} <span aria-hidden="true">→</span>
                </a>
              )}
              {more && (
                <a href={more.href} className="pk-hbtn">
                  {more.label} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          )}
        </div>
        <ul className="pk-proc__points" role="list">
          {texts.points.map((point, index) => (
            <li
              key={point.title}
              className="pk-proc__point"
              style={{ '--i': index } as CSSProperties}
            >
              <span className="pk-proc__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              <h3 className="pk-proc__title">{point.title}</h3>
              <p className="pk-proc__text">{point.text}</p>
            </li>
          ))}
        </ul>
        {steps.length > 0 && (
          <div className="pk-proc__steps">
            <span className="pk-proc__label" id="zamowienia-kroki">
              {texts.stepsLabel}
            </span>
            <ol className="pk-proc__axis" aria-labelledby="zamowienia-kroki">
              {steps.map((step, index) => (
                <li key={step}>
                  <span className="pk-proc__no" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
        <div className="pk-proc__for">
          <span className="pk-proc__label" id="zamowienia-dla">
            {texts.forLabel}
          </span>
          <ul className="pk-proc__who" role="list" aria-labelledby="zamowienia-dla">
            {texts.audiences.map((audience) => (
              <li key={audience.label}>
                <Icon name={audience.icon} />
                {audience.label}
              </li>
            ))}
          </ul>
        </div>
        {examples.length > 0 && (
          <div className="pk-proc__for">
            <span className="pk-proc__label" id="zamowienia-przyklady">
              {texts.examplesLabel}
            </span>
            <ul className="pk-proc__who" role="list" aria-labelledby="zamowienia-przyklady">
              {examples.map((example) => (
                <li key={example.text}>{example.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

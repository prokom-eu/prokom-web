'use client'

import { useId, useState } from 'react'

import type { HubHome } from '@/lib/prokom/home'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import type { HelpCase } from './model'

type Props = {
  texts: Omit<HubHome['help'], 'slugs'>
  cases: HelpCase[]
  /** `/pomoc`, or `null` while the page is off (v1.1 flag). */
  allHref: string | null
}

/**
 * „Co zrobić, gdy…” (spec §6.1 pkt 5, board 01 `#pomoc`): six situations from „Pomoc”; the panel
 * shows the first steps, the line's phone and its site. Without JavaScript the first situation
 * is shown.
 */
export function HelpPicker({ texts, cases, allHref }: Props) {
  const panelId = useId()
  const [picked, setPicked] = useState(cases[0]?.slug ?? '')
  const current = cases.find((entry) => entry.slug === picked) ?? cases[0]
  if (!current) return null
  const { line } = current

  return (
    <section
      id="pomoc"
      data-rail-section
      aria-labelledby="pomoc-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="pomoc-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        {allHref && (
          <a href={allHref} className="pk-hbtn">
            {texts.allLink} <span aria-hidden="true">→</span>
          </a>
        )}
      </div>
      <div className="pk-help">
        <div role="group" aria-labelledby="pomoc-h" className="pk-help__list">
          {cases.map((entry) => (
            <button
              key={entry.slug}
              type="button"
              className="pk-sit"
              style={lineStyle(entry.line.key)}
              aria-pressed={entry.slug === current.slug}
              aria-controls={panelId}
              onClick={() => setPicked(entry.slug)}
            >
              <i aria-hidden="true" className="pk-sit__bar" />
              {entry.title}
            </button>
          ))}
        </div>
        <div id={panelId} className="pk-help__panel" style={lineStyle(line.key)}>
          <span className="pk-eb pk-eb--line">
            <i aria-hidden="true" className="pk-sit__bar" />
            {texts.lineLabel} {line.name}
          </span>
          <h3 className="pk-h3 pk-h3--big" aria-live="polite">
            {current.title}
          </h3>
          <ol className="pk-help__steps">
            {current.steps.map((step, index) => (
              <li key={step}>
                <span aria-hidden="true" className="pk-help__n">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="pk-help__cta">
            {line.phone && line.tel && (
              <a href={line.tel} className="pk-hbtn pk-hbtn--line pk-hbtn--phone">
                {line.phone}
              </a>
            )}
            {line.url && line.domain && (
              <a href={line.url} className="pk-hbtn pk-hbtn--on-dark">
                {line.domain} <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

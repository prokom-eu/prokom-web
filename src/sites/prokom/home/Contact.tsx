import { OpeningStatus } from '@/components/shared/OpeningStatus'
import { Icon } from '@/components/ui/Icon'
import type { HubHome } from '@/lib/prokom/home'
import type { SharedCompany } from '@/lib/shared/project'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import { addressLine, type HomeLine } from './model'

/** Topic of the contact page for a question that fits no line (`/kontakt?temat=ogolne`). */
export const GENERAL_TOPIC = 'ogolne'

type Props = {
  texts: HubHome['contact']
  lines: readonly HomeLine[]
  company: SharedCompany
  now: string
  /** `/kontakt` — the form lives there (H6); the chips open it with the topic chosen. */
  contactHref: string
}

/**
 * „Kontakt” (spec §6.1 pkt 11, board 01 `#kontakt`): one row per line with its phone and promise
 * (from the line panels), the salon strip, and the topics as links to `/kontakt?temat=…` — the
 * message form itself is on the contact page (one form, one place for the anti-spam of ADR-003).
 */
export function Contact({ texts, lines, company, now, contactHref }: Props) {
  const address = addressLine(company)
  const topics = [
    { key: GENERAL_TOPIC, name: texts.general, line: 'prokom' as const },
    ...lines.map((line) => ({ key: line.key, name: line.name, line: line.key })),
  ]

  return (
    <section
      id="kontakt"
      data-rail-section
      aria-labelledby="kontakt-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-contact">
        <div className="pk-contact__main">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="kontakt-h" className="pk-h2">
            {texts.title}
          </h2>
          <ul className="pk-clines" role="list">
            {lines
              .filter((line) => line.phone && line.tel)
              .map((line) => (
                <li key={line.key} style={lineStyle(line.key)}>
                  <a href={line.tel ?? undefined} className="pk-clr">
                    <span className="pk-clr__badge" aria-hidden="true">
                      <Mark label={line.label} size="xs" decorative />
                    </span>
                    <span className="pk-clr__text">
                      <span className="pk-clr__name">
                        <span className="sr-only">{line.name}: </span>
                        {line.hero.short}
                      </span>
                      {line.promise && <span className="pk-clr__promise">{line.promise}</span>}
                    </span>
                    <span className="pk-clr__phone">
                      <Icon name="phone" />
                      {line.phone}
                    </span>
                  </a>
                </li>
              ))}
          </ul>
          {address && (
            <div className="pk-csl">
              <span className="pk-csl__icon" aria-hidden="true">
                <Icon name="pin" />
              </span>
              <span className="pk-csl__text">
                <span className="pk-eb">{texts.salon}</span>
                <span className="pk-csl__address">{address}</span>
                <span className="pk-csl__meta">
                  <OpeningStatus hours={company.hours} holidays={company.holidays} now={now} />
                  {company.email && (
                    <a href={`mailto:${company.email}`} className="pk-csl__mail">
                      {company.email}
                    </a>
                  )}
                </span>
              </span>
              <a href={contactHref} className="pk-hbtn pk-hbtn--small">
                {texts.directions} <span aria-hidden="true">→</span>
              </a>
            </div>
          )}
        </div>
        <div className="pk-contact__write">
          <h3 className="pk-h3">{texts.write}</h3>
          <div className="pk-topics">
            <span className="pk-topics__label" id="kontakt-tematy">
              {texts.topicsLabel}
            </span>
            <ul className="pk-topics__list" role="list" aria-labelledby="kontakt-tematy">
              {topics.map((topic) => (
                <li key={topic.key} style={lineStyle(topic.line)}>
                  <a href={`${contactHref}?temat=${topic.key}`} className="pk-topic">
                    <i aria-hidden="true" />
                    {topic.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <a href={contactHref} className="pk-hbtn pk-hbtn--accent pk-hbtn--big">
            {texts.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

import { OpeningStatus } from '@/components/shared/OpeningStatus'
import { Icon } from '@/components/ui/Icon'
import type { HubHome } from '@/lib/prokom/home'
import type { SharedCompany } from '@/lib/shared/project'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from './Mark'
import { addressLine, type HomeLine } from './model'

/** Key of the chip for a question that fits no line (its label is `contact.general`). */
export const GENERAL_TOPIC = 'ogolne'

type Props = {
  texts: HubHome['contact']
  lines: readonly HomeLine[]
  company: SharedCompany
  /** The hub's e-mail (`SiteSettings` of `prokom`, like the footer) — not `CompanyData.email`. */
  email: string | null
  now: string
  /** `/kontakt` — the form lives there (H6); the chips open it with the topic chosen. */
  contactHref: string
}

/**
 * „Kontakt” (spec §6.1 pkt 11, board 01 `#kontakt`): one row per line with its phone, hours and
 * promise (from the line panels), the salon strip, and the topics as links to `/kontakt?temat=<label>` (the topics of the hub's contact form) — the
 * message form itself is on the contact page (one form, one place for the anti-spam of ADR-003).
 */
export function Contact({ texts, lines, company, email, now, contactHref }: Props) {
  const address = addressLine(company)
  const callable = lines.filter((line) => line.phone && line.tel)
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
          {callable.length > 0 && (
            <ul className="pk-clines" role="list">
              {callable.map((line) => (
                <li key={line.key} style={lineStyle(line.key)}>
                  {line.points.length > 0 ? (
                    <PointsRow line={line} />
                  ) : (
                    <a href={line.tel ?? undefined} className="pk-clr">
                      <LineLabel line={line} />
                      <span className="pk-clr__phone">
                        <Icon name="phone" />
                        {line.phone}
                      </span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
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
                  {email && (
                    <a href={`mailto:${email}`} className="pk-csl__mail">
                      {email}
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
                  <a
                    href={`${contactHref}?temat=${encodeURIComponent(topic.name)}#formularz`}
                    className="pk-topic"
                  >
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

/** Badge, short name and hours · promise of a line row. */
function LineLabel({ line }: { line: HomeLine }) {
  return (
    <>
      <span className="pk-clr__badge" aria-hidden="true">
        <Mark label={line.label} size="xs" decorative />
      </span>
      <span className="pk-clr__text">
        <span className="pk-clr__name">
          <span className="sr-only">{line.name}: </span>
          {line.hero.short}
        </span>
        {(line.promise || line.hours) && (
          <span className="pk-clr__promise">
            {[line.hours, line.promise].filter(Boolean).join(' · ')}
          </span>
        )}
      </span>
    </>
  )
}

/**
 * A line with points (Tech, runda 1811 D5): one phone per point and the infoline instead of a
 * single number — the row is not a link itself, each number is.
 */
function PointsRow({ line }: { line: HomeLine }) {
  return (
    <div className="pk-clr pk-clr--points">
      <LineLabel line={line} />
      <ul className="pk-clr__points" role="list">
        {line.points.map((point) => (
          <li key={point.tel}>
            <a href={point.tel} className="pk-clr__point">
              <span className="sr-only">{line.name}, </span>
              <small>{point.label}</small>
              <span className="sr-only">: </span>
              <b>{point.phone}</b>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

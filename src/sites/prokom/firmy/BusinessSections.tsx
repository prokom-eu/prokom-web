import Link from 'next/link'

import { HeadingText } from '@/components/shared/HeadingText'
import { Icon } from '@/components/ui/Icon'
import type { HubForBusiness } from '@/lib/prokom/forBusiness'
import { withVisibleFacts } from '@/lib/prokom/home'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from '../home/Mark'
import type { BusinessLineInfo } from './model'

/** Hero of `/dla-firm` (board 03): H1 of spec §4, the company phone, the „state” card and the facts. */
export function BusinessHero({
  texts,
  facts,
  phone,
  tel,
  hours,
}: {
  texts: HubForBusiness['hero']
  facts: readonly { value: string }[]
  phone: string | null
  tel: string | null
  hours: string | null
}) {
  const shown = withVisibleFacts(texts.facts, facts)
  return (
    <section aria-labelledby="dla-firm-h" className="pk-ohero">
      <div aria-hidden="true" className="pk-hero__dots" />
      <div className={`pk-ohero__inner ${HUB_CONTAINER}`}>
        <div className="pk-bhero">
          <div className="pk-ohero__intro">
            <span className="pk-eb">{texts.eyebrow}</span>
            <h1 id="dla-firm-h" className="pk-h1">
              <HeadingText text={texts.title} emClass="pk-nowrap" />
            </h1>
            <p className="pk-lead pk-lead--big">{texts.lead}</p>
            <div className="pk-coop__links">
              <a href="#branze" className="pk-hbtn pk-hbtn--accent">
                {texts.choose} <span aria-hidden="true">↓</span>
              </a>
              {phone && tel && (
                <a href={tel} className="pk-hbtn pk-hbtn--phone">
                  {phone}
                </a>
              )}
            </div>
            <span className="pk-plan__note">
              {texts.callNote}
              {hours ? ` ${hours}` : ''}
            </span>
          </div>
          <div className="pk-bstate" aria-hidden="true">
            <span className="pk-bstate__head">
              {texts.stateLabel}
              <span>{texts.stateTag}</span>
            </span>
            {texts.rows.map((row) => (
              <span key={row.label} className="pk-bstate__row" style={lineStyle(row.line)}>
                <span>
                  <i />
                  {row.label}
                </span>
                <span className="pk-vp">
                  <i className="pk-rec" />
                  {row.state}
                </span>
              </span>
            ))}
            <span className="pk-bstate__note">{texts.stateNote}</span>
          </div>
        </div>
        {shown.length > 0 && (
          <ul className="pk-bfacts" role="list">
            {shown.map((fact) => (
              <li key={fact.value}>
                <span className="pk-bfacts__value">{fact.value}</span>
                <span className="pk-bfacts__label">{fact.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

/** „Wdrożenie krok po kroku” (board 03 `#wdrozenie`) as one readable list (no stepper). */
export function Rollout({ texts }: { texts: HubForBusiness['rollout'] }) {
  return (
    <section id="wdrozenie" aria-labelledby="wdrozenie-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="wdrozenie-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <ol className="pk-roll">
        {texts.steps.map((step, index) => (
          <li key={step.title} className="pk-roll__step">
            <span className="pk-roll__n">
              {texts.step} {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="pk-roll__title">{step.title}</h3>
            <p className="pk-roll__text">{step.text}</p>
            <dl className="pk-roll__who">
              <div>
                <dt>{texts.we}</dt>
                <dd>{step.we}</dd>
              </div>
              <div>
                <dt>{texts.you}</dt>
                <dd>{step.you}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** „Po wdrożeniu” (board 03 `#opieka`): service per line, its phone and promise from the panel. */
export function Care({
  texts,
  lines,
}: {
  texts: HubForBusiness['care']
  lines: readonly BusinessLineInfo[]
}) {
  const items = texts.items.flatMap((item) => {
    const info = lines.find((line) => line.key === item.line)
    return info ? [{ ...item, info }] : []
  })
  if (!items.length) return null
  return (
    <section id="opieka" aria-labelledby="opieka-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="opieka-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <ul className="pk-o5" role="list">
        {items.map(({ info, title, points }) => (
          <li key={title} style={lineStyle(info.key)}>
            <a href={info.url ?? undefined} className="pk-lcard pk-care">
              <span className="pk-care__top">
                <Mark label={info.label} />
                {info.phone && <span className="pk-lcard__phone">{info.phone}</span>}
              </span>
              <span className="pk-olc__short">{title}</span>
              <span className="pk-od__chips">
                {points.map((point) => (
                  <span key={point} className="pk-ocp">
                    {point}
                  </span>
                ))}
              </span>
              {info.promise && (
                <span className="pk-olc__promise">
                  <i aria-hidden="true" />
                  {info.promise}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** „Kilku wykonawców czy jeden?” (board 03 `#porownanie`) as a real table. */
export function Compare({ texts }: { texts: HubForBusiness['compare'] }) {
  return (
    <section id="porownanie" aria-labelledby="porownanie-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="porownanie-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <div className="pk-cmp-wrap">
        <table className="pk-cmp">
          <thead>
            <tr>
              <th scope="col">{texts.topic}</th>
              <th scope="col">{texts.many}</th>
              <th scope="col" className="pk-cmp__one">
                {texts.one}
              </th>
            </tr>
          </thead>
          <tbody>
            {texts.rows.map((row) => (
              <tr key={row.topic}>
                <th scope="row">{row.topic}</th>
                <td>{row.many}</td>
                <td className="pk-cmp__one">{row.one}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/** „Dofinansowania” (board 03): documents for funded purchases — never financing (spec §6.3). */
export function Grants({
  texts,
  phone,
  tel,
}: {
  texts: HubForBusiness['grants']
  phone: string | null
  tel: string | null
}) {
  return (
    <section
      id="dofinansowania"
      aria-labelledby="dofinansowania-h"
      className={`pk-sect ${HUB_CONTAINER}`}
    >
      <div className="pk-coop">
        <div className="pk-coop__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="dofinansowania-h" className="pk-h2">
            {texts.title}
          </h2>
          <p className="pk-lead">{texts.lead}</p>
          <div className="pk-coop__links">
            <a href="#formularz" className="pk-hbtn pk-hbtn--accent">
              {texts.cta}
            </a>
            {phone && tel && (
              <a href={tel} className="pk-hbtn pk-hbtn--phone">
                {phone}
              </a>
            )}
          </div>
        </div>
        <ul className="pk-grants" role="list">
          {texts.points.map((point) => (
            <li key={point.text}>
              <span className="pk-csl__icon" aria-hidden="true">
                <Icon name={point.icon} />
              </span>
              {point.text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * „Opisz firmę” (board 03 `#formularz`): what happens after the message and the way to the form.
 * TODO(krystian): H6-1 puts the `hub-dla-firm` form (ContactForm) here; until then the button opens
 * the contact page with the topic set — one form flow, one anti-spam place (ADR-003).
 */
export function FormCta({ texts, href }: { texts: HubForBusiness['form']; href: string }) {
  return (
    <section id="formularz" aria-labelledby="formularz-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-contact">
        <div className="pk-contact__main">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="formularz-h" className="pk-h2">
            {texts.title}
          </h2>
          <a href={href} className="pk-hbtn pk-hbtn--accent pk-hbtn--big">
            {texts.cta} <span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="pk-contact__write">
          <span className="pk-eb">{texts.afterLabel}</span>
          <ol className="pk-ind__start">
            {texts.after.map((item, index) => (
              <li key={item}>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {item}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/** The closing band of `/dla-firm`: the company phone, contact and the catalog of the lines. */
export function BusinessFinal({
  texts,
  phone,
  tel,
}: {
  texts: HubForBusiness['final']
  phone: string | null
  tel: string | null
}) {
  return (
    <section aria-labelledby="dla-firm-final" className="pk-final">
      <div aria-hidden="true" className="pk-final__dots" />
      <div className={`pk-final__inner ${HUB_CONTAINER}`}>
        <h2 id="dla-firm-final" className="pk-h2 pk-h2--big pk-final__title">
          {texts.title}
        </h2>
        <div className="pk-final__cta">
          {phone && tel && (
            <a href={tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--xl pk-hbtn--phone">
              {phone}
            </a>
          )}
          <Link href="/kontakt" className="pk-hbtn pk-hbtn--xl">
            {texts.contact}
          </Link>
          <Link href="/linie" className="pk-hbtn pk-hbtn--xl">
            {texts.lines}
          </Link>
        </div>
      </div>
    </section>
  )
}

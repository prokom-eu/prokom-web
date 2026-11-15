import Link from 'next/link'

import { OpeningStatus } from '@/components/shared/OpeningStatus'
import type { HubForHome } from '@/lib/prokom/forHome'
import { withVisibleFacts } from '@/lib/prokom/home'
import type { SharedCompany } from '@/lib/shared/project'
import { hoursSummary } from '@/lib/site/hoursSummary'

import { HUB_CONTAINER } from '../container'
import { HeroArt } from '../subpages/HeroArt'
import { lineStyle } from '../lineColors'
import { OptionalLink } from '../firmy/OptionalLink'
import type { BusinessLineInfo } from '../firmy/model'
import { Mark } from '../home/Mark'
import { addressLine } from '../home/model'

/** Hero of `/dla-domu` (board 04): H1 of spec §4, company phone, facts and the three lines. */
export function HomeHero({
  texts,
  facts,
  lines,
  phone,
  tel,
  hours,
}: {
  texts: HubForHome['hero']
  facts: readonly { value: string }[]
  lines: readonly BusinessLineInfo[]
  phone: string | null
  tel: string | null
  hours: string | null
}) {
  const shown = withVisibleFacts(texts.facts, facts)
  const trio = texts.trio.flatMap((card) => {
    const info = lines.find((line) => line.key === card.line)
    return info ? [{ ...card, info }] : []
  })
  return (
    <section aria-labelledby="dla-domu-h" className="pk-ohero">
      <div aria-hidden="true" className="pk-hero__dots" />
      <div className={`pk-ohero__inner ${HUB_CONTAINER}`}>
        <div className="pk-bhero">
          <div className="pk-ohero__intro">
            <span className="pk-eb">{texts.eyebrow}</span>
            <h1 id="dla-domu-h" className="pk-h1">
              {texts.title}
            </h1>
            <p className="pk-lead pk-lead--big">{texts.lead}</p>
            <div className="pk-coop__links">
              <a href="#sytuacja" className="pk-hbtn pk-hbtn--accent">
                {texts.choose} <span aria-hidden="true">↓</span>
              </a>
              {phone && tel && (
                <a href={tel} className="pk-hbtn pk-hbtn--phone">
                  {phone}
                </a>
              )}
              {hours && <span className="pk-plan__note">{hours}</span>}
            </div>
          </div>
          <HeroArt kind="home" />
        </div>
        {trio.length > 0 && (
          <ul className="pk-o5" role="list">
            {trio.map((card) => (
              <li key={card.line} style={lineStyle(card.line)}>
                <OptionalLink href={card.anchor ?? card.info.url} className="pk-lcard pk-trio">
                  <Mark label={card.info.label} />
                  <span className="pk-olc__short">{card.title}</span>
                  <span className="pk-olc__who">{card.text}</span>
                </OptionalLink>
              </li>
            ))}
          </ul>
        )}
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

/**
 * „Jedenaście miejsc…” (board 04 `#przekroj`): the points of the house as cards — what, why and
 * when to plan it. The board's drawing is illustration only; the list carries the content.
 */
export function HouseSection({
  texts,
  href,
}: {
  texts: HubForHome['section']
  /** The Instalacje site, from its panel. */
  href: string | null
}) {
  return (
    <section id="przekroj" aria-labelledby="przekroj-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="przekroj-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <div className="pk-sect__aside pk-stack">
          <p className="pk-lead">{texts.lead}</p>
          {href && (
            <a href={href} className="pk-hbtn">
              {texts.cta} <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>
      <ol className="pk-points" style={lineStyle('instalacje')}>
        {texts.points.map((point, index) => (
          <li key={point.name} className="pk-point">
            <span className="pk-point__top">
              <b aria-hidden="true">{index + 1}</b>
              <span className="pk-point__where">{point.where}</span>
            </span>
            <h3 className="pk-roll__title">{point.name}</h3>
            <p className="pk-roll__text">{point.what}</p>
            <dl className="pk-roll__who">
              <div>
                <dt>{texts.why}</dt>
                <dd>{point.why}</dd>
              </div>
              <div>
                <dt>{texts.when}</dt>
                <dd>{point.when}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      <p className="pk-note">{texts.note}</p>
    </section>
  )
}

/** „Po montażu i po naprawie zostajemy” (board 04 `#opieka`): guarantees and the salon card. */
export function HomeCare({
  texts,
  lines,
  company,
  now,
  phone,
  tel,
}: {
  texts: HubForHome['care']
  lines: readonly BusinessLineInfo[]
  company: SharedCompany
  now: string
  phone: string | null
  tel: string | null
}) {
  const items = texts.items.filter((item) => lines.some((line) => line.key === item.line))
  const address = addressLine(company)
  const hours = hoursSummary(company.hours)
  return (
    <section id="opieka" aria-labelledby="opieka-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__intro">
        <span className="pk-eb">{texts.eyebrow}</span>
        <h2 id="opieka-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <div className="pk-hcare">
        <ul className="pk-hcare__items" role="list">
          {items.map((item) => (
            <li
              key={`${item.line}-${item.value}`}
              className="pk-lcard"
              style={lineStyle(item.line)}
            >
              <span className="pk-hcare__value">{item.value}</span>
              <span className="pk-olc__who">{item.text}</span>
            </li>
          ))}
        </ul>
        {address && (
          <div className="pk-salon">
            <div className="pk-salon__top">
              <span className="pk-salon__name">
                {texts.salon}
                {company.address && ` · ${company.address.city}`}
              </span>
              <OpeningStatus hours={company.hours} holidays={company.holidays} now={now} />
            </div>
            <span className="pk-salon__where">
              {address}
              {hours && ` · ${hours}`}
            </span>
            <span className="pk-salon__where">
              <strong>{texts.remote}</strong> {texts.remoteNote}
            </span>
            <span className="pk-od__chips">
              {texts.extras.map((extra) => (
                <span key={extra} className="pk-ocp">
                  {extra}
                </span>
              ))}
            </span>
            <div className="pk-salon__cta">
              <Link href="/kontakt" className="pk-hbtn">
                {texts.directions} <span aria-hidden="true">→</span>
              </Link>
              {phone && tel && (
                <a href={tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--phone">
                  {phone}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/** The closing band of `/dla-domu`: each line's number and promise from its panel. */
export function HomeFinal({
  texts,
  lines,
  company,
}: {
  texts: HubForHome['final']
  lines: readonly BusinessLineInfo[]
  company: SharedCompany
}) {
  const numbers = texts.lines.flatMap((entry) => {
    const info = lines.find((line) => line.key === entry.line)
    return info?.phone ? [{ ...entry, info }] : []
  })
  const address = addressLine(company)
  return (
    <section aria-labelledby="dla-domu-final" className="pk-final">
      <div aria-hidden="true" className="pk-final__dots" />
      <div className={`pk-final__inner ${HUB_CONTAINER}`}>
        <h2 id="dla-domu-final" className="pk-h2 pk-h2--big pk-final__title">
          {texts.title}
        </h2>
        <ul className="pk-o5 pk-final__numbers" role="list">
          {numbers.map(({ info, what }) => (
            <li key={info.key} style={lineStyle(info.key)}>
              <OptionalLink href={info.tel} className="pk-lcard pk-trio">
                <Mark label={info.label} />
                <span className="pk-olc__who">{what}</span>
                <span className="pk-olc__phone">{info.phone}</span>
                {info.promise && (
                  <span className="pk-olc__promise">
                    <i aria-hidden="true" />
                    {info.promise}
                  </span>
                )}
              </OptionalLink>
            </li>
          ))}
        </ul>
        {address && (
          <p className="pk-plan__note">
            {address} ·{' '}
            <Link href="/kontakt" className="pk-final__link">
              {texts.directions} <span aria-hidden="true">→</span>
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}

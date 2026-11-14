'use client'

import { useId, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import type { HubForBusiness } from '@/lib/prokom/forBusiness'
import { iconForService } from '@/lib/prokom/icons'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from '../home/Mark'
import { linesCount, plural } from '../home/model'
import type { Area, BusinessLineInfo, Industry } from './model'

/**
 * „Wybierz branżę. Pokażemy plan.” (spec §6.3, board 03 `#branze`): the industries of `HubPlans`
 * as toggle buttons; the plan card shows the lines (cards to the line sites), where we start and
 * what we ask first. Without JavaScript the first industry is shown.
 */
export function IndustryPicker({
  texts,
  items,
  phone,
  tel,
}: {
  texts: HubForBusiness['industries']
  items: Industry[]
  phone: string | null
  tel: string | null
}) {
  const panelId = useId()
  const [picked, setPicked] = useState(items[0]?.key ?? '')
  const plan = items.find((item) => item.key === picked) ?? items[0]
  if (!plan) return null
  return (
    <section id="branze" aria-labelledby="branze-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="branze-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div className="pk-choose">
        <div role="group" aria-labelledby="branze-h" className="pk-ind">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              className="pk-ind__item"
              aria-pressed={item.key === plan.key}
              aria-controls={panelId}
              onClick={() => setPicked(item.key)}
            >
              <span className="pk-ind__icon" aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <span className="pk-pt__body">
                <span className="pk-ind__name">{item.name}</span>
                {item.sub && <span className="pk-pt__sub">{item.sub}</span>}
              </span>
            </button>
          ))}
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
                <LineCard info={group}>
                  <ul className="pk-dots" role="list">
                    {group.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </LineCard>
              </li>
            ))}
          </ul>
          <div className="pk-ind__more">
            {plan.start.length > 0 && (
              <div className="pk-ind__block">
                <span className="pk-eb">{texts.start}</span>
                <ol className="pk-ind__start">
                  {plan.start.map((item, index) => (
                    <li key={item}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {plan.questions.length > 0 && (
              <div className="pk-ind__block">
                <span className="pk-eb">{texts.ask}</span>
                <ul className="pk-ind__ask" role="list">
                  {plan.questions.map((item) => (
                    <li key={item}>
                      <span aria-hidden="true">?</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="pk-plan__foot">
            {phone && tel && (
              <a href={tel} className="pk-hbtn pk-hbtn--accent">
                {texts.call} {phone}
              </a>
            )}
            <a href="#formularz" className="pk-hbtn">
              {texts.describe}
            </a>
            <span className="pk-plan__note">{texts.note}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

/** A card of one line: its mark, the given content, phone and domain from the panel. */
function LineCard({ info, children }: { info: BusinessLineInfo; children: React.ReactNode }) {
  const body = (
    <>
      <Mark label={info.label} />
      {children}
      <span className="pk-lcard__foot">
        {info.phone && <span className="pk-lcard__phone">{info.phone}</span>}
        {info.domain && (
          <span className="pk-chip-go">
            {info.domain} <span aria-hidden="true">↗</span>
          </span>
        )}
      </span>
    </>
  )
  return info.url ? (
    <a href={info.url} className="pk-lcard">
      {body}
    </a>
  ) : (
    <div className="pk-lcard">{body}</div>
  )
}

/**
 * „Cztery linie pracują dla Twojej firmy” (board 03 `#zakres`): the four lines as tabs (WAI-ARIA),
 * the areas of the chosen line as chips, the panel with the area's services and first steps.
 */
export function AreaTabs({
  texts,
  lines,
  items,
}: {
  texts: Omit<HubForBusiness['areas'], 'items'>
  lines: (BusinessLineInfo & { short: string })[]
  items: Area[]
}) {
  const baseId = useId()
  const [index, setIndex] = useState(0)
  const area = items[index] ?? items[0]
  const tabs = lines.filter((line) => items.some((item) => item.line === line.key))
  if (!area) return null
  const total = items.reduce((sum, item) => sum + item.services.length, 0)
  const inLine = items
    .map((item, at) => ({ item, at }))
    .filter(({ item }) => item.line === area.line)
  const pickLine = (key: string) => {
    const first = items.findIndex((item) => item.line === key)
    if (first >= 0 && items[first]?.line !== area.line) setIndex(first)
  }
  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key]
    if (step === undefined) return
    event.preventDefault()
    const at = tabs.findIndex((line) => line.key === area.line)
    const next = tabs[(at + step + tabs.length) % tabs.length]
    if (!next) return
    pickLine(next.key)
    document.getElementById(`${baseId}-${next.key}`)?.focus()
  }

  return (
    <section id="zakres" aria-labelledby="zakres-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__intro">
        <span className="pk-eb">
          {texts.eyebrow} · {plural(total, ['usługa', 'usługi', 'usług'])}
        </span>
        <h2 id="zakres-h" className="pk-h2 pk-h2--big">
          {texts.title}
        </h2>
      </div>
      <div role="tablist" aria-labelledby="zakres-h" className="pk-ltabs" onKeyDown={onKey}>
        {tabs.map((line) => {
          const on = line.key === area.line
          const count = items
            .filter((item) => item.line === line.key)
            .reduce((sum, item) => sum + item.services.length, 0)
          return (
            <button
              key={line.key}
              id={`${baseId}-${line.key}`}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              className="pk-ltab"
              style={lineStyle(line.key)}
              onClick={() => pickLine(line.key)}
            >
              <span className="pk-ltab__top">
                <Mark size="xs" decorative />
                <span className="pk-ltab__count">
                  {plural(count, ['usługa', 'usługi', 'usług'])}
                </span>
              </span>
              <span className="pk-ltab__name">{line.name}</span>
              <span className="pk-ltab__short">{line.short}</span>
            </button>
          )
        })}
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-${area.line}`}
        className="pk-area"
        style={lineStyle(area.line)}
      >
        {inLine.length > 1 && (
          <div role="group" aria-label={texts.inLine} className="pk-area__subs">
            <span className="pk-ofilter__label">{texts.inLine}</span>
            {inLine.map(({ item, at }) => (
              <button
                key={item.title}
                type="button"
                className="pk-ochip"
                aria-pressed={at === index}
                onClick={() => setIndex(at)}
              >
                <i aria-hidden="true" />
                {item.title}
              </button>
            ))}
          </div>
        )}
        <div className="pk-area__grid">
          <div className="pk-area__intro">
            <Mark label={area.info.label} />
            <h3 className="pk-h3" aria-live="polite">
              {area.title}
            </h3>
            <p className="pk-area__lead">{area.lead}</p>
            <div className="pk-area__cta">
              {area.href && (
                <a href={area.href} className="pk-hbtn pk-hbtn--line">
                  {area.cta} <span aria-hidden="true">{area.href.startsWith('/') ? '→' : '↗'}</span>
                </a>
              )}
              {area.info.phone && area.info.tel && (
                <a href={area.info.tel} className="pk-hbtn pk-hbtn--on-dark pk-hbtn--phone">
                  {area.info.phone}
                </a>
              )}
            </div>
            {(area.info.promise || area.info.domain) && (
              <span className="pk-area__promise">
                <i aria-hidden="true" className="pk-rec" />
                {[area.info.promise, area.info.domain].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          <div className="pk-area__services">
            <span className="pk-eb pk-eb--line">
              {plural(area.services.length, ['usługa', 'usługi', 'usług'])} {texts.inArea}
            </span>
            <ul className="pk-area__list" role="list">
              {area.services.map((service) => (
                <li key={service.title}>
                  <span className="pk-osv__icon" aria-hidden="true">
                    <Icon name={iconForService(service.title)} />
                  </span>
                  <span className="pk-osv__text">
                    <span className="pk-osv__title">{service.title}</span>
                    <span className="pk-area__text">{service.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {area.steps.length > 0 && (
          <ol className="pk-area__steps" aria-label={texts.steps}>
            {area.steps.map((step, at) => (
              <li key={step.title}>
                <span className="pk-ost__n" aria-hidden="true">
                  {String(at + 1).padStart(2, '0')}
                </span>
                <span className="pk-ost__title">{step.title}</span>
                <span className="pk-ost__text">{step.text}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

type Situation = HubForBusiness['situations']['items'][number] & {
  steps: (BusinessLineInfo & { what: string })[]
}

/**
 * „Jedna sytuacja. Kilka linii. Ustalona kolejność.” (board 03 `#sytuacje`): typical situations as
 * toggle buttons; the panel shows which lines come in, in which order, with their phones.
 */
export function SituationPicker({
  texts,
  items,
  phone,
}: {
  texts: Omit<HubForBusiness['situations'], 'items'>
  items: Situation[]
  phone: string | null
}) {
  const panelId = useId()
  const [index, setIndex] = useState(0)
  const current = items[index] ?? items[0]
  if (!current) return null
  return (
    <section id="sytuacje" aria-labelledby="sytuacje-h" className={`pk-sect ${HUB_CONTAINER}`}>
      <div className="pk-sect__head">
        <div className="pk-sect__intro">
          <span className="pk-eb">{texts.eyebrow}</span>
          <h2 id="sytuacje-h" className="pk-h2 pk-h2--big">
            {texts.title}
          </h2>
        </div>
        <p className="pk-lead pk-sect__aside">{texts.lead}</p>
      </div>
      <div className="pk-help">
        <div role="group" aria-labelledby="sytuacje-h" className="pk-help__list">
          {items.map((item, at) => (
            <button
              key={item.title}
              type="button"
              className="pk-sit pk-sit--neutral"
              aria-pressed={at === index}
              aria-controls={panelId}
              onClick={() => setIndex(at)}
            >
              <i aria-hidden="true" className="pk-sit__bar" />
              {item.title}
            </button>
          ))}
        </div>
        <div id={panelId} className="pk-situation">
          <span className="pk-eb">{texts.label}</span>
          <h3 className="pk-h3" aria-live="polite">
            {current.title}
          </h3>
          <p className="pk-lead">{current.text}</p>
          <ol className="pk-situation__order">
            {current.steps.map((step, at) => (
              <li key={`${at}-${step.what}`} style={lineStyle(step.key)}>
                <a href={step.url ?? undefined} className="pk-lcard pk-situation__card">
                  <span className="pk-situation__when">
                    <b aria-hidden="true">{String(at + 1).padStart(2, '0')}</b>
                    {texts.when[at]}
                  </span>
                  <Mark label={step.label} />
                  <span className="pk-situation__what">{step.what}</span>
                  {step.phone && <span className="pk-lcard__phone">{step.phone}</span>}
                </a>
              </li>
            ))}
          </ol>
          <ul className="pk-oteam__pillars" role="list">
            {texts.pillars.map((pillar) => (
              <li key={pillar}>
                <i aria-hidden="true" />
                {pillar}
              </li>
            ))}
            {phone && (
              <li>
                <i aria-hidden="true" />
                {texts.start} {phone}
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}

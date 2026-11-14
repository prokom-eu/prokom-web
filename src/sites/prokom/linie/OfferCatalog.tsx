'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

import { Icon } from '@/components/ui/Icon'
import { iconForService } from '@/lib/prokom/icons'
import type { HubLine } from '@/lib/prokom/lines'
import type { HubOffer } from '@/lib/prokom/offer'

import { HUB_CONTAINER } from '../container'
import { lineStyle } from '../lineColors'
import { Mark } from '../home/Mark'
import { plural } from '../home/model'
import {
  type Audience,
  filterServices,
  type OfferFilter,
  type OfferLine,
  offerQuery,
  type OfferService,
} from './model'

type Props = {
  texts: Pick<HubOffer, 'hero' | 'filters' | 'empty' | 'detail'>
  lines: OfferLine[]
  services: OfferService[]
  initial: OfferFilter & { selected: string | null }
  phone: string | null
  tel: string | null
  hours: string | null
  /** `/pomoc`, or `null` while the page is off (v1.1 flag). */
  helpHref: string | null
}

const servicesCount = (count: number) => plural(count, ['usługa', 'usługi', 'usług'])
const linesIn = (count: number) => (count === 1 ? '1 linii' : `${count} liniach`)

/**
 * Hero search and catalog of `/linie` (spec §6.2, board 02): the services of `HubServices` grouped
 * by line, filtered by text, audience and line with counts from the data, and the detail of the
 * chosen service. The state lives in the address (`?q=&dla=&linia=&u=`), so a link to one service
 * can be sent. On a phone the detail opens as a sheet over the list.
 */
export function OfferCatalog({
  texts,
  lines,
  services,
  initial,
  phone,
  tel,
  hours,
  helpHref,
}: Props) {
  const [filter, setFilter] = useState<OfferFilter>({
    q: initial.q,
    audience: initial.audience,
    line: initial.line,
  })
  const [selected, setSelected] = useState<string | null>(initial.selected)
  const [sheet, setSheet] = useState(initial.selected !== null)
  const sheetRef = useRef<HTMLElement>(null)
  const searchId = useId()
  const matching = useMemo(() => filterServices(services, filter), [services, filter])
  const current =
    services.find((service) => service.key === selected) ?? matching[0] ?? services[0] ?? null

  // The address follows the state (replace — the back button leaves the page, not each filter).
  useEffect(() => {
    const query = offerQuery(filter, selected)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${query}`)
  }, [filter, selected])

  // The sheet (phone) takes the focus and closes on Escape.
  useEffect(() => {
    if (!sheet) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet])

  const pick = (key: string) => {
    setSelected(key)
    setSheet(true)
    // Only where the detail is a sheet: on wide screens it stays beside the list.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      window.setTimeout(() => sheetRef.current?.focus(), 0)
    }
  }
  const update = (next: Partial<OfferFilter>) => setFilter((value) => ({ ...value, ...next }))
  const reset = () => setFilter({ q: '', audience: null, line: null })
  const lineOf = (key: HubLine) => lines.find((line) => line.key === key)
  const groups = lines
    .map((line) => ({ line, items: matching.filter((service) => service.line === line.key) }))
    .filter((group) => group.items.length > 0)
  const shownLines = new Set(matching.map((service) => service.line)).size

  return (
    <>
      <section id="oferta" aria-labelledby="oferta-h" className="pk-ohero">
        <div aria-hidden="true" className="pk-hero__dots" />
        <div className={`pk-ohero__inner ${HUB_CONTAINER}`}>
          <div className="pk-ohero__top">
            <div className="pk-ohero__intro">
              <span className="pk-eb">{texts.hero.eyebrow}</span>
              <h1 id="oferta-h" className="pk-h1">
                {texts.hero.title}
              </h1>
              <p className="pk-lead pk-lead--big">{texts.hero.lead}</p>
            </div>
            {phone && tel && (
              <div className="pk-ohero__ask">
                <span className="pk-ohero__ask-label">{texts.hero.ask}</span>
                <a href={tel} className="pk-ohero__phone">
                  {phone}
                </a>
                <span className="pk-ohero__ask-note">
                  {hours ? `${hours} · ` : ''}
                  {texts.hero.askNote}
                </span>
              </div>
            )}
          </div>
          <div className="pk-osearch">
            <label htmlFor={searchId} className="sr-only">
              {texts.hero.searchLabel}
            </label>
            <span className="pk-osearch__icon" aria-hidden="true">
              <Icon name="q" />
            </span>
            <input
              id={searchId}
              type="search"
              value={filter.q}
              onChange={(event) => update({ q: event.target.value })}
              placeholder={texts.hero.examples[0]?.label}
              autoComplete="off"
              className="pk-osearch__input"
            />
            {filter.q && (
              <button type="button" className="pk-osearch__clear" onClick={() => update({ q: '' })}>
                {texts.filters.clear}
              </button>
            )}
            <span className="pk-osearch__count" aria-live="polite">
              {servicesCount(matching.length)} w {linesIn(shownLines)}
            </span>
          </div>
          <div className="pk-ochips">
            <span className="pk-ochips__label">{texts.hero.examplesLabel}</span>
            {texts.hero.examples.map((example) => (
              <button
                key={example.label}
                type="button"
                className="pk-ochip"
                style={lineStyle(example.line)}
                onClick={() => update({ q: example.label, line: null, audience: null })}
              >
                <i aria-hidden="true" />
                {example.label}
              </button>
            ))}
          </div>
          <div className="pk-ofilters">
            <div role="group" aria-labelledby={`${searchId}-aud`} className="pk-ofilter">
              <span id={`${searchId}-aud`} className="pk-ofilter__label">
                {texts.filters.audience}
              </span>
              {([null, 'firma', 'dom'] as (Audience | null)[]).map((value) => (
                <button
                  key={value ?? 'all'}
                  type="button"
                  className="pk-ochip"
                  aria-pressed={filter.audience === value}
                  onClick={() => update({ audience: value })}
                >
                  {value ? texts.filters.audiences[value] : texts.filters.allAudiences}
                </button>
              ))}
            </div>
            <div role="group" aria-labelledby={`${searchId}-line`} className="pk-ofilter">
              <span id={`${searchId}-line`} className="pk-ofilter__label">
                {texts.filters.line}
              </span>
              <button
                type="button"
                className="pk-ochip"
                aria-pressed={filter.line === null}
                onClick={() => update({ line: null })}
              >
                {texts.filters.allLines}
              </button>
              {lines.map((line) => (
                <button
                  key={line.key}
                  type="button"
                  className="pk-ochip"
                  style={lineStyle(line.key)}
                  aria-pressed={filter.line === line.key}
                  onClick={() => update({ line: line.key })}
                >
                  <i aria-hidden="true" />
                  {line.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="katalog"
        aria-label={texts.hero.searchLabel}
        className={`pk-ocat ${HUB_CONTAINER}`}
      >
        {groups.length === 0 ? (
          <div className="pk-oempty">
            <div className="pk-oempty__text">
              <span className="pk-eb">{texts.empty.eyebrow}</span>
              <h2 className="pk-h2">{texts.empty.title}</h2>
              <p className="pk-lead">{texts.empty.lead}</p>
            </div>
            <div className="pk-oempty__cta">
              {phone && tel && (
                <a href={tel} className="pk-hbtn pk-hbtn--accent pk-hbtn--phone">
                  {phone}
                </a>
              )}
              {helpHref && (
                <a href={helpHref} className="pk-hbtn">
                  {texts.empty.help} <span aria-hidden="true">→</span>
                </a>
              )}
              <button type="button" className="pk-hbtn" onClick={reset}>
                {texts.empty.reset}
              </button>
            </div>
          </div>
        ) : (
          <div className="pk-ocat__grid">
            <div className="pk-ocat__list">
              {groups.map(({ line, items }) => (
                <div key={line.key} className="pk-ogr" style={lineStyle(line.key)}>
                  <div className="pk-ogr__head">
                    <span className="pk-ogr__who">
                      <Mark label={line.label} />
                      <span className="pk-ogr__short">{line.short}</span>
                    </span>
                    <span className="pk-ogr__meta">
                      <span>{servicesCount(items.length)}</span>
                      {line.phone && line.tel && (
                        <a href={line.tel} className="pk-ogr__phone">
                          {line.phone}
                        </a>
                      )}
                    </span>
                  </div>
                  <ul className="pk-ogr__items" role="list">
                    {items.map((service) => (
                      <li key={service.key}>
                        <button
                          type="button"
                          className="pk-osv"
                          aria-pressed={current?.key === service.key}
                          aria-controls="usluga"
                          onClick={() => pick(service.key)}
                        >
                          <span className="pk-osv__icon" aria-hidden="true">
                            <Icon name={iconForService(service.title)} />
                          </span>
                          <span className="pk-osv__text">
                            <span className="pk-osv__title">{service.title}</span>
                            <span className="pk-osv__short">{service.short}</span>
                          </span>
                          <span className="pk-osv__go" aria-hidden="true">
                            →
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {current && (
              <Detail
                ref={sheetRef}
                texts={texts.detail}
                service={current}
                line={lineOf(current.line)}
                related={current.related.flatMap(
                  (key) => services.find((service) => service.key === key) ?? [],
                )}
                lineOf={lineOf}
                open={sheet}
                onClose={() => setSheet(false)}
                onPick={pick}
              />
            )}
          </div>
        )}
      </section>
    </>
  )
}

type DetailProps = {
  ref: React.Ref<HTMLElement>
  texts: HubOffer['detail']
  service: OfferService
  line: OfferLine | undefined
  related: OfferService[]
  lineOf: (key: HubLine) => OfferLine | undefined
  open: boolean
  onClose: () => void
  onPick: (key: string) => void
}

function Detail({
  ref,
  texts,
  service,
  line,
  related,
  lineOf,
  open,
  onClose,
  onPick,
}: DetailProps) {
  return (
    <aside
      ref={ref}
      id="usluga"
      tabIndex={-1}
      aria-label={texts.label}
      className="pk-od"
      data-open={open ? '' : undefined}
      style={lineStyle(service.line)}
    >
      <div className="pk-od__top">
        <Mark label={line?.label ?? null} />
        <span className="pk-od__aud">{texts.audiences[service.audience]}</span>
        <button type="button" className="pk-od__close" onClick={onClose}>
          {texts.close}
        </button>
      </div>
      <h2 className="pk-h3 pk-od__title" aria-live="polite">
        {service.title}
      </h2>
      {service.long && <p className="pk-od__long">{service.long}</p>}
      {line && (
        <p className="pk-od__who">
          <strong>{texts.who}</strong> {line.who}
        </p>
      )}
      {service.includes.length > 0 && (
        <div className="pk-od__block">
          <span className="pk-eb pk-eb--line">{texts.includes}</span>
          <span className="pk-od__chips">
            {service.includes.map((item) => (
              <span key={item} className="pk-ocp">
                {item}
              </span>
            ))}
          </span>
        </div>
      )}
      {line && line.steps.length > 0 && (
        <div className="pk-od__block">
          <span className="pk-eb pk-eb--line">{texts.steps}</span>
          <ol className="pk-ost">
            {line.steps.map((step, index) => (
              <li key={step.title}>
                <span className="pk-ost__n" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="pk-ost__title">{step.title}</span>
                <span className="pk-ost__text">{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {line && (line.promise || line.tool) && (
        <div className="pk-od__facts">
          {line.promise && (
            <span className="pk-od__promise">
              <i aria-hidden="true" className="pk-rec" />
              {line.promise}
            </span>
          )}
          {line.tool && (
            <span>
              {texts.online}{' '}
              {line.tool.url ? <a href={line.tool.url}>{line.tool.title}</a> : line.tool.title}
            </span>
          )}
        </div>
      )}
      <div className="pk-od__cta">
        {service.cta && (
          <a href={service.cta.href} className="pk-hbtn pk-hbtn--line">
            {service.cta.label}{' '}
            <span aria-hidden="true">{service.cta.href.startsWith('/') ? '→' : '↗'}</span>
          </a>
        )}
        {line?.phone && line.tel && (
          <a href={line.tel} className="pk-hbtn pk-hbtn--on-dark pk-hbtn--phone">
            {line.phone}
          </a>
        )}
      </div>
      {related.length > 0 && (
        <div className="pk-od__block">
          <span className="pk-eb pk-eb--line">{texts.related}</span>
          <ul className="pk-orl-list" role="list">
            {related.map((item) => {
              const other = lineOf(item.line)
              return (
                <li key={item.key} style={lineStyle(item.line)}>
                  <button type="button" className="pk-orl" onClick={() => onPick(item.key)}>
                    <i aria-hidden="true" />
                    <span className="pk-orl__text">
                      <span className="pk-orl__title">{item.title}</span>
                      {other && (
                        <span className="pk-orl__meta">
                          {other.name}
                          {other.phone && ` · ${other.phone}`}
                        </span>
                      )}
                    </span>
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}
